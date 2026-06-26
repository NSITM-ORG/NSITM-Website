'use strict';

/**
 * Instalment Service
 *
 * Handles all business logic for the instalment payment lifecycle.
 *
 * PRIMARY RESPONSIBILITY — createInstalmentRecords():
 *   This is the most critical operation. It is called as a SIDE EFFECT
 *   of the payment controller confirming the initial payment for an
 *   instalment-plan student.
 *
 *   FRD QA checklist:
 *   "If the instalment record creation fails, the payment confirmation
 *    does not proceed — the student record status is not changed."
 *
 *   Implementation: if InstalmentPayment.insertMany() throws, the error
 *   propagates to the payment controller which then aborts the confirmation.
 *
 * SECONDARY RESPONSIBILITIES:
 *   - getEnrollmentInstalmentSummary(): builds the instalment progress
 *     data for both the student-facing /my-payment page and admin dashboard
 *   - validateInstalmentSubmission(): enforces sequence and duplicate checks
 *   - computeInstalmentCompletionState(): derives fully_paid / partially_paid state
 */

import InstalmentPayment from '../models/InstalmentPayment.model.js';
import Enrollment from '../models/Enrollment.model.js';
import ApiError from '../utils/ApiError.js';
import {
  buildInstalmentRecords,
  computeCompletionState,
} from '../helpers/instalmentCalculator.helper.js';
import { HTTP_STATUS, INSTALMENT_STATUS, PAYMENT_COMPLETION_STATES } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Create the three InstalmentPayment records when the initial payment is confirmed.
 *
 * Called exclusively from payment.controller.js → confirmPayment,
 * BEFORE the enrollment status is updated.
 *
 * If this throws, the payment confirmation is aborted.
 *
 * @param {Object} enrollment - Populated Enrollment document (with programme populated)
 * @param {Date} confirmationDate - The time of confirmation (new Date() from controller)
 * @param {ObjectId} actionedBy - The admin Account._id performing the confirmation
 * @returns {Promise<InstalmentPayment[]>} The 3 created InstalmentPayment documents
 * @throws {Error} If record creation fails (propagates to abort payment confirmation)
 */
const createInstalmentRecords = async (enrollment, confirmationDate, actionedBy) => {
  const programme = enrollment.programme;

  if (!programme || !programme.fees) {
    throw new Error(
      'Cannot create instalment records: programme fee data is not populated on the enrollment record.'
    );
  }

  const recordData = buildInstalmentRecords({
    enrollmentId:     enrollment._id,
    profileId:        enrollment.profile._id || enrollment.profile,
    programme,
    confirmationDate,
    actionedBy,
  });

  try {
    // insertMany with ordered: true — if any document fails, the error is thrown
    // and previously inserted documents in this batch are rolled back by MongoDB
    // (as each document in insertMany is individually inserted, partial inserts
    // can occur. We handle this with a cleanup block below).
    const created = await InstalmentPayment.insertMany(recordData, { ordered: true });

    logger.info('Instalment records created successfully', {
      enrollmentId: enrollment._id,
      records: created.map((r) => ({ number: r.instalmentNumber, amount: r.expectedAmount, status: r.status })),
    });

    return created;
  } catch (err) {
    // Cleanup: if any records were partially inserted, remove them
    // to prevent orphaned instalment data from blocking future confirmations
    await InstalmentPayment.deleteMany({ enrollment: enrollment._id }).catch((cleanupErr) => {
      logger.error('Failed to cleanup partial instalment records after creation error', {
        enrollmentId: enrollment._id,
        cleanupError: cleanupErr.message,
      });
    });

    logger.error('Instalment record creation failed — payment confirmation aborted', {
      enrollmentId: enrollment._id,
      error: err.message,
    });

    // Re-throw so the payment controller knows to abort
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'INSTALMENT_RECORD_CREATION_FAILED',
      'Failed to initialize instalment records. The payment confirmation was not completed. Please try again.'
    );
  }
};

