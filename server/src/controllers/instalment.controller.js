'use strict';

/**
 * Instalment Controller
 * Public: requestAccessLink, validateToken, submitInstalmentReceipt
 * Admin: getOutstandingInstalments, updateInstalmentStatus
 * FRD FR-10, BR14-BR20
 */

import Enrollment from '../models/Enrollment.model.js';
import InstalmentPayment from '../models/InstalmentPayment.model.js';
import InstalmentToken from '../models/InstalmentToken.model.js';
import Profile from '../models/Profile.model.js';
import Settings from '../models/Settings.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { generateToken, hashToken, getInstalmentTokenExpiry } from '../helpers/tokenGenerator.helper.js';
import { validateInstalmentSubmission, getInstalmentSummary } from '../services/instalment.service.js';
import { uploadInstalmentReceipt }from '../services/upload.service.js';
import {sendInstalmentAccessLink}from '../services/email.service.js';
import {
  HTTP_STATUS, PAYMENT_STATUS, PAYMENT_TYPES,
  INSTALMENT_STATUS, AUDIT_ACTIONS,
} from '../config/constants.js';
import logger from '../utils/logger.js';

// ── Helper: update instalment email delivery status ──────────────────
const setInstalmentEmailStatus = async (instalmentId, ntfKey, result) => {
  const now = new Date();
  await InstalmentPayment.findByIdAndUpdate(instalmentId, {
    $set: {
      [`emailDeliveryStatus.${ntfKey}.attempted`]:    true,
      [`emailDeliveryStatus.${ntfKey}.sent`]:         result.success,
      [`emailDeliveryStatus.${ntfKey}.sentAt`]:       result.success ? now : null,
      [`emailDeliveryStatus.${ntfKey}.failed`]:       !result.success,
      [`emailDeliveryStatus.${ntfKey}.failedAt`]:     !result.success ? now : null,
      [`emailDeliveryStatus.${ntfKey}.errorMessage`]: result.error || null,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/my-payment
// Request one-time access link (FR-10.1)
// ALWAYS shows neutral response — prevents student enumeration
// ─────────────────────────────────────────────────────────────────────
const requestAccessLink = asyncHandler(async (req, res, next) => {
  const { emailAddress } = req.body;
  const NEUTRAL = 'If we have an enrollment on record for that email address, you will receive a link shortly.';

  const profile = await Profile.findByEmail(emailAddress);
  if (!profile) {
    return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL);
  }

  // Find confirmed instalment enrollment for this profile
  const enrollment = await Enrollment.findOne({
    profile:       profile._id,
    paymentType:   PAYMENT_TYPES.INSTALMENT,
    paymentStatus: PAYMENT_STATUS.CONFIRMED,
  }).populate('profile', 'fullName email');

  if (!enrollment) {
    return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL);
  }

  // ── BR18: Invalidate ALL previous unused tokens ────────────────
  await InstalmentToken.invalidateAllForEnrollment(enrollment._id);

  // ── Generate new one-time token ────────────────────────────────
  const { rawToken, tokenHash } = generateToken(32);
  const expiresAt = getInstalmentTokenExpiry();

  await InstalmentToken.create({
    enrollment: enrollment._id,
    email:      emailAddress.toLowerCase().trim(),
    tokenHash,
    expiresAt,
    ipAddress:  req.ip,
    userAgent:  req.headers['user-agent']?.substring(0, 500),
  });

  // ── Build access link ─────────────────────────────────────────
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const encodedEmail = encodeURIComponent(emailAddress.toLowerCase().trim());
  const accessLink = `${clientUrl}/my-payment/access?token=${rawToken}&email=${encodedEmail}`;

  // ── Send NTF-06 ───────────────────────────────────────────────
  await sendInstalmentAccessLink(
    enrollment.profile.email,
    {
      studentName: enrollment.profile.fullName,
      accessLink,
    }
  );

  return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL);
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/my-payment/access
// Validate token and return enrollment summary (FR-10.2)
// ─────────────────────────────────────────────────────────────────────
const validateTokenAndGetSummary = asyncHandler(async (req, res, next) => {
  const { token: rawToken, email } = req.query;

  if (!rawToken || !email) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'MISSING_PARAMETERS',
      'This link is invalid. Please request a new one.'
    ));
  }

  // Hash the received token for database lookup
  const tokenHash = hashToken(rawToken);
  const tokenDoc = await InstalmentToken.findByHash(tokenHash);

  // ── Token validation states (FRD FR-10.2 table) ───────────────
  if (!tokenDoc) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_TOKEN',
      'This link is invalid. Please request a new one.'
    ));
  }

  if (tokenDoc.isUsed) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'TOKEN_ALREADY_USED',
      'This link has already been used. Please request a new one.'
    ));
  }

  if (tokenDoc.isInvalidated) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'TOKEN_INVALID',
      'This link is invalid. Please request a new one.'
    ));
  }

  if (tokenDoc.expiresAt < new Date()) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'TOKEN_EXPIRED',
      'This link has expired. Please request a new one.'
    ));
  }

  // ── Mark token as used (FRD: "when student loads enrollment summary page") ──
  await tokenDoc.markAsUsed();

  // ── Get enrollment summary ────────────────────────────────────
  const enrollment = await Enrollment.findById(tokenDoc.enrollment)
    .populate('profile', 'fullName email')
    .populate('programme', 'name fees')
    .populate('cohort', 'name startDate deliveryFormat');

  if (!enrollment) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found.'));
  }

  const summary = await getInstalmentSummary(enrollment._id);
  const settings = await Settings.getSettings();

  // Strip internal file-reference fields from the student-facing view.
  // Students never need a receipt.url/publicId/provider — that information
  // exists purely for admin review. Only status, amount, and dates matter here.
  const studentSafeRecords = summary.records.map((record) => {
    // eslint-disable-next-line no-unused-vars
    const { receipt, ...rest } = record;
    return rest;
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      enrollment: {
        id:             enrollment._id,
        fullName:       enrollment.profile.fullName,
        programmeName:  enrollment.programme.name,
        cohortName:     enrollment.cohort?.name || 'TBD',
        deliveryFormat: enrollment.deliveryFormat,
        paymentType:    enrollment.paymentType,
      },
      instalment: { ...summary, records: studentSafeRecords },
      bankDetails: settings.bankDetails,
    },
    'Enrollment summary retrieved successfully.'
  );
});


// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/my-payment/submit
// Submit next instalment receipt (FR-10.3)
// ─────────────────────────────────────────────────────────────────────
const submitInstalmentReceipt = asyncHandler(async (req, res, next) => {
  const { enrollmentId, instalmentNumber } = req.body;
  const file = req.file;
  const now = new Date();

  const enrollment = await Enrollment.findOne({
    _id:          enrollmentId,
    paymentType:  PAYMENT_TYPES.INSTALMENT,
    paymentStatus: PAYMENT_STATUS.CONFIRMED,
  }).populate('profile', 'fullName email')
    .populate('programme', 'name fees');

  if (!enrollment) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'ENROLLMENT_NOT_FOUND',
      'Enrollment not found or not eligible for instalment submission.'
    ));
  }

  // ── Validate submission (BR14, BR15) ──────────────────────────
  const targetRecord = await validateInstalmentSubmission(
    enrollment._id,
    Number(instalmentNumber)
  );

  // ── Upload receipt ────────────────────────────────────────────
  let receiptData;
  try {
    receiptData = await uploadInstalmentReceipt(file);
  } catch (uploadErr) {
    return next(new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'UPLOAD_FAILED',
      'Something went wrong uploading your receipt. Please contact us on WhatsApp.'
    ));
  }

  // ── Update instalment record to Pending ───────────────────────
  await InstalmentPayment.findByIdAndUpdate(targetRecord._id, {
    $set: {
      status:      INSTALMENT_STATUS.PENDING,
      receipt:     receiptData,
      submittedAt: now,
    },
  });

  // ── Send NTF-07 ───────────────────────────────────────────────
  const settings = await Settings.getSettings();
  const emailResult = await emailService.sendInstalmentReceiptAcknowledgment(
    enrollment.profile.email,
    {
      studentName:      enrollment.profile.fullName,
      programmeName:    enrollment.programme.name,
      instalmentNumber: Number(instalmentNumber),
      amount:           targetRecord.expectedAmount,
      whatsappLink:     settings.whatsapp?.link || '',
    }
  );

  await setInstalmentEmailStatus(targetRecord._id, 'ntf07', emailResult);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { instalmentNumber: Number(instalmentNumber) },
    'Your receipt has been submitted. We will confirm your payment within 2 to 3 business days.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN: PATCH /api/v1/admin/instalments/:id/status
