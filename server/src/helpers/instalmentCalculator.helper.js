'use strict';

/**
 * Instalment Calculator Helper
 *
 * Calculates the amounts and due dates for the three instalment payments.
 *
 * AMOUNT SOURCE (priority order):
 *   1. Programme's fees.instalment.breakdown array (set by Super Admin — exact amounts)
 *   2. Calculated from fees.instalment.total using 40/30/30 split (fallback)
 *
 * Using the stored breakdown is preferred because Super Admin sets the
 * exact amounts per programme (e.g. ₦152,000 / ₦114,000 / ₦114,000 for
 * Fullstack — these are not perfectly divisible from the 40/30/30 formula).
 *
 * DUE DATE CALCULATION (FRD BR19):
 *   Instalment 1: no due date (paid at enrollment)
 *   Instalment 2: confirmationDate + 30 days
 *   Instalment 3: confirmationDate + 60 days
 *   "enrollment date" in BR19 context = the date initial payment was confirmed (confirmedAt)
 *
 * CALLED BY:
 *   instalment.service.js → createInstalmentRecords
 */

import { INSTALMENT } from '../config/constants.js';

/**
 * Get the three instalment amounts from a Programme document.
 * Uses the stored breakdown if available; falls back to split calculation.
 *
 * @param {Object} programme - Populated Programme document (with fees field)
 * @returns {{ first: number, second: number, third: number }}
 * @throws {Error} If the programme has no instalment fee configuration
 */
const getInstalmentAmounts = (programme) => {
  const { instalment } = programme.fees;

  if (!instalment || !instalment.total) {
    throw new Error(
      `Programme "${programme.name}" does not have an instalment fee configuration. ` +
      `Cannot create instalment records.`
    );
  }

  // ── Priority 1: Use stored breakdown (set by Super Admin) ────────
  if (instalment.breakdown && instalment.breakdown.length === 3) {
    const sorted = [...instalment.breakdown].sort((a, b) => a.instalmentNumber - b.instalmentNumber);
    return {
      first:  sorted[0].amount,
      second: sorted[1].amount,
      third:  sorted[2].amount,
    };
  }

  // ── Priority 2: Calculate from total using 40/30/30 split ────────
  const total  = instalment.total;
  const first  = Math.round(total * INSTALMENT.SPLIT_PERCENTAGES[1]);
  const second = Math.round(total * INSTALMENT.SPLIT_PERCENTAGES[2]);
  const third  = total - first - second; // Remainder handles rounding discrepancies

  return { first, second, third };
};

/**
 * Calculate due dates for instalments 2 and 3.
 * Both are based on the initial payment confirmation date (confirmedAt).
 *
 * @param {Date} confirmationDate - Enrollment.confirmedAt value
 * @returns {{ instalment2DueDate: Date, instalment3DueDate: Date }}
 */
const calculateDueDates = (confirmationDate) => {
  const base = new Date(confirmationDate);

  const instalment2DueDate = new Date(base);
  instalment2DueDate.setDate(
    instalment2DueDate.getDate() + INSTALMENT.DUE_DATE_OFFSET_DAYS[2]
  );

  const instalment3DueDate = new Date(base);
  instalment3DueDate.setDate(
    instalment3DueDate.getDate() + INSTALMENT.DUE_DATE_OFFSET_DAYS[3]
  );

  return { instalment2DueDate, instalment3DueDate };
};

/**
 * Build the complete data objects for all 3 InstalmentPayment records.
 * Called by instalment.service.js as part of payment confirmation.
 *
 * FRD FR-10.5 / FRD QA checklist:
 *   "Three InstalmentPayment documents are created:
 *    Instalment 1 → Confirmed (reflects the initial payment just confirmed)
 *    Instalment 2 → Not Submitted, dueDate = confirmationDate + 30 days
 *    Instalment 3 → Not Submitted, dueDate = confirmationDate + 60 days"
 *
 * @param {Object} options
 * @param {import('mongoose').Types.ObjectId} options.enrollmentId
 * @param {import('mongoose').Types.ObjectId} options.profileId
 * @param {Object} options.programme - Populated Programme document
 * @param {Date} options.confirmationDate - Enrollment.confirmedAt
 * @param {import('mongoose').Types.ObjectId} options.actionedBy - Admin account ID
 * @returns {Array<Object>} Array of 3 InstalmentPayment create documents
 */
const buildInstalmentRecords = ({ enrollmentId, profileId, programme, confirmationDate, actionedBy }) => {
  const amounts = getInstalmentAmounts(programme);
  const { instalment2DueDate, instalment3DueDate } = calculateDueDates(confirmationDate);

  return [
    // ── Instalment 1: Confirmed (initial payment) ─────────────────
    {
      enrollment:     enrollmentId,
      profile:        profileId,
      instalmentNumber: 1,
      expectedAmount: amounts.first,
      status:         'confirmed',
      dueDate:        null,             // No due date — already paid at enrollment
      confirmedAt:    confirmationDate, // Confirmed at the same time as main payment
      actionedBy:     actionedBy,
      actionedAt:     confirmationDate,
    },
    // ── Instalment 2: Awaiting submission ─────────────────────────
    {
      enrollment:     enrollmentId,
      profile:        profileId,
      instalmentNumber: 2,
      expectedAmount: amounts.second,
      status:         'not_submitted',
      dueDate:        instalment2DueDate,
    },
    // ── Instalment 3: Awaiting submission ─────────────────────────
    {
      enrollment:     enrollmentId,
      profile:        profileId,
      instalmentNumber: 3,
      expectedAmount: amounts.third,
      status:         'not_submitted',
      dueDate:        instalment3DueDate,
    },
  ];
};

/**
 * Compute the payment completion state for an instalment student.
 * This is a derived/display value — never stored in the database.
 * FRD FR-10.5.
 *
 * @param {Array} instalmentRecords - Array of 3 InstalmentPayment documents
 * @returns {'partially_paid'|'pending_completion'|'fully_paid'}
 */
const computeCompletionState = (instalmentRecords) => {
  if (!instalmentRecords || instalmentRecords.length === 0) return 'partially_paid';

  const confirmed    = instalmentRecords.filter((r) => r.status === 'confirmed').length;
  const pending      = instalmentRecords.filter((r) => r.status === 'pending').length;
  const notSubmitted = instalmentRecords.filter((r) => r.status === 'not_submitted').length;
  const rejected     = instalmentRecords.filter((r) => r.status === 'rejected').length;

  if (confirmed === 3) return 'fully_paid';
  if (confirmed + pending === 3 && notSubmitted === 0 && rejected === 0) return 'pending_completion';
  return 'partially_paid';
};

export {
  getInstalmentAmounts,
  calculateDueDates,
  buildInstalmentRecords,
  computeCompletionState,
};