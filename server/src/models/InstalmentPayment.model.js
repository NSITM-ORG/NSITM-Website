'use strict';

/**
 * InstalmentPayment Model
 *
 * Stores the three individual instalment payment records for each student
 * who enrolled on an instalment plan.
 *
 * CREATION:
 *   Three records are automatically created as a side effect when an admin
 *   confirms the INITIAL payment of an instalment-plan student.
 *   This is handled in instalment.service.js, triggered by the payment
 *   confirmation controller. It is NOT triggered directly by the controller.
 *
 *     Instalment 1: status = 'confirmed'    (reflects the initial payment just confirmed)
 *     Instalment 2: status = 'not_submitted', dueDate = confirmedAt + 30 days
 *     Instalment 3: status = 'not_submitted', dueDate = confirmedAt + 60 days
 *
 *   If instalment record creation fails, the entire confirmation transaction
 *   is rolled back — the initial payment confirmation does not proceed.
 *
 * OVERDUE STATE:
 *   Per the PRD, 'overdue' is a COMPUTED DISPLAY STATE only.
 *   It is NEVER stored in the database.
 *   The isOverdue virtual returns true if:
 *     - dueDate is in the past AND
 *     - status is 'not_submitted' or 'rejected' (i.e., not yet confirmed)
 *
 * SEQUENCE ENFORCEMENT:
 *   Students can only submit Instalment N if Instalment N-1 is 'confirmed'.
 *   This is enforced server-side in the instalment controller.
 *   The UI reflects this by hiding the Submit button when the previous
 *   instalment is still pending or not yet submitted.
 *
 * AMOUNTS:
 *   expectedAmount is copied from the programme fee schedule at the time
 *   the records are created. It is immutable after creation.
 */

import  mongoose from 'mongoose';
import { INSTALMENT_STATUS } from'../config/constants.js';

// ── Embedded: Per-Notification Email Delivery Tracking (Instalment) ──
// Tracks NTF-07, NTF-08, NTF-09 delivery outcomes independently.
const instalmentEmailDeliveryEntrySchema = new mongoose.Schema(
  {
    attempted:    { type: Boolean, default: false },
    sent:         { type: Boolean, default: false },
    sentAt:       { type: Date,    default: null },
    failed:       { type: Boolean, default: false },
    failedAt:     { type: Date,    default: null },
    errorMessage: { type: String,  default: null },
  },
  { _id: false }
);

const instalmentEmailDeliveryStatusSchema = new mongoose.Schema(
  {
    ntf07: { type: instalmentEmailDeliveryEntrySchema, default: () => ({}) }, // Receipt submitted ack
    ntf08: { type: instalmentEmailDeliveryEntrySchema, default: () => ({}) }, // Instalment confirmed
    ntf09: { type: instalmentEmailDeliveryEntrySchema, default: () => ({}) }, // Instalment rejected
  },
  { _id: false }
);

// ── Embedded: Receipt File Reference (same structure as Enrollment) ───
const receiptSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    provider: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local',
    },
    uploadedAt: { type: Date, default: null },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────
