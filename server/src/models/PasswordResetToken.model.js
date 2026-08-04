'use strict';

/**
 * PasswordResetToken Model
 *
 * Dedicated model for password reset tokens, covering BOTH Admin and
 * Super Admin accounts. Replaces the old flat fields previously stored
 * directly on Account.
 *
 * WHY A DEDICATED MODEL (vs. flat fields on Account):
 *   1. Enables a proper, queryable audit trail per account (point 7).
 *   2. Enables a Super-Admin-only trail view across ALL accounts,
 *      including other Super Admins (point 8).
 *   3. Cleanly separates "who triggered this reset" — the account holder
 *      themselves (self-service) vs. a Super Admin acting on their behalf.
 *
 * NO TIME-BASED EXPIRY (point 10):
 *   Per explicit instruction, password reset links do NOT expire on a timer.
 *   A token remains usable until:
 *     - It is used to successfully reset the password (isUsed: true), OR
 *     - It is superseded by a newer reset request for the same account
 *       (isInvalidated: true — see invalidateAllForAccount), OR
 *     - It is explicitly revoked (also isInvalidated: true).
 *   There is deliberately no `expiresAt` field and no TTL index here.
 *
 * SECURITY:
 *   Only the SHA-256 hash of the raw token is stored. The raw token is
 *   delivered via email only and never persisted.
 */

import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    // ── The account this reset token belongs to ───────────────────
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'An account must be linked to this reset token.'],
    },

    // ── Token (hashed) ──────────────────────────────────────────────
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required.'],
      select: false,
    },

    // ── Usage state ──────────────────────────────────────────────────
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },

    // ── Invalidation state (superseded or revoked) ───────────────────
    isInvalidated: {
      type: Boolean,
      default: false,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },

    // ── Who initiated this reset request ─────────────────────────────
    // 'self'        — the account holder used the forgot-password flow
    // 'super_admin' — a Super Admin triggered this from account management
    initiatedBy: {
      type: String,
      required: true,
      enum: {
        values: ['self', 'super_admin'],
        message: "initiatedBy must be 'self' or 'super_admin'.",
      },
      default: 'self',
    },
    // Set only when initiatedBy === 'super_admin' — the SA who triggered it
    initiatedByAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    // ── Request context (for audit) ───────────────────────────────────
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.tokenHash;
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
passwordResetTokenSchema.index({ account: 1, isUsed: 1, isInvalidated: 1 });
passwordResetTokenSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Invalidate ALL active (non-used, non-invalidated) reset tokens for an account.
 * Called BEFORE issuing a new token, so "only the most recently issued
 * token is valid at any time" — mirrors the BR18 pattern used for
 * instalment tokens, applied here to password resets.
 *
 * @param {ObjectId} accountId
 */
passwordResetTokenSchema.statics.invalidateAllForAccount = function (accountId) {
  return this.updateMany(
    { account: accountId, isUsed: false, isInvalidated: false },
    { $set: { isInvalidated: true, invalidatedAt: new Date() } }
  );
};

/**
 * Find a token by its hash, including the hash field for verification.
 * @param {string} tokenHash
 */
passwordResetTokenSchema.statics.findByHash = function (tokenHash) {
  return this.findOne({ tokenHash }).select('+tokenHash');
};

/**
 * Mark this token as used.
 */
passwordResetTokenSchema.methods.markAsUsed = function () {
  return this.updateOne({ $set: { isUsed: true, usedAt: new Date() } });
};

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;