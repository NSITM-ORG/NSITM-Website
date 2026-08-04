'use strict';

/**
 * Payment Controller
 * Admin + Super Admin: updatePaymentStatus, reversePaymentStatus
 * FRD FR-03, FR-04.5, FR-05.5, Business Rules BR02-BR05
 */

import Enrollment from '../models/Enrollment.model.js';
import Cohort from '../models/Cohort.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from  '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { createInstalmentRecords } from '../services/instalment.service.js';
import {sendInstalmentAccessLink}from '../services/email.service.js';
import Settings from '../models/Settings.model.js';
import {
  HTTP_STATUS, PAYMENT_STATUS, PAYMENT_TYPES, ROLES,
  PAYMENT_STATUS_TRANSITIONS, INVALID_PAYMENT_TRANSITIONS, AUDIT_ACTIONS,
} from '../config/constants.js';
import logger from '../utils/logger.js';

// ── Helper: validate a status transition ────────────────────────────
const validateStatusTransition = (currentStatus, newStatus, actorRole) => {
  // Check for explicitly invalid transitions (BR02, BR03)
  const isInvalid = INVALID_PAYMENT_TRANSITIONS.some(
    (t) => t.from === currentStatus && t.to === newStatus
  );
  if (isInvalid) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition payment status from '${currentStatus}' to '${newStatus}'.`
    );
  }

  const transition = PAYMENT_STATUS_TRANSITIONS[currentStatus];
  if (!transition || !transition.allowed.includes(newStatus)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition payment status from '${currentStatus}' to '${newStatus}'.`
    );
  }

  // Check role permission for this specific transition (BR05)
  if (!transition.roles.includes(actorRole) && !transition.roles.includes('system')) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'PERMISSION_DENIED',
      `Your role does not permit transitioning payment status from '${currentStatus}' to '${newStatus}'.`
    );
  }
};

