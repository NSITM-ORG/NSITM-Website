'use strict';

/**
 * Super Admin Auth Controller
 * Routes: /api/v1/superadmin/auth/*
 *
 * Deliberately separate from auth.controller.js (Admin-scoped) to keep
 * Super Admin's namespace isolated ahead of v2's student auth namespace.
 *
 * REGISTRATION (point 1/2):
 *   Guarded by SUPER_ADMIN_SETUP_KEY — a static secret held by whoever
 *   controls deployment (founder / Tech Lead). Anyone holding this key
 *   can self-register as a Super Admin. Rotate or remove this env var
 *   once initial setup is complete if no further Super Admins are needed
 *   via this route.
 */

import crypto from 'crypto';
import Account from '../models/Account.model.js';
import Profile from '../models/Profile.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import Session from '../models/Session.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { signAccessToken, setSessionCookie } from '../services/token.service.js';
import { sendPasswordResetLink } from '../services/email.service.js';
import { generateToken, hashToken, secureCompare } from '../helpers/tokenGenerator.helper.js';
import { HTTP_STATUS, AUTH, AUDIT_ACTIONS, ROLES, PROFILE_TYPES } from '../config/constants.js';
import logger from '../utils/logger.js';


// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/auth/register
// Guarded by setup key. Creates Profile + Account with role SUPER_ADMIN.
// ─────────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res, next) => {
  const { setupKey, name, email, phone, password } = req.body;

  const expectedKey = process.env.SUPER_ADMIN_SETUP_KEY;
  if (!expectedKey) {
    logger.error('SUPER_ADMIN_SETUP_KEY is not configured on the server.');
    return next(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'SETUP_NOT_CONFIGURED', 'Super Admin registration is not currently available. Contact the Tech Lead.'));
  }

  if (!secureCompare(setupKey, expectedKey)) {
    return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'INVALID_SETUP_KEY', 'The setup key provided is incorrect.'));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingAccount = await Account.findByEmail(normalizedEmail);
  if (existingAccount) {
    return next(new ApiError(HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS', `An account with email '${email}' already exists.`));
  }

  const { profile } = await Profile.findOrCreate({
    fullName: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    profileType: PROFILE_TYPES.ADMIN,
    isVerified: true,
  });

  const account = await Account.create({
    profile: profile._id,
    email: normalizedEmail,
    password,
    role: ROLES.SUPER_ADMIN,
    isActive: true,
    createdBy: null,
  });

  await req.logAction(AUDIT_ACTIONS.SUPER_ADMIN_REGISTERED, {
    targetModel: 'Account', targetId: account._id,
    description: `Super Admin self-registered: ${normalizedEmail}`,
  });

  await account.populate('profile', 'fullName email phone');

  return sendSuccess(res, HTTP_STATUS.CREATED, {
    account: { id: account._id, email: account.email, role: account.role, profile: account.profile },
  }, 'Super Admin account created successfully. You may now log in.');
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/auth/login — role-restricted to SUPER_ADMIN only
// ─────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const account = await Account.findByEmailWithPassword(email);

  if (!account || account.role !== ROLES.SUPER_ADMIN) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Incorrect email or password.'));
  }

  if (!account.isActive) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated.'));
  }

  if (account.isLocked) {
    await req.logAction(AUDIT_ACTIONS.FAILED_LOGIN, {
      targetModel: 'Account', targetId: account._id,
      description: `Login attempt on locked Super Admin account: ${email}`, outcome: 'failure',
    });
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_LOCKED', 'This account has been temporarily locked. Please try again in 15 minutes.'));
  }

  const isPasswordCorrect = await account.comparePassword(password);

  if (!isPasswordCorrect) {
    await account.incrementLoginAttempts();
    const updated = await Account.findByEmailWithPassword(email);

    await req.logAction(AUDIT_ACTIONS.FAILED_LOGIN, {
      targetModel: 'Account', targetId: account._id,
      description: `Failed Super Admin login attempt: ${email}`,
      metadata: { isNowLocked: updated?.isLocked || false }, outcome: 'failure',
    });

    if (updated?.isLocked) {
      await req.logAction(AUDIT_ACTIONS.ACCOUNT_LOCKED, {
        targetModel: 'Account', targetId: account._id,
        description: `Super Admin account locked after ${AUTH.MAX_LOGIN_ATTEMPTS} failed attempts: ${email}`,
      });
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'ACCOUNT_LOCKED', 'This account has been temporarily locked due to too many failed attempts.'));
    }
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Incorrect email or password.'));
  }

  await account.resetLoginAttempts();
  const { token, jti, expiresAt } = signAccessToken(account);
  setSessionCookie(res, token, expiresAt);
  await Session.createForLogin({ accountId: account._id, jti, expiresAt, req });
  await account.populate('profile', 'fullName email phone whatsappNumber avatarUrl');

  await req.logAction(AUDIT_ACTIONS.LOGIN, {
    targetModel: 'Account', targetId: account._id, description: `Successful Super Admin login: ${email}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, {
    account: { id: account._id, email: account.email, role: account.role, profile: account.profile, lastLogin: account.lastLogin },
  }, 'Login successful. Welcome back.');
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/auth/forgot-password — scoped to role: super_admin only
// ─────────────────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const NEUTRAL_MESSAGE = 'If an account with that email address exists, you will receive a password reset link shortly.';

  const account = await Account.findByEmail(email);

  if (!account || account.role !== ROLES.SUPER_ADMIN || !account.isActive) {
    return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL_MESSAGE);
  }

  await PasswordResetToken.invalidateAllForAccount(account._id);

  const { rawToken, tokenHash } = generateToken(32);
  await PasswordResetToken.create({
    account: account._id,
    tokenHash,
    initiatedBy: 'self',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 500),
  });

  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000';
  const resetLink = `${adminUrl}/superadmin/reset-password/${rawToken}`;

  const emailResult = await sendPasswordResetLink(account.email, {
    adminName: account.profile?.fullName || account.email,
    resetLink,
  });

  if (!emailResult.success) {
    logger.error('Super Admin password reset email failed to deliver', { accountId: account._id, error: emailResult.error });
  }

  await req.logAction(AUDIT_ACTIONS.PASSWORD_RESET_REQUEST, {
    targetModel: 'Account', targetId: account._id,
    description: `Super Admin password reset requested: ${email}`,
    metadata: { targetEmail: account.email, targetRole: account.role, initiatedBy: 'self', emailSent: emailResult.success },
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, NEUTRAL_MESSAGE);
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/auth/reset-password — scoped to role: super_admin only
// ─────────────────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token: rawToken, password } = req.body;
  const tokenHash = hashToken(rawToken);

  const resetDoc = await PasswordResetToken.findByHash(tokenHash);

  if (!resetDoc) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_TOKEN', 'This reset link is invalid. Please request a new one.'));
  }
  if (resetDoc.isUsed) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'TOKEN_ALREADY_USED', 'This reset link has already been used. Please request a new one.'));
  }
  if (resetDoc.isInvalidated) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'TOKEN_INVALIDATED', 'This reset link is no longer valid. Please request a new one.'));
  }

  const account = await Account.findById(resetDoc.account).select('+password');

  if (!account || account.role !== ROLES.SUPER_ADMIN) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_TOKEN', 'This reset link is invalid. Please request a new one.'));
  }

  const isSamePassword = await account.comparePassword(password);
  if (isSamePassword) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'SAME_PASSWORD', 'New password must be different from your current password.'));
  }

  account.password = password;
  await account.save();
  await Account.findByIdAndUpdate(account._id, { $set: { loggedOutAt: new Date() } });
  await resetDoc.markAsUsed();

  await req.logAction(AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE, {
    targetModel: 'Account', targetId: account._id,
    description: `Super Admin password reset completed: ${account.email}`,
    metadata: { targetEmail: account.email, targetRole: account.role, initiatedBy: resetDoc.initiatedBy },
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, 'Your password has been updated. Please log in with your new password.');
});

export { register, login, forgotPassword, resetPassword };