"use strict";

/**
 * Enrollment Model — Core Student Record
 *
 * Every student interaction with the enrollment form produces or updates
 * an Enrollment document. This is the most critical model in the system.
 *
 * RECORD LIFECYCLE:
 *   1. Student advances past Step 1 → partial record created (paymentStatus: 'not_paid')
 *   2. Student submits receipt      → record updated (paymentStatus: 'pending', receipt attached)
 *   3. Admin confirms               → record updated (paymentStatus: 'confirmed', actionedBy set)
 *   4. Admin rejects                → record updated (paymentStatus: 'rejected', rejectionReason set)
 *   5. Super Admin reverses         → record updated (paymentStatus: 'pending', reversalReason set)
 *
 * PROGRAMME FIELD BEHAVIOUR (critical):
 *   The programme field ALWAYS reflects the student's most recently selected
 *   programme. It is updated in real time if the student changes their selection
 *   on any step after Step 1. There is no separate storage of the original
 *   "Enroll Now" programme context. The partial record is updated on every change.
 *
 * PROFILE LINKAGE:
 *   The profile field references the centralized Profile model.
 *   Before creating or updating an Enrollment, the profileResolver helper
 *   creates or retrieves the Profile by email.
 *
 * DUPLICATE DETECTION:
 *   The compound index on { profile, programme, paymentStatus: 'not_paid' }
 *   enables fast lookups for duplicate detection. The application layer (not
 *   a DB unique constraint) handles upsert logic: same email + same programme
 *   + paymentStatus 'not_paid' → update existing record instead of creating new.
 *
 * RECEIPT STORAGE:
 *   Development (UPLOAD_ENABLED=false): UPLOAD.MOCK_PLACEHOLDER is stored.
 *   Production (UPLOAD_ENABLED=true): Cloudinary URL and public_id stored.
 */

import mongoose from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPES,
  DELIVERY_FORMATS,
} from "../config/constants.js";

// ── Embedded: Receipt File Reference ─────────────────────────────────
const receiptSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["cloudinary", "local"],
      default: "local",
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

// ── Embedded: Policy Acknowledgments ─────────────────────────────────
const policyAcknowledgmentSchema = new mongoose.Schema(
  {
    noRefundPolicy: { type: Boolean, default: false },
    attendancePolicy: { type: Boolean, default: false },
    codeOfConduct: { type: Boolean, default: false },
    paymentPlanTerms: { type: Boolean, default: false },
    acknowledgedAt: { type: Date, default: null },
  },
  { _id: false },
);

