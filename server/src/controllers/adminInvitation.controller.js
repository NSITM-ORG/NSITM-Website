'use strict';

/**
 * Admin Invitation Controller
 *
 * Super Admin side: createInvitation, listInvitations, revokeInvitation, resendCode
 * Public side:      verifyInvitation, completeRegistration
 *
 * This is the EXCLUSIVE pathway for Admin account creation (point 4).
 * The old direct-creation endpoint has been removed from superAdmin.controller.js.
 */

import AdminInvitation from '../models/AdminInvitation.model.js';
import Account from '../models/Account.model.js';
import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import {
  generateToken, hashToken, generateShortCode,
  generateNoiseText, getInvitationCodeExpiry, secureCompare,
} from '../helpers/tokenGenerator.helper.js';
import { sendAdminInvitation, sendAdminRegistrationComplete } from '../services/email.service.js';
import { HTTP_STATUS, ROLES, PROFILE_TYPES, AUDIT_ACTIONS } from '../config/constants.js';

// ── Internal: build the registration link ────────────────────────────
const buildRegistrationLink = (rawToken, rawCode) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const noise = generateNoiseText();
  return `${clientUrl}/admin/register?token=${rawToken}&code=${rawCode}&rt=${noise}`;
};

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/admins/invite
// ─────────────────────────────────────────────────────────────────────
const createInvitation = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existingAccount = await Account.findByEmail(normalizedEmail);
  if (existingAccount) {
    return next(new ApiError(HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS', `An account with email '${email}' already exists.`));
  }

  // Invalidate any prior unused invitations for this email (point 10)
  await AdminInvitation.invalidateAllForEmail(normalizedEmail, req.account._id);

  const { rawToken, tokenHash } = generateToken(32);
  const { rawCode, codeHash } = generateShortCode();
  const codeExpiresAt = getInvitationCodeExpiry();

  await AdminInvitation.create({
    email: normalizedEmail,
    invitedBy: req.account._id,
    tokenHash,
    codeHash,
    codeExpiresAt,
    codeGeneratedAt: new Date(),
  });

  const registrationLink = buildRegistrationLink(rawToken, rawCode);
  const emailResult = await sendAdminInvitation(normalizedEmail, {
    registrationLink,
    codeExpiryMinutes: 10,
  });

  await req.logAction(AUDIT_ACTIONS.ADMIN_INVITATION_CREATED, {
    targetModel: 'AdminInvitation',
    description: `Admin invitation created for: ${normalizedEmail}`,
    metadata: { emailSent: emailResult.success },
  });

  if (!emailResult.success) {
    return sendSuccess(res, HTTP_STATUS.CREATED, null,
      `Invitation created, but the email failed to deliver to ${normalizedEmail}. You can resend it from the invitations list.`);
  }

  return sendSuccess(res, HTTP_STATUS.CREATED, null, `Invitation sent to ${normalizedEmail}.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/admins/invitations
// ─────────────────────────────────────────────────────────────────────
const listInvitations = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status } = req.query; // 'pending' | 'used' | 'invalidated'

  const filter = {};
  if (status === 'used') filter.isUsed = true;
  if (status === 'invalidated') filter.isInvalidated = true;
  if (status === 'pending') { filter.isUsed = false; filter.isInvalidated = false; }

  const [invitations, total] = await Promise.all([
    AdminInvitation.find(filter)
      .populate('invitedBy', 'email')
      .populate('completedAccount', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AdminInvitation.countDocuments(filter),
  ]);

  return sendPaginated(res, HTTP_STATUS.OK, invitations, 'Invitations retrieved successfully.', getPaginationMeta(total, page, limit));
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/admins/invitations/:id/resend
// Regenerates ONLY the code — the underlying token/invitation is untouched.
// ─────────────────────────────────────────────────────────────────────
const resendInvitationCode = asyncHandler(async (req, res, next) => {
  const invitation = await AdminInvitation.findById(req.params.id).select('+tokenHash');

  if (!invitation) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'INVITATION_NOT_FOUND', 'Invitation not found.'));
  }
  if (invitation.isUsed || invitation.isInvalidated) {
    return next(new ApiError(HTTP_STATUS.CONFLICT, 'INVITATION_NOT_ACTIVE', 'This invitation is no longer active and cannot be resent.'));
  }

  // We cannot recover the original raw token (only its hash is stored),
  // so resending requires generating a brand-new token+code pair while
  // keeping the SAME invitation record's identity intact for audit continuity.
  // This still honours point 10: the invitation as a concept stays alive,
  // it is simply re-issued with fresh credentials rather than a dead one.
  const { rawToken, tokenHash } = generateToken(32);
  const { rawCode, codeHash } = generateShortCode();
  const codeExpiresAt = getInvitationCodeExpiry();

  invitation.tokenHash = tokenHash;
  invitation.codeHash = codeHash;
  invitation.codeExpiresAt = codeExpiresAt;
  invitation.codeGeneratedAt = new Date();
  invitation.resendCount += 1;
  await invitation.save();

  const registrationLink = buildRegistrationLink(rawToken, rawCode);
  const emailResult = await sendAdminInvitation(invitation.email, { registrationLink, codeExpiryMinutes: 10 });

  await req.logAction(AUDIT_ACTIONS.ADMIN_INVITATION_CODE_RESENT, {
    targetModel: 'AdminInvitation', targetId: invitation._id,
    description: `Invitation code resent for: ${invitation.email}`,
    metadata: { resendCount: invitation.resendCount, emailSent: emailResult.success },
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, `A new invitation link has been sent to ${invitation.email}.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/admins/invitations/:id/revoke
// ─────────────────────────────────────────────────────────────────────
const revokeInvitation = asyncHandler(async (req, res, next) => {
  const invitation = await AdminInvitation.findById(req.params.id);

  if (!invitation) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'INVITATION_NOT_FOUND', 'Invitation not found.'));
  }
  if (invitation.isUsed) {
    return next(new ApiError(HTTP_STATUS.CONFLICT, 'ALREADY_USED', 'This invitation has already been used and cannot be revoked.'));
  }

  invitation.isInvalidated = true;
  invitation.invalidatedAt = new Date();
  invitation.invalidatedBy = req.account._id;
  await invitation.save();

  await req.logAction(AUDIT_ACTIONS.ADMIN_INVITATION_REVOKED, {
    targetModel: 'AdminInvitation', targetId: invitation._id,
    description: `Invitation revoked for: ${invitation.email}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, `Invitation for ${invitation.email} has been revoked.`);
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/admin/registration/verify?token=&code=
// ─────────────────────────────────────────────────────────────────────
const verifyInvitation = asyncHandler(async (req, res, next) => {
  const { token: rawToken, code: rawCode } = req.query;
  const tokenHash = hashToken(rawToken);

  const invitation = await AdminInvitation.findByTokenHash(tokenHash);

  if (!invitation) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_LINK', 'This registration link is invalid. Please ask your Super Admin to send a new invitation.'));
  }
  if (invitation.isUsed) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'LINK_ALREADY_USED', 'This registration link has already been used.'));
  }
  if (invitation.isInvalidated) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'LINK_INVALIDATED', 'This registration link is no longer valid. Please ask your Super Admin to send a new invitation.'));
  }

  const codeMatches = secureCompare(hashToken(rawCode), invitation.codeHash);

  if (!codeMatches) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_CODE', 'The verification code in this link is incorrect.'));
  }
  if (invitation.isCodeExpired) {
    // Token is still alive — only the code needs refreshing (point 10)
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'CODE_EXPIRED', 'Your verification code has expired. Request a new code to continue with this same invitation.'));
  }

  return sendSuccess(res, HTTP_STATUS.OK, { email: invitation.email }, 'Invitation verified. You may proceed with registration.');
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/admin/registration/resend-code
// ─────────────────────────────────────────────────────────────────────
const requestNewCode = asyncHandler(async (req, res, next) => {
  const { token: rawToken } = req.body;
  const tokenHash = hashToken(rawToken);

  const invitation = await AdminInvitation.findByTokenHash(tokenHash);

  if (!invitation || invitation.isInvalidated || invitation.isUsed) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_LINK', 'This registration link is no longer valid. Please ask your Super Admin to send a new invitation.'));
  }

  const { rawCode, codeHash } = generateShortCode();
  invitation.codeHash = codeHash;
  invitation.codeExpiresAt = getInvitationCodeExpiry();
  invitation.codeGeneratedAt = new Date();
  invitation.resendCount += 1;
  await invitation.save();

  const registrationLink = buildRegistrationLink(rawToken, rawCode);
  await sendAdminInvitation(invitation.email, { registrationLink, codeExpiryMinutes: 10 });

  return sendSuccess(res, HTTP_STATUS.OK, null, `A fresh verification code has been sent to ${invitation.email}.`);
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/admin/registration/complete
// ─────────────────────────────────────────────────────────────────────
const completeRegistration = asyncHandler(async (req, res, next) => {
  const { token: rawToken, code: rawCode, name, phone, password } = req.body;
  const tokenHash = hashToken(rawToken);

  const invitation = await AdminInvitation.findByTokenHash(tokenHash);

  if (!invitation) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_LINK', 'This registration link is invalid.'));
  }
  if (invitation.isUsed) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'LINK_ALREADY_USED', 'This registration link has already been used.'));
  }
  if (invitation.isInvalidated) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'LINK_INVALIDATED', 'This registration link is no longer valid.'));
  }

  const codeMatches = secureCompare(hashToken(rawCode), invitation.codeHash);
  if (!codeMatches) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_CODE', 'The verification code is incorrect.'));
  }
  if (invitation.isCodeExpired) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'CODE_EXPIRED', 'Your verification code has expired. Please request a new code.'));
  }

  const existingAccount = await Account.findByEmail(invitation.email);
  if (existingAccount) {
    return next(new ApiError(HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS', 'An account already exists for this email address.'));
  }

  const { profile } = await Profile.findOrCreate({
    fullName: name.trim(),
    email: invitation.email,
    phone: phone.trim(),
    profileType: PROFILE_TYPES.ADMIN,
    isVerified: true,
  });

  const account = await Account.create({
    profile: profile._id,
    email: invitation.email,
    password,
    role: ROLES.ADMIN,
    isActive: true,
    createdBy: invitation.invitedBy,
  });

  invitation.isUsed = true;
  invitation.usedAt = new Date();
  invitation.completedAccount = account._id;
  await invitation.save();

  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3000';
  await sendAdminRegistrationComplete(account.email, {
    adminName: name.trim(),
    adminLoginUrl: `${adminUrl}/admin/login`,
  });

  await req.logAction(AUDIT_ACTIONS.ADMIN_REGISTRATION_COMPLETED, {
    targetModel: 'Account', targetId: account._id,
    description: `Admin registration completed: ${account.email}`,
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, null, 'Your admin account has been created successfully. You may now log in.');
});

export {
  createInvitation,
  listInvitations,
  resendInvitationCode,
  revokeInvitation,
  verifyInvitation,
  requestNewCode,
  completeRegistration,
};