const instalmentPaymentSchema = new mongoose.Schema(
  {
    // ── Parent References ──────────────────────────────────────────
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'An enrollment must be linked to this instalment record.'],
    },
    // Denormalized from Enrollment for faster dashboard queries
    // without requiring a join to Enrollment to get the student.
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'A profile must be linked to this instalment record.'],
    },

    // ── Instalment Details ─────────────────────────────────────────
    instalmentNumber: {
      type: Number,
      required: [true, 'Instalment number is required.'],
      enum: {
        values: [1, 2, 3],
        message: 'Instalment number must be 1, 2, or 3.',
      },
    },
    // Copied from programme fee schedule at creation time. Immutable.
    expectedAmount: {
      type: Number,
      required: [true, 'Expected instalment amount is required.'],
      min: [0, 'Expected amount must be a positive number.'],
    },

    // ── Status ─────────────────────────────────────────────────────
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(INSTALMENT_STATUS),
        message: `Instalment status must be one of: ${Object.values(INSTALMENT_STATUS).join(', ')}.`,
      },
      default: INSTALMENT_STATUS.NOT_SUBMITTED,
    },

    // ── Due Date ───────────────────────────────────────────────────
    // null  for Instalment 1 (paid at enrollment — no future due date)
    // set   for Instalments 2 and 3 (based on initial confirmedAt date)
    dueDate: {
      type: Date,
      default: null,
    },

    // ── Receipt ────────────────────────────────────────────────────
    receipt: {
      type: receiptSchema,
      default: null,
    },

    // ── Submission Tracking ────────────────────────────────────────
    submittedAt: {
      type: Date,
      default: null,
    },

    // ── Admin Action Tracking ──────────────────────────────────────
    confirmedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Rejection reason must not exceed 500 characters.'],
    },
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    actionedAt: {
      type: Date,
      default: null,
    },

    // ── Email Notification Failure Tracking ────────────────────────
       // ── Email Delivery Status (structured per-notification tracking) ──
    emailDeliveryStatus: {
      type: instalmentEmailDeliveryStatusSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
instalmentPaymentSchema.index({ enrollment: 1 });
instalmentPaymentSchema.index({ profile: 1 });
instalmentPaymentSchema.index({ status: 1 });
instalmentPaymentSchema.index({ dueDate: 1 });
instalmentPaymentSchema.index({ emailNotificationFailed: 1 });

// Unique compound: one record per instalment number per enrollment
// Prevents double-creation if the service is accidentally called twice
instalmentPaymentSchema.index(
  { enrollment: 1, instalmentNumber: 1 },
  { unique: true, name: 'unique_instalment_per_enrollment' }
);

// For the Outstanding Instalments filter in the admin dashboard:
// Find all not_submitted or rejected instalments with a due date set
instalmentPaymentSchema.index({ enrollment: 1, status: 1 });
instalmentPaymentSchema.index({ status: 1, dueDate: 1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isOverdue — Computed display state. NEVER stored in database.
 *
 * An instalment is overdue when:
 *   1. It has a due date set (i.e., it is instalment 2 or 3)
 *   2. That due date has passed
 *   3. The status is 'not_submitted' or 'rejected' (not yet confirmed)
 */
instalmentPaymentSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) return false;
  const isUnresolved =
    this.status === INSTALMENT_STATUS.NOT_SUBMITTED ||
    this.status === INSTALMENT_STATUS.REJECTED;
  return isUnresolved && this.dueDate < new Date();
});

/**
 * statusLabel — Human-readable label including overdue state.
 */
instalmentPaymentSchema.virtual('statusLabel').get(function () {
  if (this.isOverdue) return 'Overdue';
  const labels = {
    [INSTALMENT_STATUS.NOT_SUBMITTED]: 'Outstanding',
    [INSTALMENT_STATUS.PENDING]: 'Pending Review',
    [INSTALMENT_STATUS.CONFIRMED]: 'Confirmed',
    [INSTALMENT_STATUS.REJECTED]: 'Rejected',
  };
  return labels[this.status] || this.status;
});

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all three instalment records for a given enrollment.
 * Returns them sorted ascending by instalmentNumber (1, 2, 3).
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<InstalmentPayment[]>}
 */
instalmentPaymentSchema.statics.getForEnrollment = function (enrollmentId) {
  return this.find({ enrollment: enrollmentId }).sort({ instalmentNumber: 1 });
};

/**
 * Check if an enrollment has all three instalments confirmed.
 * Used to determine if a student is "fully paid" and to trigger NTF-10.
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<boolean>}
 */
instalmentPaymentSchema.statics.isFullyPaid = async function (enrollmentId) {
  const confirmedCount = await this.countDocuments({
    enrollment: enrollmentId,
    status: INSTALMENT_STATUS.CONFIRMED,
  });
  return confirmedCount === 3;
};

/**
 * Get the next outstanding instalment for an enrollment.
 * Used to determine what the student should submit next and what amount to display.
 * Enforces sequence: returns the lowest-numbered instalment that is not yet confirmed.
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<InstalmentPayment|null>}
 */
instalmentPaymentSchema.statics.getNextOutstanding = function (enrollmentId) {
  return this.findOne({
    enrollment: enrollmentId,
    status: { $in: [INSTALMENT_STATUS.NOT_SUBMITTED, INSTALMENT_STATUS.REJECTED] },
  }).sort({ instalmentNumber: 1 });
};

const InstalmentPayment = mongoose.model('InstalmentPayment', instalmentPaymentSchema);

export default InstalmentPayment;