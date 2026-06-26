'use strict';

/**
 * AdminInvitation Model
 *
 * The ONLY mechanism through which Admin accounts may be created (point 4).
 * A Super Admin provides an email address; the system generates this
 * invitation record and emails a registration link built from it.
 *
 * TWO-PART CREDENTIAL DESIGN:
 *
 *   tokenHash  — the real, long-lived credential. Identifies this specific
 *                invitation. NEVER time-expires. Stays valid until:
 *                  - used to complete registration (isUsed: true), or
 *                  - superseded by a newer invite for the same email, or
 *                  - explicitly revoked by a Super Admin.
 *                This satisfies point 10.
 *
 *   codeHash + codeExpiresAt — a short verification code, valid for only
 *                10 minutes from generation (point 3). Proves the link's
 *                authenticity at the moment it is opened. If it expires
 *                while the token is still valid, the recipient can request
 *                a fresh code via the resend endpoint WITHOUT losing their
 *                place in line — the underlying invitation is untouched.
 *
 * LINK FORMAT (point 5):
 *   {CLIENT_URL}/admin/register?token=RAW_TOKEN&code=RAW_CODE&rt=NOISE
 *   `rt` is generated but never stored or checked against anything.
 */

import mongoose from 'mongoose';

const adminInvitationSchema = new mongoose.Schema(
  {
    // ── The invited email address ───────────────────────────────────
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      lowercase: true,
      trim: true,
    },

    // ── Who generated this invitation ───────────────────────────────
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'The inviting Super Admin account is required.'],
    },

    // ── Long-lived token (the real credential — no time expiry) ─────
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required.'],
      select: false,
    },

    // ── Short-lived verification code (10-minute window) ─────────────
    codeHash: {
      type: String,
      required: [true, 'Code hash is required.'],
      select: false,
    },
    codeExpiresAt: {
      type: Date,
      required: true,
    },
    codeGeneratedAt: {
      type: Date,
      required: true,
    },
    // Incremented every time the code is regenerated via resend.
    resendCount: {
      type: Number,
      default: 0,
    },

    // ── Usage state ───────────────────────────────────────────────────
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },

    // ── Invalidation state (revoked, or superseded by a newer invite) ─
    isInvalidated: {
      type: Boolean,
      default: false,
    },
    invalidatedAt: {
      type: Date,
      default: null,
    },
    invalidatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },

    // ── Set once registration is completed (links to the new Account) ─
    completedAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
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
        delete ret.tokenHash;
        delete ret.codeHash;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
adminInvitationSchema.index({ email: 1 });
adminInvitationSchema.index({ isUsed: 1, isInvalidated: 1 });
adminInvitationSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isCodeExpired — true if the 10-minute verification code window has passed.
 * Does NOT mean the invitation itself is dead — only that a fresh code
 * must be requested before the link can be used.
 */
adminInvitationSchema.virtual('isCodeExpired').get(function () {
  return this.codeExpiresAt < new Date();
});

/**
 * state — overall human-readable status of this invitation.
 */
adminInvitationSchema.virtual('state').get(function () {
  if (this.isUsed) return 'used';
  if (this.isInvalidated) return 'invalidated';
  if (this.isCodeExpired) return 'code_expired';
  return 'pending';
});

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Invalidate all active (non-used, non-invalidated) invitations for an email.
 * Called before creating a new invitation for the same email address.
 *
 * @param {string} email
 * @param {ObjectId} [invalidatedBy] - Optional Super Admin performing this
 */
adminInvitationSchema.statics.invalidateAllForEmail = function (email, invalidatedBy = null) {
  return this.updateMany(
    { email: email.toLowerCase().trim(), isUsed: false, isInvalidated: false },
    { $set: { isInvalidated: true, invalidatedAt: new Date(), invalidatedBy } }
  );
};

/**
 * Find an invitation by its token hash, including hash fields for verification.
 * @param {string} tokenHash
 */
adminInvitationSchema.statics.findByTokenHash = function (tokenHash) {
  return this.findOne({ tokenHash }).select('+tokenHash +codeHash');
};

const AdminInvitation = mongoose.model('AdminInvitation', adminInvitationSchema);

export default AdminInvitation;