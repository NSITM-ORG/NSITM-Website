'use strict';

/**
 * Cohort Model
 *
 * A cohort is a specific instance of a programme running at a defined time.
 * Each cohort is linked to exactly one programme and has a delivery format,
 * start/end dates, and a WhatsApp group link (inserted before the first
 * payment confirmation so students receive it in NTF-02).
 *
 * ENROLLMENT CONTROL:
 *   enrollmentOpen: Controls whether the public Enroll Now button is active.
 *                   Set by Super Admin. Independent of cohort status.
 *
 * CAPACITY:
 *   maxCapacity: Optional cap on enrollment count. null = unlimited.
 *
 * COUNTS:
 *   currentEnrollmentCount: All enrollments (any status). Incremented
 *                           when partial record is created.
 *   confirmedEnrollmentCount: Confirmed-payment enrollments only.
 *                             Incremented when admin confirms a payment.
 *   These are denormalized for dashboard performance. The source of
 *   truth remains the Enrollment collection.
 *
 * WHATSAPP GROUP LINK:
 *   Per the PRD, this must be set BEFORE the first payment confirmation
 *   is processed, as it is included in the NTF-02 confirmation email.
 *   The system does not block confirmation if the link is absent, but
 *   the email service will use a placeholder if it is not configured.
 */

import mongoose from 'mongoose';
import { COHORT_STATUS, DELIVERY_FORMATS } from '../config/constants.js';

const cohortSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────
    // Descriptive name, e.g., "Fullstack Web Development — June 2026 Online Cohort"
    name: {
      type: String,
      required: [true, 'Cohort name is required.'],
      trim: true,
      maxlength: [200, 'Cohort name must not exceed 200 characters.'],
    },

    // ── Programme Link ────────────────────────────────────────────
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Programme',
      required: [true, 'A programme must be linked to this cohort.'],
    },

    // ── Schedule ──────────────────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, 'Cohort start date is required.'],
    },
    endDate: {
      type: Date,
      required: [true, 'Cohort end date is required.'],
      validate: {
        validator(endDate) {
          return endDate > this.startDate;
        },
        message: 'End date must be after start date.',
      },
    },
    deliveryFormat: {
      type: String,
      required: [true, 'Delivery format is required.'],
      enum: {
        values: Object.values(DELIVERY_FORMATS),
        message: `Delivery format must be one of: ${Object.values(DELIVERY_FORMATS).join(', ')}.`,
      },
    },

    // ── Communication ─────────────────────────────────────────────
    // WhatsApp group link sent to students in the NTF-02 confirmation email.
    // MUST be set before the first payment confirmation is processed.
    whatsappGroupLink: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^https:\/\/(chat\.whatsapp\.com|wa\.me)\/.+$/,
        'WhatsApp group link must be a valid WhatsApp URL.',
      ],
    },

    // ── Status & Enrollment Control ───────────────────────────────
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(COHORT_STATUS),
        message: `Cohort status must be one of: ${Object.values(COHORT_STATUS).join(', ')}.`,
      },
      default: COHORT_STATUS.UPCOMING,
    },
    // Independent toggle. A cohort can be 'active' but with enrollment closed.
    enrollmentOpen: {
      type: Boolean,
      default: false,
    },

    // ── Capacity ──────────────────────────────────────────────────
    maxCapacity: {
      type: Number,
      default: null, // null = unlimited
      min: [1, 'Maximum capacity must be at least 1 if set.'],
    },

    // ── Denormalized Counts (for dashboard performance) ───────────
    currentEnrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    confirmedEnrollmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Audit ──────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    // ── Soft Delete ────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      select: false,
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
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
cohortSchema.index({ programme: 1 });
cohortSchema.index({ status: 1 });
cohortSchema.index({ deliveryFormat: 1 });
cohortSchema.index({ enrollmentOpen: 1 });
cohortSchema.index({ startDate: 1 });
cohortSchema.index({ isDeleted: 1 });
cohortSchema.index({ programme: 1, status: 1 });
cohortSchema.index({ status: 1, enrollmentOpen: 1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isAtCapacity — true if maxCapacity is set AND currentEnrollmentCount
 * has reached or exceeded it.
 */
cohortSchema.virtual('isAtCapacity').get(function () {
  if (this.maxCapacity === null || this.maxCapacity === undefined) return false;
  return this.currentEnrollmentCount >= this.maxCapacity;
});

/**
 * enrollmentAvailable — true if cohort is active, enrollment is open,
 * and the cohort is not at capacity.
 */
cohortSchema.virtual('enrollmentAvailable').get(function () {
  return (
    this.status === COHORT_STATUS.ACTIVE &&
    this.enrollmentOpen === true &&
    !this.isAtCapacity
  );
});

/**
 * durationDays — computed number of days the cohort runs.
 */
cohortSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return null;
  const ms = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
});

// ─────────────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Safely increment currentEnrollmentCount by 1.
 * Called when a partial enrollment record is created (Step 1 advancement).
 */
cohortSchema.methods.incrementEnrollmentCount = function () {
  return this.updateOne({ $inc: { currentEnrollmentCount: 1 } });
};

/**
 * Safely increment confirmedEnrollmentCount by 1.
 * Called when admin confirms a payment.
 */
cohortSchema.methods.incrementConfirmedCount = function () {
  return this.updateOne({ $inc: { confirmedEnrollmentCount: 1 } });
};

/**
 * Safely decrement confirmedEnrollmentCount by 1 (minimum 0).
 * Called when Super Admin reverses a confirmed payment to pending.
 */
cohortSchema.methods.decrementConfirmedCount = function () {
  if (this.confirmedEnrollmentCount <= 0) return Promise.resolve();
  return this.updateOne({ $inc: { confirmedEnrollmentCount: -1 } });
};

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Get all cohorts that are currently active and have enrollment open.
 * Used by the public /cohorts/active endpoint.
 *
 * @returns {Promise<Cohort[]>}
 */
cohortSchema.statics.getActiveCohorts = function () {
  return this.find({
    status: COHORT_STATUS.ACTIVE,
    enrollmentOpen: true,
    isDeleted: false,
  })
    .populate('programme', 'name slug category fees')
    .sort({ startDate: 1 });
};

const Cohort = mongoose.model('Cohort', cohortSchema);

export default Cohort;