'use strict';

/**
 * Self-Account Controller — Self-service profile & password management
 * (Issue 3). Available to ANY authenticated account regardless of role.
 * Operates exclusively on req.account — never on another account — so
 * no authorize() role check is applied beyond protect (must be logged in).
 *
 * BOTH actions require the account's CURRENT password as confirmation,
 * per explicit product decision:
 *
 *   - Profile changes (name/email/phone) ALWAYS require currentPassword.
 *
 *   - This direct password-change flow ALWAYS requires currentPassword.
 *     This is intentionally distinct from — and additive to — the
 *     existing forgot-password EMAIL LINK flow, which exists precisely
 *     for the case where the user does NOT know their current password
 *     and therefore cannot supply it. Both flows remain available:
 *       - Forgot password (no current password needed, email link required)
 *       - Change password (current password required, no email link needed)
 *
 * SECURITY: A successful password change updates passwordChangedAt via
 * the Account model's existing pre-save hook, which automatically
 * invalidates every previously-issued JWT (including the one used to
 * make THIS request) via the existing changedPasswordAfter() check in
 * auth.middleware.js. The account is logged out of the current device
 * as a natural side effect — no special-case logic needed here.
 */

import Account from '../models/Account.model.js';
import Profile from '../models/Profile.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// PATCH /{admin|superadmin}/auth/profile
// ─────────────────────────────────────────────────────────────────────
const updateOwnProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone, currentPassword } = req.body;

  const account = await Account.findById(req.account._id).select('+password');

  const passwordCorrect = await account.comparePassword(currentPassword);
  if (!passwordCorrect) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INCORRECT_PASSWORD', 'Your current password is incorrect.'));
  }

  const profileId = req.account.profile._id || req.account.profile;

  if (email && email.toLowerCase().trim() !== account.email) {
    const normalizedEmail = email.toLowerCase().trim();
    const emailTaken = await Account.findByEmail(normalizedEmail);
    if (emailTaken && emailTaken._id.toString() !== account._id.toString()) {
      return next(new ApiError(HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_EXISTS', `Email '${email}' is already in use.`));
    }
    account.email = normalizedEmail;
    await account.save();
    await Profile.findByIdAndUpdate(profileId, { $set: { email: normalizedEmail } });
  }

  const profileUpdates = {};
  if (name) profileUpdates.fullName = name.trim();
  if (phone) profileUpdates.phone = phone.trim();
  if (Object.keys(profileUpdates).length > 0) {
    await Profile.findByIdAndUpdate(profileId, { $set: profileUpdates });
  }

  await req.logAction(AUDIT_ACTIONS.SELF_PROFILE_UPDATED, {
    targetModel: 'Account',
    targetId: account._id,
    description: `Account self-updated their profile: ${account.email}`,
  });

  const updatedAccount = await Account.findById(account._id).populate('profile', 'fullName email phone whatsappNumber');

  return sendSuccess(res, HTTP_STATUS.OK, { account: updatedAccount }, 'Profile updated successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// POST /{admin|superadmin}/auth/change-password
// ─────────────────────────────────────────────────────────────────────
const changeOwnPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const account = await Account.findById(req.account._id).select('+password');

  const passwordCorrect = await account.comparePassword(currentPassword);
  if (!passwordCorrect) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INCORRECT_PASSWORD', 'Your current password is incorrect.'));
  }

  const isSamePassword = await account.comparePassword(newPassword);
  if (isSamePassword) {
    return next(
      new ApiError(HTTP_STATUS.BAD_REQUEST, 'SAME_PASSWORD', 'New password must be different from your current password.')
    );
  }

  account.password = newPassword;
  await account.save(); // hashes + sets passwordChangedAt — invalidates all existing tokens automatically

  await Account.findByIdAndUpdate(account._id, { $set: { loggedOutAt: new Date() } });

  await req.logAction(AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE, {
    targetModel: 'Account',
    targetId: account._id,
    description: `Account self-changed their password directly: ${account.email}`,
    metadata: { targetEmail: account.email, targetRole: account.role, initiatedBy: 'self', method: 'direct' },
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, 'Your password has been updated. Please log in again with your new password.');
});

export { updateOwnProfile, changeOwnPassword };