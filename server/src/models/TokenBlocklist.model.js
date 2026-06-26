'use strict';

/**
 * TokenBlocklist Model — JWT Logout Blocklist
 *
 * When an admin logs out, their JWT's unique ID (jti claim) is stored here.
 * The auth middleware checks every incoming JWT against this collection.
 * If the jti is found, the token is rejected regardless of whether it has
 * technically expired yet.
 *
 * This implements the FRD Section 8.2 requirement:
 * "On logout, the session cookie is cleared client-side and the server
 * adds the token to a blocklist until its natural expiry time."
 *
 * AUTOMATIC CLEANUP:
 *   The TTL index on `expiresAt` instructs MongoDB to automatically delete
 *   entries once the token's natural expiry time passes. This keeps the
 *   collection small — it never accumulates stale data.
 *
 * JWT REQUIREMENT:
 *   Every JWT issued by this system must include a `jti` (JWT ID) claim
 *   containing a unique identifier (crypto.randomUUID()). This is set in
 *   src/services/token.service.js.
 *
 * COLLECTION SIZE:
 *   In normal operation, this collection holds at most one entry per
 *   currently-logged-in admin who has explicitly logged out before their
 *   token expires. It is typically near-empty.
 */

import mongoose from 'mongoose';

const tokenBlocklistSchema = new mongoose.Schema(
  {
    // ── The JWT's unique identifier claim ─────────────────────────
    // Generated with crypto.randomUUID() at token issuance.
    // Must be unique across all tokens.
    jti: {
      type: String,
      required: [true, 'JWT ID (jti) is required.'],
      // unique: true,
      trim: true,
    },

    // ── The account that owned this token ─────────────────────────
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },

    // ── Token expiry time ─────────────────────────────────────────
    // MongoDB's TTL index uses this field to automatically delete
    // the blocklist entry once the token has naturally expired.
    // Set to the same value as the JWT's `exp` claim.
    expiresAt: {
      type: Date,
      required: [true, 'Token expiry time is required.'],
    },
  },
  {
    // Only createdAt — blocklist entries are immutable
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────

// Unique index on jti for fast O(1) lookup on every authenticated request
tokenBlocklistSchema.index({ jti: 1 }, { unique: true });

// TTL index: MongoDB auto-deletes documents when expiresAt < current time.
// expireAfterSeconds: 0 means "delete immediately when the date passes."
tokenBlocklistSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: 'token_blocklist_ttl',
  }
);

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Check whether a given jti has been blocklisted (i.e., the token was
 * explicitly invalidated via logout).
 * Called on every authenticated request in auth.middleware.js.
 *
 * @param {string} jti - The jti claim from the verified JWT payload
 * @returns {Promise<boolean>} true if blocklisted (token rejected), false if clean
 */
tokenBlocklistSchema.statics.isBlocklisted = async function (jti) {
  const entry = await this.findOne({ jti }).lean();
  return entry !== null;
};

/**
 * Add a token to the blocklist on logout.
 * Called by the auth controller's logout action.
 *
 * @param {string} jti - The JWT's jti claim
 * @param {ObjectId} accountId - The account logging out
 * @param {Date} expiresAt - The token's natural expiry time (from JWT exp claim)
 * @returns {Promise<void>}
 */
tokenBlocklistSchema.statics.blacklist = async function (jti, accountId, expiresAt) {
  try {
    await this.create({ jti, accountId, expiresAt });
  } catch (err) {
    // Duplicate jti means the token is already blocklisted — ignore silently
    if (err.code !== 11000) throw err;
  }
};

const TokenBlocklist = mongoose.model('TokenBlocklist', tokenBlocklistSchema);

export default TokenBlocklist;