// ── Embedded: Per-Notification Email Delivery Tracking ────────────────
// Tracks the send outcome of each automated email individually.
// Allows the admin dashboard to show targeted warnings per notification type.
// Source: FRD FR-07.1 (emailDeliveryStatus Object) + Section 7.3 delivery failure handling.
const emailDeliveryEntrySchema = new mongoose.Schema(
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

const emailDeliveryStatusSchema = new mongoose.Schema(
  {
    // NTF-01: Acknowledgment email (status → Pending)
    ntf01: { type: emailDeliveryEntrySchema, default: () => ({}) },
    // NTF-02: Payment confirmed email (status → Confirmed)
    ntf02: { type: emailDeliveryEntrySchema, default: () => ({}) },
    // NTF-03: Payment rejected email (status → Rejected)
    ntf03: { type: emailDeliveryEntrySchema, default: () => ({}) },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema(
  {
    // ── Identity & Context ─────────────────────────────────────────
    // References the centralized Profile. Never null after record creation.
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "A student profile must be linked to this enrollment."],
    },
    // The cohort the student is enrolling into.
    // Set from the programme's activeCohort at the time of Step 1 advancement.
    // Can be null if the programme has no active cohort yet.
    cohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cohort",
      default: null,
    },
    // The programme the student is enrolling in.
    // ALWAYS reflects the student's MOST RECENTLY selected programme.
    // Updated in real time if the student changes selection during the form flow.
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: [true, "A programme must be linked to this enrollment."],
    },

    // ── Enrollment Preferences ─────────────────────────────────────
    deliveryFormat: {
      type: String,
      enum: {
        values: [...Object.values(DELIVERY_FORMATS), null],
        message: `Delivery format must be one of: ${Object.values(DELIVERY_FORMATS).join(", ")}.`,
      },
      default: null,
    },
    paymentType: {
      type: String,
      enum: {
        values: [...Object.values(PAYMENT_TYPES), null],
        message: `Payment type must be one of: ${Object.values(PAYMENT_TYPES).join(", ")}.`,
      },
      default: null,
    },
    // Amount paid at initial submission.
    // Full payment: equals the programme's full fee.
    // Instalment: equals Instalment 1 amount (40% of instalment total).
    // Named 'depositAmount' to match FRD FR-07.1 schema and FR-05.4 CSV export spec.
    depositAmount: {
      type: Number,
      default: null,
      min: [0, "Deposit amount must be a positive number."],
    },
    // Timestamp of when the student submitted their receipt (status → Pending).
    // Separate from createdAt (which is the Step 1 advancement timestamp).
    submissionTimestamp: {
      type: Date,
      default: null,
    },

    // ── Payment Lifecycle ─────────────────────────────────────────
    paymentStatus: {
      type: String,
      required: true,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: `Payment status must be one of: ${Object.values(PAYMENT_STATUS).join(", ")}.`,
      },
      default: PAYMENT_STATUS.NOT_PAID,
    },
    receipt: {
      type: receiptSchema,
      default: null,
    },

    // ── Policy Acknowledgments ─────────────────────────────────────
    policyAcknowledgments: {
      type: policyAcknowledgmentSchema,
      default: () => ({
        noRefundPolicy: false,
        attendancePolicy: false,
        codeOfConduct: false,
        paymentPlanTerms: false,
        acknowledgedAt: null,
      }),
    },

    // ── Referral Code (F-09) ───────────────────────────────────────
    // Raw input only. No validation against a referrer database in v1.
    // Admin cross-references manually against Notion referral tracker.
    referralCode: {
      type: String,
      trim: true,
      default: null,
      maxlength: [20, "Referral code must not exceed 20 characters."],
    },

    // ── Partial Enrollment Flag (F-08) ────────────────────────────
    // true  = record was created at Step 1 advancement; receipt not yet submitted
    // false = student completed full enrollment and submitted a receipt
    isPartialEnrollment: {
      type: Boolean,
      default: true,
    },

    // ── Admin Action Tracking ──────────────────────────────────────
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    actionedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, "Rejection reason must not exceed 500 characters."],
    },
    confirmedAt: {
      type: Date,
      default: null,
      // This date is used as the base for instalment due date calculations:
      // Instalment 2 due: confirmedAt + 30 days
      // Instalment 3 due: confirmedAt + 60 days
    },

    // ── Super Admin Reversal Tracking ──────────────────────────────
    reversalReason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, "Reversal reason must not exceed 500 characters."],
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    reversedAt: {
      type: Date,
      default: null,
    },

    // ── Email Notification Failure Tracking ────────────────────────
    // Flagged when an automated email fails to send.
    // Admin is alerted in the dashboard to contact the student via WhatsApp.
    // ── Email Delivery Status (structured per-notification tracking) ──
    // Tracks send outcome for each automated enrollment email independently.
    // Used by the admin dashboard to surface targeted delivery failure warnings.
    // FRD Section 7.3: NTF-02 and NTF-03 failures show a warning banner.
    //                  NTF-01 failure is logged but admin is not separately notified.
    emailDeliveryStatus: {
      type: emailDeliveryStatusSchema,
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
  },
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
enrollmentSchema.index({ profile: 1 });
enrollmentSchema.index({ programme: 1 });
enrollmentSchema.index({ cohort: 1 });
enrollmentSchema.index({ paymentStatus: 1 });
enrollmentSchema.index({ isPartialEnrollment: 1 });
enrollmentSchema.index({ createdAt: -1 });
enrollmentSchema.index({ confirmedAt: -1 });
enrollmentSchema.index({ emailNotificationFailed: 1 });

// Compound index for duplicate detection:
// Checks same profile + same programme + not_paid status before creating a new record
enrollmentSchema.index({ profile: 1, programme: 1, paymentStatus: 1 });

