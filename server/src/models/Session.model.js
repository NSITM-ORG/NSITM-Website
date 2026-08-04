'use strict';

/**
 * Session Model — Multi-Device Active Session Tracking
 *
 * Solves Issue 2: a logged-in account's session was previously assumed
 * to be single-device (one cookie, one JWT, one TokenBlocklist entry on
 * logout). This model tracks EVERY active login as its own record, so an
 * account can be logged in from a phone and a laptop simultaneously, see
 * both listed, and revoke either independently — without affecting the
 * other.
 *
 * RELATIONSHIP TO TokenBlocklist:
 *   TokenBlocklist remains the actual enforcement mechanism checked on
 *   every request (auth.middleware.js). Session is the human-readable
 *   ledger used for listing/management. Revoking a Session ALSO writes
 *   to TokenBlocklist (see session.controller.js) so revocation actually
 *   terminates that device's access, not just hides it from the list.
 *
 * AUTO-CLEANUP:
 *   TTL index on expiresAt (mirrors the JWT's own exp claim) — once a
 *   session's underlying token would have expired naturally anyway, the
 *   record is removed automatically. No manual cleanup job needed.
 */

import mongoose from 'mongoose';
import { parseDeviceLabel } from '../helpers/deviceParser.helper.js';

const sessionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    // The JWT's jti claim — links this record to a specific issued token.
    jti: {
      type: String,
      required: true,
      // unique: true,
    },
    deviceLabel: {
      type: String,
      default: 'Unknown device',
    },
    userAgent: {
      type: String,
      default: null,
      maxlength: 500,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    // Updated on every authenticated request via touchActivity() — see
    // auth.middleware.js. Powers the "Last active X ago" display.
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    // Mirrors the JWT's exp claim exactly, so the TTL index expires this
    // record at the same moment the underlying token would stop working.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.jti; // Never exposed to the client
        return ret;
      },
    },
  }
);

sessionSchema.index({ account: 1, isRevoked: 1 });
sessionSchema.index({ jti: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Create a new Session record at login time.
 * @param {{ accountId, jti, expiresAt, req }} params
 */
sessionSchema.statics.createForLogin = function ({ accountId, jti, expiresAt, req }) {
  const userAgent = req.headers['user-agent'] || '';
  return this.create({
    account: accountId,
    jti,
    deviceLabel: parseDeviceLabel(userAgent),
    userAgent: userAgent.substring(0, 500),
    ipAddress: req.ip,
    expiresAt,
  });
};

/** Non-blocking activity timestamp update — called on every authenticated request. */
sessionSchema.statics.touchActivity = function (jti) {
  return this.updateOne({ jti, isRevoked: false }, { $set: { lastActiveAt: new Date() } });
};

/** Get all currently-active (non-revoked, non-expired) sessions for an account, newest activity first. */
sessionSchema.statics.getActiveForAccount = function (accountId) {
  return this.find({ account: accountId, isRevoked: false, expiresAt: { $gt: new Date() } }).sort({
    lastActiveAt: -1,
  });
};

sessionSchema.statics.revokeByJti = function (jti) {
  return this.updateOne({ jti }, { $set: { isRevoked: true, revokedAt: new Date() } });
};

sessionSchema.statics.revokeById = function (sessionId, accountId) {
  return this.findOneAndUpdate(
    { _id: sessionId, account: accountId, isRevoked: false },
    { $set: { isRevoked: true, revokedAt: new Date() } },
    { new: true }
  );
};

/** Revoke every active session for an account EXCEPT the one matching keepJti (the caller's own current session). */
sessionSchema.statics.revokeAllExcept = function (accountId, keepJti) {
  return this.updateMany(
    { account: accountId, jti: { $ne: keepJti }, isRevoked: false },
    { $set: { isRevoked: true, revokedAt: new Date() } }
  );
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;