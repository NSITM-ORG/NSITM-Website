'use strict';

/**
 * InstalmentToken Model
 *
 * Stores one-time access tokens for the instalment payment flow.
 *
 * FLOW:
 *   1. Student submits their email at /my-payment
 *   2. Backend looks up a confirmed instalment enrollment by email
 *   3. If found: generates a crypto-secure raw token, hashes it, stores the hash
 *   4. Sends the raw token to the student via NTF-06 email
 *   5. Student clicks the link: /my-payment/access?token=RAW&email=ENCODED
 *   6. Backend hashes the received raw token and compares against stored hash
 *   7. If valid, unused, and not expired: marks token as used, returns enrollment summary
 *
 * SECURITY:
 *   - Only the hashed token is stored in the database (SHA-256 via crypto module)
 *   - The raw token is sent via email and never stored
 *   - Token expires after 30 minutes (AUTH.INSTALMENT_TOKEN_EXPIRY_MS)
 *   - Token is single-use: marked as used when the enrollment summary page loads
 *   - If student requests a new link before the old one expires:
 *     the old token is invalidated (isInvalidated = true) before the new one is created
 *   - The neutral response ("If we have an enrollment on record...") is ALWAYS shown
 *     regardless of whether a match was found, to prevent email enumeration
 *
 * TOKEN STATES:
 *   Valid, unused, not expired → Show enrollment summary
 *   Expired                    → "This link has expired. Please request a new one."
 *   Already used               → "This link has already been used. Please request a new one."
 *   Invalid (not found)        → "This link is invalid. Please request a new one."
 *   Invalidated (superseded)   → Treated as "invalid" from the student's perspective
 *
 * CONSUMED ON PAGE LOAD:
 *   Per PRD F-10: "The token is marked as used when the student successfully
 *   loads the enrollment summary page." The student gets one access session per link.
 *   A new link must be requested if they close the browser.
 */

import mongoose from 'mongoose';

const instalmentTokenSchema = new mongoose.Schema(
  {
    // ── Parent References ──────────────────────────────────────────
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'An enrollment must be linked to this token.'],
    },
    // The email used to request the link. Stored for audit and for
    // constructing the one-time link URL (?email=ENCODED).
    email: {
      type: String,
      required: [true, 'Email address is required for this token.'],
      lowercase: true,
      trim: true,
    },

    // ── Token ─────────────────────────────────────────────────────
    // SHA-256 hash of the raw token. Raw token is sent via email and never stored.
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required.'],
      select: false, // Never exposed in API responses
    },
    expiresAt: {
      type: Date,
      required: [true, 'Token expiry time is required.'],
    },

    // ── Usage State ────────────────────────────────────────────────
    // Marked true when student successfully loads the enrollment summary page.
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },

    // Marked true when student requests a new link before this one expires.
    // Prevents the old link from being used after the new one is issued.
    isInvalidated: {
      type: Boolean,
      default: false,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },

    // ── Request Metadata (for audit) ───────────────────────────────
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    // Only createdAt — audit logs are immutable, no updatedAt needed.
    // We manually update isUsed and isInvalidated via updateOne(),
    // so we don't want Mongoose to overwrite updatedAt automatically.
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.tokenHash; // Extra safety: never expose hash
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
instalmentTokenSchema.index({ enrollment: 1 });
instalmentTokenSchema.index({ email: 1 });
instalmentTokenSchema.index({ expiresAt: 1 });
instalmentTokenSchema.index({ isUsed: 1 });
instalmentTokenSchema.index({ isInvalidated: 1 });
// Most common lookup: find a valid, unused, non-invalidated token by enrollment
instalmentTokenSchema.index({ enrollment: 1, isUsed: 1, isInvalidated: 1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isExpired — true if the token's expiresAt time has passed.
 */
instalmentTokenSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

/**
 * tokenState — The authoritative state of this token.
 * Maps to the token validation states table in the PRD (F-10).
 *
 * States: 'valid' | 'expired' | 'used' | 'invalidated' | 'invalid'
 */
instalmentTokenSchema.virtual('tokenState').get(function () {
  if (this.isUsed) return 'used';
  if (this.isInvalidated) return 'invalidated';
  if (this.isExpired) return 'expired';
  return 'valid';
});

// ─────────────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Mark this token as used (called when student loads the enrollment summary page).
 *
 * @returns {Promise<void>}
 */
instalmentTokenSchema.methods.markAsUsed = function () {
  return this.updateOne({
    $set: { isUsed: true, usedAt: new Date() },
  });
};

/**
 * Invalidate this token (called when student requests a new link before this one expires).
 *
 * @returns {Promise<void>}
 */
instalmentTokenSchema.methods.invalidate = function () {
  return this.updateOne({
    $set: { isInvalidated: true, invalidatedAt: new Date() },
  });
};

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Find any active (non-used, non-invalidated, non-expired) token for an enrollment.
 * Used before creating a new token to invalidate the previous one.
 * Selects tokenHash to support comparison operations if needed.
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<InstalmentToken|null>}
 */
/**
 * Invalidate ALL active (non-used, non-expired) tokens for an enrollment.
 * Called BEFORE creating a new token when the student requests a new link.
 *
 * BR18: "A new one-time instalment access token request invalidates all
 * previous unused tokens for the same student record."
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<{ modifiedCount: number }>}
 */
instalmentTokenSchema.statics.invalidateAllForEnrollment = function (enrollmentId) {
  return this.updateMany(
    {
      enrollment: enrollmentId,
      isUsed: false,
      isInvalidated: false,
    },
    {
      $set: { isInvalidated: true, invalidatedAt: new Date() },
    }
  );
};

/**
 * Find a specific active token for an enrollment.
 * Used for validation, not for invalidation.
 * Selects tokenHash for comparison operations.
 *
 * @param {ObjectId} enrollmentId
 * @returns {Promise<InstalmentToken|null>}
 */
instalmentTokenSchema.statics.findActiveForEnrollment = function (enrollmentId) {
  return this.findOne({
    enrollment: enrollmentId,
    isUsed: false,
    isInvalidated: false,
    expiresAt: { $gt: new Date() },
  }).select('+tokenHash');
};

/**
 * Find a token by its hash for validation.
 * Used when the student clicks the one-time link and the backend
 * needs to verify the raw token against the stored hash.
 *
 * @param {string} tokenHash - SHA-256 hash of the received raw token
 * @returns {Promise<InstalmentToken|null>}
 */
instalmentTokenSchema.statics.findByHash = function (tokenHash) {
  return this.findOne({ tokenHash }).select('+tokenHash');
};

const InstalmentToken = mongoose.model('InstalmentToken', instalmentTokenSchema);

export default  InstalmentToken;