// Compound index for admin dashboard filters:
// cohort + paymentStatus is the most common admin query pattern
enrollmentSchema.index({ cohort: 1, paymentStatus: 1 });

// Compound index for the Outstanding Instalments filter:
// Identifies instalment students eligible for follow-up
enrollmentSchema.index({ paymentType: 1, paymentStatus: 1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * statusLabel — Human-readable status label for the admin dashboard.
 * Partial not-paid records get a specific label per PRD recommendation.
 */
enrollmentSchema.virtual("statusLabel").get(function () {
  if (
    this.paymentStatus === PAYMENT_STATUS.NOT_PAID &&
    this.isPartialEnrollment
  ) {
    return "Not Paid — No Receipt Submitted";
  }
  const labels = {
    [PAYMENT_STATUS.NOT_PAID]: "Not Paid",
    [PAYMENT_STATUS.PENDING]: "Pending Review",
    [PAYMENT_STATUS.CONFIRMED]: "Confirmed",
    [PAYMENT_STATUS.REJECTED]: "Rejected",
  };
  return labels[this.paymentStatus] || this.paymentStatus;
});

/**
 * statusBadgeColor — Color hint for the admin dashboard badge.
 * Matches the PRD specification: grey/yellow/green/red.
 */
enrollmentSchema.virtual("statusBadgeColor").get(function () {
  const colors = {
    [PAYMENT_STATUS.NOT_PAID]: "grey",
    [PAYMENT_STATUS.PENDING]: "yellow",
    [PAYMENT_STATUS.CONFIRMED]: "green",
    [PAYMENT_STATUS.REJECTED]: "red",
  };
  return colors[this.paymentStatus] || "grey";
});

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Find an existing not_paid partial record for the same profile + programme combo.
 * Used by the duplicate detection logic in the enrollment controller.
 *
 * @param {ObjectId} profileId
 * @param {ObjectId} programmeId
 * @returns {Promise<Enrollment|null>}
 */
enrollmentSchema.statics.findExistingPartialRecord = function (
  profileId,
  programmeId,
) {
  return this.findOne({
    profile: profileId,
    programme: programmeId,
    paymentStatus: PAYMENT_STATUS.NOT_PAID,
  });
};

/**
 * Check for an existing Pending or Confirmed record for the same profile + programme.
 * Used on receipt submission to enforce BR01:
 *   "A student cannot be enrolled in more than one active cohort of the same
 *    programme simultaneously."
 * Returns the conflicting record if found, null otherwise.
 * If found → return 409 Conflict.
 *
 * @param {ObjectId} profileId
 * @param {ObjectId} programmeId
 * @returns {Promise<Enrollment|null>}
 */
enrollmentSchema.statics.findExistingPendingOrConfirmed = function (profileId, programmeId) {
  return this.findOne({
    profile: profileId,
    programme: programmeId,
    paymentStatus: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.CONFIRMED] },
  }).select('paymentStatus createdAt');
};

/**
 * Get dashboard overview counts for the admin overview screen.
 * Returns total counts per payment status across all active cohorts.
 *
 * @returns {Promise<Object>}
 */
/**
 * Get dashboard overview counts for the admin overview screen.
 *
 * FRD FR-04.2 metric definitions:
 *   totalEnrolled     = Pending + Confirmed (active students — paid or awaiting confirmation)
 *   pendingReviews    = Pending only
 *   confirmedPayments = Confirmed only
 *   rejectedPayments  = Rejected only
 *   notPaid           = Not Paid (partial records needing follow-up)
 *
 * @returns {Promise<Object>}
 */
enrollmentSchema.statics.getDashboardCounts = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusCounts = {
    not_paid: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
  };

  result.forEach(({ _id, count }) => {
    if (statusCounts.hasOwnProperty(_id)) {
      statusCounts[_id] = count;
    }
  });

  return {
    // FRD FR-04.2: "Total Enrolled = Count of Pending + Confirmed"
    totalEnrolled: statusCounts.pending + statusCounts.confirmed,
    pendingReviews: statusCounts.pending,
    confirmedPayments: statusCounts.confirmed,
    rejectedPayments: statusCounts.rejected,
    notPaid: statusCounts.not_paid,
  };
};

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
