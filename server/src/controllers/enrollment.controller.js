'use strict';

/**
 * Enrollment Controller
 * Public: createPartialRecord (Step 1), updatePartialRecord, completeEnrollment (Step 4)
 * Admin: getAllEnrollments, getEnrollmentById, getDashboardOverview
 * FRD FR-02, FR-04.2, FR-04.3, FR-07, FR-08
 */

import Enrollment from '../models/Enrollment.model.js';
import Programme from '../models/Programme.model.js';
import Cohort from '../models/Cohort.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { resolveStudentProfile } from '../helpers/profileResolver.helper.js';
import { findExistingPartialRecord, assertNoActiveEnrollment, findLatestPartialRecord } from '../helpers/duplicateChecker.helper.js';
import { uploadEnrollmentReceipt } from '../services/upload.service.js';
import { sendEnrollmentAcknowledgment } from '../services/email.service.js';
import { HTTP_STATUS, PAYMENT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/enrollment/partial
// Step 1 advancement — creates partial Not Paid record (FR-08, FR-02.1)
// ─────────────────────────────────────────────────────────────────────
const createPartialRecord = asyncHandler(async (req, res, next) => {
  const {
    fullName, phoneNumber, emailAddress, whatsappNumber,
    programme: programmeId, deliveryFormat, referralCode,
  } = req.body;

  // ── Verify programme exists and is active ─────────────────────
  const programme = await Programme.findOne({
    _id: programmeId,
    isDeleted: false,
  }).populate('activeCohort', '_id name');

  if (!programme) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'PROGRAMME_NOT_FOUND',
      'The selected programme was not found. Please select a valid programme.'
    ));
  }

  // ── Resolve or create Profile (centralized identity) ─────────
  const { profile } = await resolveStudentProfile({
    fullName, phoneNumber, emailAddress, whatsappNumber,
  });

  // ── Duplicate detection: check for existing Not Paid record ──
  const existingPartial = await findExistingPartialRecord(profile._id, programme._id);

  let enrollment;

  if (existingPartial) {
    // FRD FR-07.3: "Update the existing record's fields with newly submitted values"
    existingPartial.programme     = programme._id;
    existingPartial.cohort        = programme.activeCohort?._id || null;
    existingPartial.deliveryFormat = deliveryFormat || existingPartial.deliveryFormat;
    existingPartial.referralCode  = referralCode !== undefined ? referralCode || null : existingPartial.referralCode;
    await existingPartial.save();
    enrollment = existingPartial;
  } else {
    // Create new partial enrollment record
    enrollment = await Enrollment.create({
      profile:          profile._id,
      programme:        programme._id,
      cohort:           programme.activeCohort?._id || null,
      deliveryFormat:   deliveryFormat || null,
      referralCode:     referralCode || null,
      paymentStatus:    PAYMENT_STATUS.NOT_PAID,
      isPartialEnrollment: true,
    });

    // Increment cohort enrollment count (if cohort is assigned)
    if (programme.activeCohort?._id) {
      await Cohort.findByIdAndUpdate(programme.activeCohort._id, {
        $inc: { currentEnrollmentCount: 1 },
      });
    }
  }

  // Per FRD FR-08.1: "If the backend write fails, error is logged silently.
  // The form still advances — the user must not see a blocking error."
  // (asyncHandler will catch DB errors; we return success here regardless)

  return sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    {
      enrollmentId:  enrollment._id,
      programmeSlug: programme.slug,
      isExisting:    !!existingPartial,
    },
    'Enrollment record created. Please proceed to the next step.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: PATCH /api/v1/public/enrollment/partial/:id
