  "use strict";

/**
 * Account Model — Admin Authentication & Access Control
 *
 * Stores authentication credentials and access permissions for all
 * admin users (both Admin and Super Admin roles).
 *
 * An Account always references a Profile document. Personal identity
 * details (name, email, phone) live on the Profile. The Account holds
 * only auth-specific data.
 *
 * EMAIL DENORMALIZATION:
 *   The email field is duplicated here from Profile for fast authentication
 *   lookups (login by email). The two must remain in sync — the Account
 *   email is updated whenever the linked Profile email changes.
 *
 * SECURITY:
 *   - Password is hashed with bcryptjs before storage (12 salt rounds)
 *   - Password field is excluded from all queries by default (select: false)
 *   - Account locks for 15 minutes after 3 failed login attempts
 *   - Sessions expire after 60 minutes of inactivity (enforced via lastActivity check)
 *   - JWT invalidation: passwordChangedAt ensures tokens issued before a
 *     password change are rejected (changedPasswordAfter method)
 *   - Password reset: single-use, time-limited token (hashed before storage)
 *
 * SUPER ADMIN PROTECTION:
 *   The Super Admin account cannot delete its own account (enforced at
 *   controller level, not model level). This model has no awareness of it.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, AUTH } from "../config/constants.js";

const accountSchema = new mongoose.Schema(
  {
    // ── Identity Link ──────────────────────────────────────────────
    // Each Account is linked to exactly one Profile document.
    // This is the bridge between auth data and personal identity.
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "A profile must be linked to this account."],
      // unique: true, // One account per profile
    },

    // ── Email (Denormalized from Profile) ──────────────────────────
    // Stored here for fast auth lookups without a Profile join.
    email: {
      type: String,
      required: [true, "Email address is required."],
      // unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    // ── Authentication ─────────────────────────────────────────────
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false, // NEVER returned in queries unless explicitly selected
    },

    // ── Role & Access ──────────────────────────────────────────────
    role: {
      type: String,
      required: [true, "Role is required."],
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of: ${Object.values(ROLES).join(", ")}.`,
      },
      default: ROLES.ADMIN,
    },

    // ── Account Status ─────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    // ── Logout Tracking ───────────────────────────────────────────
    // Updated when the admin logs out. Used alongside the TokenBlocklist to
    // invalidate sessions. Any JWT issued before this timestamp is rejected
    // by the auth middleware, even if the JWT itself has not expired.
    // This provides a secondary layer of session termination for cases where
    // blocklist lookup is unavailable.
    
    loggedOutAt: {
      type: Date,
      default: null,
    },

    // ── Login Tracking & Account Lockout ──────────────────────────
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Updated on every authenticated request.
    // Auth middleware checks: if Date.now() - lastActivity > 60 min → session expired.
    lastActivity: {
      type: Date,
      default: null,
    },

    // ── Password Management ────────────────────────────────────────
    // Set whenever the password changes. Used to invalidate JWTs issued
    // before the password was changed.
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  

    // ── Audit: Who Created This Account ───────────────────────────
    // null for the seeded Super Admin (first account, created via script).
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
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
        delete ret.password;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
accountSchema.index({ email: 1 }, { unique: true });
accountSchema.index({ profile: 1 }, { unique: true });
accountSchema.index({ role: 1 });
accountSchema.index({ isActive: 1 });
accountSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────

/**
 * isLocked — true if the account is currently within a lockout period.
 * Depends on lockUntil, which is only loaded when explicitly selected.
 */
accountSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─────────────────────────────────────────────────────────────────────
// PRE-SAVE HOOKS
// ─────────────────────────────────────────────────────────────────────

/**
 * Hash password before saving if it has been modified.
 * Sets passwordChangedAt for existing accounts (not on initial creation).
 */
accountSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    this.password = await bcrypt.hash(this.password, AUTH.BCRYPT_SALT_ROUNDS);

    // Mark when password changed so existing JWTs can be invalidated.
    // Subtract 1 second to account for timestamp rounding during JWT issuance.
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }

    // next();
  } catch (err) {
    // next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Compare a plaintext candidate password against the stored hash.
 * Requires the account to have been queried with .select('+password').
 *
 * @param {string} candidatePassword - Plaintext password from login request
 * @returns {Promise<boolean>}
 */
accountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Handle a failed login attempt.
 * Increments the loginAttempts counter.
 * If the MAX_LOGIN_ATTEMPTS threshold is reached, locks the account
 * for LOCK_DURATION_MS milliseconds.
 *
 * If a previous lockout has expired, the counter resets to 1 instead
 * of incrementing from the stale value.
 *
 * @returns {Promise<void>}
 */
accountSchema.methods.incrementLoginAttempts = async function () {
  // If a previous lock has expired, reset and start fresh
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if this attempt pushes us to or past the threshold
  const willReachThreshold = this.loginAttempts + 1 >= AUTH.MAX_LOGIN_ATTEMPTS;
  const notAlreadyLocked = !this.lockUntil || this.lockUntil < Date.now();

  if (willReachThreshold && notAlreadyLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + AUTH.LOCK_DURATION_MS) };
  }

  return await this.updateOne(updates);
};

/**
 * Reset login attempts and lockout on successful login.
 * Updates lastLogin and lastActivity timestamps.
 *
 * @returns {Promise<void>}
 */
accountSchema.methods.resetLoginAttempts = async function () {
  const now = new Date();
  return await this.updateOne({
    $set: {
      loginAttempts: 0,
      lastLogin: now,
      lastActivity: now,
    },
    $unset: { lockUntil: 1 },
  });
};

/**
 * Update the lastActivity timestamp on each authenticated request.
 * Called by auth middleware. Non-blocking (fire-and-forget via updateOne).
 *
 * @returns {Promise<void>}
 */
accountSchema.methods.touchActivity = function () {
  return this.updateOne({ $set: { lastActivity: new Date() } });
};

/**
 * Check whether the account's password was changed AFTER the given JWT timestamp.
 * If it was, the JWT is considered invalid and the user must re-authenticate.
 *
 * @param {number} jwtIssuedAt - Unix timestamp (iat claim from JWT payload, in seconds)
 * @returns {boolean} true if password was changed after JWT was issued
 */
accountSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Find an account by email, including the password field.
 * Used exclusively by the authentication controller during login.
 *
 * @param {string} email
 * @returns {Promise<Account|null>}
 */
accountSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() })
    .select('+password +loginAttempts +lockUntil +passwordChangedAt');
};

/**
 * Find an account by email without the password.
 * Used for general lookups (profile, auth middleware).
 *
 * @param {string} email
 * @returns {Promise<Account|null>}
 */
accountSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

const Account = mongoose.model("Account", accountSchema);

export default Account;
