"use strict";

/**
 * Auth Controller — ADMIN-scoped authentication
 * Routes: /api/v1/admin/auth/*
 *
 * This file is intentionally restricted to accounts with role === 'admin'.
 * Super Admin authentication lives in superAdminAuth.controller.js as a
 * deliberately separate namespace (point 1/2 of the auth overhaul).
 *
 * logout() and getMe() are role-agnostic (any authenticated account) and
 * are re-exported for use by both /admin/auth and /superadmin/auth routes.
 */

import Account from '../models/Account.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import TokenBlocklist from '../models/TokenBlocklist.model.js';
import Session from '../models/Session.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  signAccessToken,
  setSessionCookie,
  clearSessionCookie,
} from '../services/token.service.js';
import { sendPasswordResetLink } from '../services/email.service.js';
import {
  generateToken,
  hashToken,
} from '../helpers/tokenGenerator.helper.js';
import {
  HTTP_STATUS,
  AUTH,
  AUDIT_ACTIONS,
  ROLES,
} from '../config/constants.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken'

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/auth/login — role-restricted to ADMIN only
// ─────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const account = await Account.findByEmailWithPassword(email);

  // Generic message for both "not found" and "wrong role" — never reveal which
  if (!account || account.role !== ROLES.ADMIN) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
        "Incorrect email or password.",
      ),
    );
  }

  if (!account.isActive) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "ACCOUNT_DEACTIVATED",
        "This account has been deactivated. Please contact the Super Admin to restore access.",
      ),
    );
  }

  if (account.isLocked) {
    await req.logAction(AUDIT_ACTIONS.FAILED_LOGIN, {
      targetModel: "Account",
      targetId: account._id,
      description: `Login attempt on locked account: ${email}`,
      outcome: "failure",
    });
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "ACCOUNT_LOCKED",
        "This account has been temporarily locked. Please try again in 15 minutes or contact the Super Admin.",
      ),
    );
  }

  const isPasswordCorrect = await account.comparePassword(password);

  if (!isPasswordCorrect) {
    await account.incrementLoginAttempts();
    const updated = await Account.findByEmailWithPassword(email);

    await req.logAction(AUDIT_ACTIONS.FAILED_LOGIN, {
      targetModel: "Account",
      targetId: account._id,
      description: `Failed login attempt for: ${email}`,
      metadata: { isNowLocked: updated?.isLocked || false },
      outcome: "failure",
    });

    if (updated?.isLocked) {
      await req.logAction(AUDIT_ACTIONS.ACCOUNT_LOCKED, {
        targetModel: "Account",
        targetId: account._id,
        description: `Account locked after ${AUTH.MAX_LOGIN_ATTEMPTS} failed attempts: ${email}`,
      });
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "ACCOUNT_LOCKED",
          "This account has been temporarily locked due to too many failed attempts. Please try again in 15 minutes or contact the Super Admin.",
        ),
      );
    }
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "INVALID_CREDENTIALS",
        "Incorrect email or password.",
      ),
    );
  }

  await account.resetLoginAttempts();
  const { token, jti, expiresAt } = signAccessToken(account);
  setSessionCookie(res, token, expiresAt);

  // Track this login as a new active session (Issue 2 — multi-device support)
  await Session.createForLogin({ accountId: account._id, jti, expiresAt, req });

  // Populate profile for response
  await account.populate('profile', 'fullName email phone avatarUrl');

  await req.logAction(AUDIT_ACTIONS.LOGIN, {
    targetModel: "Account",
    targetId: account._id,
    description: `Successful admin login: ${email}`,
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      account: {
        id: account._id,
        email: account.email,
        role: account.role,
        profile: account.profile,
        lastLogin: account.lastLogin,
      },
    },
    "Login successful. Welcome back.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/auth/forgot-password — scoped to role: admin only
// ─────────────────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const NEUTRAL_MESSAGE =
    "If an account with that email address exists, you will receive a password reset link shortly.";

  const account = await Account.findByEmail(email);

  if (!account || account.role !== ROLES.ADMIN || !account.isActive) {
    return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL_MESSAGE);
  }

  // Invalidate any previous unused tokens for this account (point 10)
  await PasswordResetToken.invalidateAllForAccount(account._id);

  const { rawToken, tokenHash } = generateToken(32);
  await PasswordResetToken.create({
    account: account._id,
    tokenHash,
    initiatedBy: "self",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]?.substring(0, 500),
  });

  const adminUrl = process.env.ADMIN_URL || "http://localhost:3000";
  const resetLink = `${adminUrl}/admin/reset-password/${rawToken}`;

  const emailResult = await sendPasswordResetLink(account.email, {
    adminName: account.profile?.fullName || account.email,
    resetLink,
  });

  if (!emailResult.success) {
    logger.error("Admin password reset email failed to deliver", {
      accountId: account._id,
      error: emailResult.error,
    });
  }

  await req.logAction(AUDIT_ACTIONS.PASSWORD_RESET_REQUEST, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin password reset requested: ${email}`,
    metadata: {
      targetEmail: account.email,
      targetRole: account.role,
      initiatedBy: "self",
      emailSent: emailResult.success,
    },
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL_MESSAGE);
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/auth/reset-password — scoped to role: admin only
// No time-based expiry — only isUsed/isInvalidated are checked (point 10)
// ─────────────────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token: rawToken, password } = req.body;
  const tokenHash = hashToken(rawToken);

  const resetDoc = await PasswordResetToken.findByHash(tokenHash);

  if (!resetDoc) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "INVALID_TOKEN",
        "This reset link is invalid. Please request a new one.",
      ),
    );
  }
  if (resetDoc.isUsed) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "TOKEN_ALREADY_USED",
        "This reset link has already been used. Please request a new one.",
      ),
    );
  }
  if (resetDoc.isInvalidated) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "TOKEN_INVALIDATED",
        "This reset link is no longer valid. Please request a new one.",
      ),
    );
  }

  const account = await Account.findById(resetDoc.account).select("+password");

  if (!account || account.role !== ROLES.ADMIN) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "INVALID_TOKEN",
        "This reset link is invalid. Please request a new one.",
      ),
    );
  }

  const isSamePassword = await account.comparePassword(password);
  if (isSamePassword) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "SAME_PASSWORD",
        "New password must be different from your current password.",
      ),
    );
  }

  account.password = password;
  await account.save();
  await Account.findByIdAndUpdate(account._id, {
    $set: { loggedOutAt: new Date() },
  });
  await resetDoc.markAsUsed();

  await req.logAction(AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin password reset completed: ${account.email}`,
    metadata: {
      targetEmail: account.email,
      targetRole: account.role,
      initiatedBy: resetDoc.initiatedBy,
    },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "Your password has been updated. Please log in with your new password.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/{admin|superadmin}/auth/logout — role-agnostic
// ─────────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res, next) => {
  const { tokenJti, token } = req;
  const account = req.account;

  if (tokenJti) {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000);
    await TokenBlocklist.blacklist(tokenJti, account._id, expiresAt);
    await Session.revokeByJti(tokenJti);
  }

  await Account.findByIdAndUpdate(account._id, { loggedOutAt: new Date() });
  clearSessionCookie(res);

  await req.logAction(AUDIT_ACTIONS.LOGOUT, {
    targetModel: "Account",
    targetId: account._id,
    description: `Logout: ${account.email}`,
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "You have been logged out successfully.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/{admin|superadmin}/auth/me — role-agnostic
// ─────────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.account._id)
    .populate(
      "profile",
      "fullName email phone whatsappNumber avatarUrl profileType",
    )
    .populate("createdBy", "email role");

  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Account not found.",
      ),
    );
  }

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { account },
    "Profile retrieved successfully.",
  );
});

export {
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