// Confirm or reject an instalment payment (FR-10.4)
// ─────────────────────────────────────────────────────────────────────
const updateInstalmentStatus = asyncHandler(async (req, res, next) => {
  const { status: newStatus, rejectionReason } = req.body;
  const now = new Date();

  const instalmentRecord = await InstalmentPayment.findById(req.params.id)
    .populate('enrollment')
    .populate({
      path: 'enrollment',
      populate: [
        { path: 'profile', select: 'fullName email' },
        { path: 'programme', select: 'name' },
      ],
    });

  if (!instalmentRecord) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'INSTALMENT_NOT_FOUND', 'Instalment record not found.'));
  }

  if (instalmentRecord.status !== INSTALMENT_STATUS.PENDING) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_STATE',
      'Only Pending instalment records can be confirmed or rejected.'
    ));
  }

  if (newStatus === 'rejected' && !rejectionReason?.trim()) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'REJECTION_REASON_REQUIRED',
      'A rejection reason is required when rejecting an instalment payment.'
    ));
  }

  const updateData = {
    status:    newStatus,
    actionedBy: req.account._id,
    actionedAt: now,
  };

  if (newStatus === 'confirmed') {
    updateData.confirmedAt = now;
    updateData.rejectionReason = null;
  }
  if (newStatus === 'rejected') {
    updateData.rejectionReason = rejectionReason.trim();
  }

  await InstalmentPayment.findByIdAndUpdate(instalmentRecord._id, { $set: updateData });

  const enrollment   = instalmentRecord.enrollment;
  const profile      = enrollment.profile;
  const programmeName = enrollment.programme.name;
  const settings     = await Settings.getSettings();
  const whatsappLink = settings.whatsapp?.link || '';

  // ── Send email ────────────────────────────────────────────────
  let emailResult;

  if (newStatus === 'confirmed') {
    emailResult = await emailService.sendInstalmentConfirmed(
      profile.email,
      {
        studentName:      profile.fullName,
        programmeName,
        instalmentNumber: instalmentRecord.instalmentNumber,
        amount:           instalmentRecord.expectedAmount,
        whatsappLink,
      }
    );
    await setInstalmentEmailStatus(instalmentRecord._id, 'ntf08', emailResult);

    // ── Check if all instalments are now confirmed (NTF-10) ───
    const isFullyPaid = await InstalmentPayment.isFullyPaid(enrollment._id);
    if (isFullyPaid) {
      const ntf10Result = await emailService.sendAllInstalmentsComplete(
        profile.email,
        { studentName: profile.fullName, programmeName, whatsappLink }
      );
      logger.info('NTF-10 sent — all instalments complete', {
        enrollmentId: enrollment._id,
        emailSent: ntf10Result.success,
      });
    }

    await req.logAction(AUDIT_ACTIONS.INSTALMENT_CONFIRMED, {
      targetModel: 'InstalmentPayment',
      targetId: instalmentRecord._id,
      description: `Instalment ${instalmentRecord.instalmentNumber} confirmed for: ${profile.fullName}`,
    });
  } else {
    emailResult = await emailService.sendInstalmentRejected(
      profile.email,
      {
        studentName:      profile.fullName,
        programmeName,
        instalmentNumber: instalmentRecord.instalmentNumber,
        rejectionReason:  rejectionReason.trim(),
        whatsappLink,
      }
    );
    await setInstalmentEmailStatus(instalmentRecord._id, 'ntf09', emailResult);

    await req.logAction(AUDIT_ACTIONS.INSTALMENT_REJECTED, {
      targetModel: 'InstalmentPayment',
      targetId: instalmentRecord._id,
      description: `Instalment ${instalmentRecord.instalmentNumber} rejected for: ${profile.fullName}. Reason: ${rejectionReason.trim()}`,
    });
  }

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Instalment ${instalmentRecord.instalmentNumber} ${newStatus} successfully.`
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/v1/admin/instalments/outstanding
// Outstanding Instalments filter (FR-10.4)
// ─────────────────────────────────────────────────────────────────────
const getOutstandingInstalments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const now = new Date();

  const filter = {
    status:           { $in: [INSTALMENT_STATUS.NOT_SUBMITTED, INSTALMENT_STATUS.REJECTED] },
    instalmentNumber: { $in: [2, 3] },
  };

  const [total, records] = await Promise.all([
    InstalmentPayment.countDocuments(filter),
    InstalmentPayment.find(filter)
      .populate({
        path: 'enrollment',
        populate: [
          { path: 'profile', select: 'fullName email phone' },
          { path: 'programme', select: 'name' },
          { path: 'cohort',   select: 'name startDate' },
        ],
      })
      .skip(skip)
      .limit(limit),
  ]);

  // Add computed isOverdue flag and sort: overdue first, then by cohort start date
  const enriched = records
    .map((r) => {
      const plain = r.toObject({ virtuals: true });
      return plain;
    })
    .sort((a, b) => {
      // Overdue records always come first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      // Within same group, sort by cohort start date ascending
      const aDate = a.enrollment?.cohort?.startDate || new Date(0);
      const bDate = b.enrollment?.cohort?.startDate || new Date(0);
      return new Date(aDate) - new Date(bDate);
    });

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    enriched,
    'Outstanding instalment records retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

export {
  requestAccessLink,
  validateTokenAndGetSummary,
  submitInstalmentReceipt,
  updateInstalmentStatus,
  getOutstandingInstalments,
};