/**
 * Validate that a student can submit a receipt for the next instalment.
 *
 * Enforces:
 *   BR14 — Instalments must be submitted in sequence (can't submit 2 before 1 is confirmed)
 *   BR15 — Cannot submit for an instalment that already has a Pending or Confirmed record
 *
 * @param {ObjectId} enrollmentId
 * @param {number} instalmentNumber - The instalment the student is trying to submit (2 or 3)
 * @throws {ApiError} 400 if previous instalment not confirmed (BR14)
 * @throws {ApiError} 409 if the target instalment already has a Pending/Confirmed record (BR15)
 * @returns {Promise<InstalmentPayment>} The target instalment record (to be updated)
 */
const validateInstalmentSubmission = async (enrollmentId, instalmentNumber) => {
  // Get all instalment records for this enrollment
  const records = await InstalmentPayment.getForEnrollment(enrollmentId);

  if (!records || records.length === 0) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'INSTALMENT_RECORDS_NOT_FOUND',
      'No instalment records found for this enrollment. Please contact us on WhatsApp.'
    );
  }

  // ── BR14: Check previous instalment is confirmed ─────────────
  if (instalmentNumber > 1) {
    const previousRecord = records.find((r) => r.instalmentNumber === instalmentNumber - 1);

    if (!previousRecord || previousRecord.status !== INSTALMENT_STATUS.CONFIRMED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'PREVIOUS_INSTALMENT_NOT_CONFIRMED',
        `You cannot submit instalment ${instalmentNumber} until instalment ${instalmentNumber - 1} has been confirmed by our team. Please wait for the confirmation email.`
      );
    }
  }

  // ── BR15: Check target instalment is not already active ──────
  const targetRecord = records.find((r) => r.instalmentNumber === instalmentNumber);

  if (!targetRecord) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'INSTALMENT_RECORD_NOT_FOUND',
      `Instalment ${instalmentNumber} record not found. Please contact us on WhatsApp.`
    );
  }

  if (
    targetRecord.status === INSTALMENT_STATUS.PENDING ||
    targetRecord.status === INSTALMENT_STATUS.CONFIRMED
  ) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'INSTALMENT_ALREADY_ACTIVE',
      `Instalment ${instalmentNumber} has already been ${targetRecord.status}. No further action is needed for this instalment.`
    );
  }

  return targetRecord;
};

/**
 * Get the complete instalment progress summary for an enrollment.
 * Used by both the student-facing /my-payment/access page and admin dashboard.
 *
 * Adds the computed `isOverdue` flag and `statusLabel` to each record.
 * Adds the computed `completionState` for the enrollment overall.
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<{ records: Array, completionState: string, nextOutstanding: InstalmentPayment|null }>}
 */
const getInstalmentSummary = async (enrollmentId) => {
  const records = await InstalmentPayment.getForEnrollment(enrollmentId);
  const nextOutstanding = await InstalmentPayment.getNextOutstanding(enrollmentId);
  const completionState = computeCompletionState(records);

  // Add computed display fields to each record (not stored in DB)
  const enrichedRecords = records.map((record) => {
    const plain = record.toObject({ virtuals: true });
    return plain;
  });

  return {
    records: enrichedRecords,
    completionState,
    nextOutstanding,
    isFullyPaid: completionState === PAYMENT_COMPLETION_STATES.FULLY_PAID,
  };
};

/**
 * Get all instalment students with at least one outstanding instalment.
 * For the "Outstanding Instalments" admin dashboard filter.
 *
 * FRD FR-10.4:
 *   "Shows all instalment students with at least one instalment that is
 *    not yet Confirmed. Overdue records are sorted to the top."
 *
 * @param {Object} [filters] - Optional additional filters (cohortId, etc.)
 * @returns {Promise<Array>} Enrollment IDs with outstanding instalments
 */
const getOutstandingInstalmentEnrollmentIds = async (filters = {}) => {
  const now = new Date();

  // Find all instalment records that are not yet confirmed
  const outstandingRecords = await InstalmentPayment.find({
    status: { $in: [INSTALMENT_STATUS.NOT_SUBMITTED, INSTALMENT_STATUS.REJECTED] },
    instalmentNumber: { $in: [2, 3] }, // Only instalments with due dates
    ...filters,
  }).distinct('enrollment');

  return outstandingRecords;
};

export {
  createInstalmentRecords,
  validateInstalmentSubmission,
  getInstalmentSummary,
  getOutstandingInstalmentEnrollmentIds,
};