// ── Helper: update email delivery status on enrollment ──────────────
const setEmailDeliveryStatus = async (enrollmentId, ntfKey, result) => {
  const now = new Date();
  await Enrollment.findByIdAndUpdate(enrollmentId, {
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
// ADMIN + SUPER ADMIN: PATCH /api/v1/admin/payments/:id/status
// Confirm or Reject a pending payment (FR-04.5)
// ─────────────────────────────────────────────────────────────────────
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { paymentStatus: newStatus, rejectionReason } = req.body;
  const actorRole = req.account.role;
  const now = new Date();

  const enrollment = await Enrollment.findById(req.params.id)
    .populate('profile', 'fullName email')
    .populate('programme', 'name fees')
    .populate('cohort', 'name startDate whatsappGroupLink');

  if (!enrollment) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'ENROLLMENT_NOT_FOUND', 'Enrollment record not found.'));
  }

  // ── Validate transition ───────────────────────────────────────
  validateStatusTransition(enrollment.paymentStatus, newStatus, actorRole);

  // ── Validate rejection reason (BR04) ─────────────────────────
  if (newStatus === PAYMENT_STATUS.REJECTED && !rejectionReason?.trim()) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'REJECTION_REASON_REQUIRED',
      'Please enter a rejection reason before saving.'
    ));
  }

  // ── Special case: Confirming an instalment student ────────────
  // Must create InstalmentPayment records BEFORE updating status.
  // If record creation fails, the entire confirmation is aborted (FRD QA check).
  if (newStatus === PAYMENT_STATUS.CONFIRMED && enrollment.paymentType === PAYMENT_TYPES.INSTALMENT) {
    await createInstalmentRecords(enrollment, now, req.account._id);
    // If this throws, the catch in asyncHandler returns the error to the admin.
    // The enrollment status is NOT updated.
  }

  // ── Update enrollment status ──────────────────────────────────
  const updateData = {
    paymentStatus: newStatus,
    actionedBy:    req.account._id,
    actionedAt:    now,
  };

  if (newStatus === PAYMENT_STATUS.CONFIRMED) {
    updateData.confirmedAt = now;
  }
  if (newStatus === PAYMENT_STATUS.REJECTED) {
    updateData.rejectionReason = rejectionReason.trim();
  }
  if (newStatus === PAYMENT_STATUS.PENDING && enrollment.paymentStatus === PAYMENT_STATUS.REJECTED) {
    // Rejected → Pending: clear the rejection reason to allow resubmission
    updateData.rejectionReason = null;
  }

  await Enrollment.findByIdAndUpdate(enrollment._id, { $set: updateData });

  // ── Update cohort confirmed count ─────────────────────────────
  if (newStatus === PAYMENT_STATUS.CONFIRMED && enrollment.cohort?._id) {
    await Cohort.findByIdAndUpdate(enrollment.cohort._id, {
      $inc: { confirmedEnrollmentCount: 1 },
    });
  }

  // ── Get settings for email ────────────────────────────────────
  const settings = await Settings.getSettings();
  const whatsappLink = settings.whatsapp?.link || '';

  // ── Send automated email ──────────────────────────────────────
  let emailResult;

  if (newStatus === PAYMENT_STATUS.CONFIRMED) {
    emailResult = await emailService.sendPaymentConfirmed(
      enrollment.profile.email,
      {
        studentName:       enrollment.profile.fullName,
        programmeName:     enrollment.programme.name,
        cohortName:        enrollment.cohort?.name || 'your cohort',
        startDate:         enrollment.cohort?.startDate
          ? new Date(enrollment.cohort.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'TBD',
        cohortWhatsappLink: enrollment.cohort?.whatsappGroupLink || null,
        whatsappLink,
      }
    );
    await setEmailDeliveryStatus(enrollment._id, 'ntf02', emailResult);

    await req.logAction(AUDIT_ACTIONS.PAYMENT_CONFIRMED, {
      targetModel: 'Enrollment',
      targetId: enrollment._id,
      description: `Payment confirmed for: ${enrollment.profile.fullName} (${enrollment.programme.name})`,
      metadata: { emailSent: emailResult.success, studentEmail: enrollment.profile.email },
    });
  } else if (newStatus === PAYMENT_STATUS.REJECTED) {
    emailResult = await emailService.sendPaymentRejected(
      enrollment.profile.email,
      {
        studentName:      enrollment.profile.fullName,
        programmeName:    enrollment.programme.name,
        rejectionReason:  rejectionReason.trim(),
        whatsappLink,
      }
    );
    await setEmailDeliveryStatus(enrollment._id, 'ntf03', emailResult);

    await req.logAction(AUDIT_ACTIONS.PAYMENT_REJECTED, {
      targetModel: 'Enrollment',
      targetId: enrollment._id,
      description: `Payment rejected for: ${enrollment.profile.fullName}. Reason: ${rejectionReason.trim()}`,
      metadata: { rejectionReason: rejectionReason.trim(), emailSent: emailResult.success },
    });
  }

  // Fetch the updated enrollment to return
  const updatedEnrollment = await Enrollment.findById(enrollment._id)
    .populate('profile', 'fullName email')
    .populate('programme', 'name')
    .populate('actionedBy', 'email');

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      enrollment: updatedEnrollment,
      emailSent: emailResult?.success ?? null,
      emailFailed: emailResult ? !emailResult.success : null,
    },
    `Payment status updated to '${newStatus}' successfully.`
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN ONLY: PATCH /api/v1/superadmin/payments/:id/reverse
// Reverse Confirmed → Pending (FR-05.5, BR05)
// ─────────────────────────────────────────────────────────────────────
const reversePaymentStatus = asyncHandler(async (req, res, next) => {
  const { reversalReason } = req.body;
  const now = new Date();

  if (!reversalReason?.trim()) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'REVERSAL_REASON_REQUIRED',
      'Please enter the reason for reversing this confirmation.'
    ));
  }

  const enrollment = await Enrollment.findById(req.params.id)
    .populate('profile', 'fullName email')
    .populate('programme', 'name');

  if (!enrollment) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'ENROLLMENT_NOT_FOUND', 'Enrollment record not found.'));
  }

  if (enrollment.paymentStatus !== PAYMENT_STATUS.CONFIRMED) {
    return next(new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_STATUS_TRANSITION',
      'Only Confirmed records can be reversed to Pending.'
    ));
  }

  await Enrollment.findByIdAndUpdate(enrollment._id, {
    $set: {
      paymentStatus:   PAYMENT_STATUS.PENDING,
      reversalReason:  reversalReason.trim(),
      reversedBy:      req.account._id,
      reversedAt:      now,
      confirmedAt:     null,
    },
  });

  // Decrement cohort confirmed count
  if (enrollment.cohort) {
    await Cohort.findByIdAndUpdate(enrollment.cohort, {
      $inc: { confirmedEnrollmentCount: -1 },
    });
  }

  // FRD FR-05.5: "No automated email is sent to the student on this reversal."
  // Super Admin handles any student communication manually.

  await req.logAction(AUDIT_ACTIONS.PAYMENT_REVERSED, {
    targetModel: 'Enrollment',
    targetId: enrollment._id,
    description: `Payment confirmation reversed for: ${enrollment.profile.fullName}. Reason: ${reversalReason.trim()}`,
    metadata: { reversalReason: reversalReason.trim() },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    'Payment status has been reversed to Pending. The student record is now available for re-review.'
  );
});

export { updatePaymentStatus, reversePaymentStatus };