// Programme field real-time update (FR-08.3)
// ─────────────────────────────────────────────────────────────────────
const updatePartialRecord = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { programme: programmeId } = req.body;

  const enrollment = await Enrollment.findOne({
    _id: id,
    paymentStatus: PAYMENT_STATUS.NOT_PAID,
    isPartialEnrollment: true,
  });

  if (!enrollment) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'ENROLLMENT_NOT_FOUND',
      'Enrollment record not found or is no longer editable.'
    ));
  }

  const programme = await Programme.findOne({ _id: programmeId, isDeleted: false })
    .populate('activeCohort', '_id');

  if (!programme) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'PROGRAMME_NOT_FOUND',
      'Selected programme not found.'
    ));
  }

  // FRD FR-08.3: Update programme field. enrollmentTimestamp (createdAt) NOT updated.
  // updateOne bypasses the pre-save hook for timestamps.
  await Enrollment.findByIdAndUpdate(id, {
    $set: {
      programme: programme._id,
      cohort: programme.activeCohort?._id || null,
    },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { enrollmentId: id, programme: programme.name },
    'Programme selection updated.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/enrollment/complete
// Step 4 — receipt upload and enrollment submission (FR-02.4, FR-07)
// ─────────────────────────────────────────────────────────────────────
const completeEnrollment = asyncHandler(async (req, res, next) => {
  const { enrollmentId, paymentType, depositAmount } = req.body;
  const file = req.file; // Set by uploadEnrollmentReceipt middleware

  // ── Find the partial enrollment record ────────────────────────
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    paymentStatus: PAYMENT_STATUS.NOT_PAID,
    isPartialEnrollment: true,
  }).populate('profile', 'fullName email')
    .populate('programme', 'name slug')
    .populate('cohort', 'name');

  if (!enrollment) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'ENROLLMENT_NOT_FOUND',
      'Enrollment record not found. Your previous progress may have expired. Please start the form again.'
    ));
  }

  // ── BR01: Check for existing active enrollment (Pending/Confirmed) ──
  await assertNoActiveEnrollment(enrollment.profile._id, enrollment.programme._id);

  // ── Upload receipt file ───────────────────────────────────────
  let receiptData;
  try {
    receiptData = await uploadEnrollmentReceipt(file);
  } catch (uploadErr) {
    logger.error('Receipt upload failed during enrollment completion', {
      enrollmentId,
      error: uploadErr.message,
    });
    return next(new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'UPLOAD_FAILED',
      'Something went wrong with your submission. Please contact us on WhatsApp to complete your enrollment.'
    ));
  }

  // ── Update enrollment record to Pending ───────────────────────
  const now = new Date();
  enrollment.paymentType        = paymentType;
  enrollment.depositAmount      = depositAmount ? Number(depositAmount) : null;
  enrollment.receipt            = receiptData;
  enrollment.paymentStatus      = PAYMENT_STATUS.PENDING;
  enrollment.isPartialEnrollment = false;
  enrollment.submissionTimestamp = now;
  await enrollment.save();

  // ── Send NTF-01 acknowledgment email ──────────────────────────
  const settings = await require('../models/Settings.model').getSettings();
  const emailResult = await sendEnrollmentAcknowledgment(
    enrollment.profile.email,
    {
      studentName:  enrollment.profile.fullName,
      programmeName: enrollment.programme.name,
      whatsappLink: settings.whatsapp?.link || '',
    }
  );

  // Update email delivery status (NTF-01)
  await Enrollment.findByIdAndUpdate(enrollment._id, {
    $set: {
      'emailDeliveryStatus.ntf01.attempted':    true,
      'emailDeliveryStatus.ntf01.sent':         emailResult.success,
      'emailDeliveryStatus.ntf01.sentAt':       emailResult.success ? now : null,
      'emailDeliveryStatus.ntf01.failed':       !emailResult.success,
      'emailDeliveryStatus.ntf01.failedAt':     !emailResult.success ? now : null,
      'emailDeliveryStatus.ntf01.errorMessage': emailResult.error || null,
    },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { enrollmentId: enrollment._id },
    'Your enrollment has been submitted. We have received your payment receipt and will confirm your payment within 2 to 3 business days. Check your email for confirmation.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/v1/admin/enrollments
// Student record list with filters (FR-04.3)
// ─────────────────────────────────────────────────────────────────────
const getAllEnrollments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, programme, cohort, fromDate, toDate, search } = req.query;

  const filter = {};
  if (status)    filter.paymentStatus = status;
  if (programme) filter.programme = programme;
  if (cohort)    filter.cohort = cohort;

  // Date range filter on enrollment timestamp
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate)   filter.createdAt.$lte = new Date(toDate);
  }

  // Search by student name or email — requires profile join
  let profileIds;
  if (search) {
    const matchingProfiles = await require('../models/Profile.model').find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).distinct('_id');
    filter.profile = { $in: matchingProfiles };
  }

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('profile', 'fullName email phone whatsappNumber')
      .populate('programme', 'name slug category')
      .populate('cohort', 'name startDate deliveryFormat')
      .populate('actionedBy', 'email role')
      .sort({ createdAt: 1 }) // FRD FR-04.3: oldest first by default
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    enrollments,
    'Enrollment records retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/v1/admin/enrollments/:id
// Single enrollment detail (FR-04.5)
// ─────────────────────────────────────────────────────────────────────
const getEnrollmentById = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('profile', 'fullName email phone whatsappNumber')
    .populate('programme', 'name slug category fees')
    .populate('cohort', 'name startDate endDate deliveryFormat whatsappGroupLink')
    .populate('actionedBy', 'email role')
    .populate('reversedBy', 'email role');

  if (!enrollment) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'ENROLLMENT_NOT_FOUND', 'Enrollment record not found.'));
  }

  // Attach instalment records if paymentType is instalment
  let instalmentSummary = null;
  if (enrollment.paymentType === 'instalment' && enrollment.paymentStatus === PAYMENT_STATUS.CONFIRMED) {
    const { getInstalmentSummary } = require('../services/instalment.service');
    instalmentSummary = await getInstalmentSummary(enrollment._id);
  }

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { enrollment, instalmentSummary },
    'Enrollment record retrieved successfully.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/v1/admin/dashboard
// Overview metrics (FR-04.2)
// ─────────────────────────────────────────────────────────────────────
const getDashboardOverview = asyncHandler(async (req, res, next) => {
  const [statusCounts, activeCohortCount, recentActivity] = await Promise.all([
    Enrollment.getDashboardCounts(),
    require('../models/Cohort.model').countDocuments({
      status: 'active',
      isDeleted: false,
    }),
    // Recent activity: last 10 payment status changes in audit log
    require('../models/AuditLog.model').find({
      action: {
        $in: [
          AUDIT_ACTIONS.PAYMENT_CONFIRMED,
          AUDIT_ACTIONS.PAYMENT_REJECTED,
          AUDIT_ACTIONS.PAYMENT_REVERSED,
          AUDIT_ACTIONS.INSTALMENT_CONFIRMED,
          AUDIT_ACTIONS.INSTALMENT_REJECTED,
        ],
      },
    })
      .populate('actor', 'email role')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      metrics: {
        totalEnrolled:     statusCounts.totalEnrolled,
        pendingReviews:    statusCounts.pendingReviews,
        confirmedPayments: statusCounts.confirmedPayments,
        rejectedPayments:  statusCounts.rejectedPayments,
        notPaid:           statusCounts.notPaid,
        activeCohorts:     activeCohortCount,
      },
      recentActivity,
    },
    'Dashboard overview retrieved successfully.'
  );
});

export {
  createPartialRecord,
  updatePartialRecord,
  completeEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  getDashboardOverview,
};