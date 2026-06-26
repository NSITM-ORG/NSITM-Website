'use strict';

/**
 * Authentication Middleware
 *
 * Protects all admin routes. Verifies the JWT stored in the HTTP-only
 * session cookie and attaches the authenticated account to req.account.
 *
 * Validation chain (in order — first failure short-circuits):
 *   1. Cookie present and JWT extractable
 *   2. JWT signature valid (not tampered)
 *   3. JWT not expired (exp claim)
 *   4. JWT jti not in TokenBlocklist (explicit logout check)
 *   5. Account exists in database
 *   6. Account is active (not deactivated by Super Admin)
 *   7. Session inactivity not exceeded (60 min — FRD Section 8.2)
 *   8. Password not changed after JWT was issued (changedPasswordAfter)
 *   9. Update lastActivity timestamp (non-blocking)
 *
 * On success: req.account contains the full account document (without password).
 * On failure: passes ApiError to next() — errorHandler responds with 401.
 *
 * FRD Section 8.2:
 *   "Sessions are managed via HTTP-only cookies containing a signed JWT."
 *   "JWT payload must contain: account ID, email, role, and expiry timestamp."
 *   "Session expires after 60 minutes of inactivity."
 */

import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Account from '../models/Account.model.js' ;
import TokenBlocklist from '../models/TokenBlocklist.model.js';
import { HTTP_STATUS, AUTH } from '../config/constants.js';
import logger from '../utils/logger.js';

// ── Cookie name for the session JWT ──────────────────────────────────
// Must match the name used when setting the cookie in auth.controller.js.
const SESSION_COOKIE_NAME = 'nsitm_session';

/**
 * protect — Main authentication middleware.
 * Attach to any route that requires a logged-in admin.
 *
 * Usage:
 *   router.get('/dashboard', protect, asyncHandler(controller.getDashboard));
 */
const protect = asyncHandler(async (req, res, next) => {
  // ── Step 1: Extract JWT from HTTP-only cookie ─────────────────
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'NOT_AUTHENTICATED',
        'You must be logged in to access this resource. Please log in and try again.'
      )
    );
  }

  // ── Step 2: Verify JWT signature and decode payload ───────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // TokenExpiredError and JsonWebTokenError are caught by errorHandler
    return next(err);
  }

  // ── Step 3: Check JWT ID against the logout blocklist ────────
  // If the admin explicitly logged out, this jti will be blocklisted
  // even if the token hasn't reached its natural expiry yet.
  if (decoded.jti) {
    const blocklisted = await TokenBlocklist.isBlocklisted(decoded.jti);
    if (blocklisted) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'TOKEN_INVALIDATED',
          'Your session has been invalidated. Please log in again.'
        )
      );
    }
  }

  // ── Step 4: Load the account from the database ────────────────
  const account = await Account.findById(decoded.id).populate('profile', 'fullName email phone');

  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'ACCOUNT_NOT_FOUND',
        'The account associated with this session no longer exists. Please contact your Super Admin.'
      )
    );
  }

  // ── Step 5: Check account is active ──────────────────────────
  if (!account.isActive) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'ACCOUNT_DEACTIVATED',
        'This account has been deactivated. Please contact the Super Admin to restore access.'
      )
    );
  }

  // ── Step 6: Check session inactivity (60-minute sliding window)
  // FRD Section 8.2: "Session expires after 60 minutes of inactivity."
  if (account.lastActivity) {
    const inactiveFor = Date.now() - account.lastActivity.getTime();
    if (inactiveFor > AUTH.SESSION_INACTIVITY_LIMIT_MS) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'SESSION_EXPIRED',
          'Your session has expired due to inactivity. Please log in again.'
        )
      );
    }
  }

  // ── Step 7: Check password not changed after JWT was issued ───
  // Ensures that password changes invalidate all previously issued JWTs.
  if (account.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'PASSWORD_CHANGED',
        'Your password was recently changed. Please log in again with your new password.'
      )
    );
  }

  // ── Step 8: Update lastActivity (non-blocking, fire-and-forget)
  // Implements the sliding window inactivity timer.
  account.touchActivity().catch((err) => {
    logger.warn('Failed to update lastActivity on account', {
      accountId: account._id,
      error: err.message,
    });
  });

  // ── Attach to request ─────────────────────────────────────────
  req.account = account;
  req.token = token;
  req.tokenJti = decoded.jti;

  next();
});

export { protect, SESSION_COOKIE_NAME };