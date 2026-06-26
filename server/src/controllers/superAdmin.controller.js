"use strict";

/**
 * Super Admin Controller — Admin Account Management
 * FRD FR-05.1, BR06, BR11
 */

import Account from "../models/Account.model.js";
import Profile from "../models/Profile.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination.js";
import PasswordResetToken from "../models/PasswordResetToken.model.js";
import { generateToken } from "../helpers/tokenGenerator.helper.js";
import { sendPasswordResetLink } from "../services/email.service.js";
import {
  HTTP_STATUS,
  ROLES,
  AUDIT_ACTIONS,
  PROFILE_TYPES,
} from "../config/constants.js";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/superadmin/accounts
// ─────────────────────────────────────────────────────────────────────

// (adds an optional ?role= filter so Super Admin can view all Super
// Admins specifically — supports point 8):

const getAllAdminAccounts = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { role } = req.query;

  const filter = {};
  if (role) filter.role = role;

  const [accounts, total] = await Promise.all([
    Account.find(filter)
      .populate("profile", "fullName email phone")
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Account.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    accounts,
    "Accounts retrieved successfully.",
    getPaginationMeta(total, page, limit),
  );
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/accounts
// Create new admin account (BR11 — only Super Admin can create admins)
// ─────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/v1/superadmin/accounts/:id
// Update admin account details
// ─────────────────────────────────────────────────────────────────────
const updateAdminAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id).populate("profile");

  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Admin account not found.",
      ),
    );
  }

  const { name, email } = req.body;

  if (email && email !== account.email) {
    const emailTaken = await Account.findByEmail(email);
    if (emailTaken) {
      return next(
        new ApiError(
          HTTP_STATUS.CONFLICT,
          "EMAIL_ALREADY_EXISTS",
          `Email '${email}' is already in use.`,
        ),
      );
    }
    account.email = email.toLowerCase().trim();
    await Profile.findByIdAndUpdate(account.profile._id, {
      $set: { email: email.toLowerCase().trim() },
    });
  }

  if (name) {
    await Profile.findByIdAndUpdate(account.profile._id, {
      $set: { fullName: name.trim() },
    });
  }

  await account.save();

  await req.logAction(AUDIT_ACTIONS.ADMIN_ACCOUNT_UPDATED, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin account updated: ${account.email}`,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  await account.populate("profile", "fullName email");
  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { account },
    "Admin account updated successfully.",
  );
});

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/v1/superadmin/accounts/:id/deactivate
// ─────────────────────────────────────────────────────────────────────
const deactivateAdminAccount = asyncHandler(async (req, res, next) => {
  // BR06: Super Admin cannot deactivate their own account
  if (req.params.id === req.account._id.toString()) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "CANNOT_DEACTIVATE_SELF",
        "You cannot deactivate your own account.",
      ),
    );
  }

  const account = await Account.findById(req.params.id);
  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Admin account not found.",
      ),
    );
  }

  if (!account.isActive) {
    return next(
      new ApiError(
        HTTP_STATUS.CONFLICT,
        "ALREADY_INACTIVE",
        "This account is already deactivated.",
      ),
    );
  }

  account.isActive = false;
  account.deactivatedAt = new Date();
  account.deactivatedBy = req.account._id;
  // Terminate active sessions by updating loggedOutAt
  account.loggedOutAt = new Date();
  await account.save();

  await req.logAction(AUDIT_ACTIONS.ADMIN_ACCOUNT_DEACTIVATED, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin account deactivated: ${account.email}`,
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Account for ${account.email} has been deactivated.`,
  );
});

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/v1/superadmin/accounts/:id/reactivate
// ─────────────────────────────────────────────────────────────────────

const reactivateAdminAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Admin account not found.",
      ),
    );
  }

  account.isActive = true;
  account.deactivatedAt = null;
  account.deactivatedBy = null;
  await account.save();

  await req.logAction(AUDIT_ACTIONS.ADMIN_ACCOUNT_REACTIVATED, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin account reactivated: ${account.email}`,
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Account for ${account.email} has been reactivated.`,
  );
});

// FIND the entire resetAdminPassword function and REPLACE with this
// (now works for ANY account regardless of role — Admin or Super Admin —
// uses the new PasswordResetToken model, no time expiry, full audit trail):
// FIND the entire resetAdminPassword function and REPLACE with this
// (now works for ANY account regardless of role — Admin or Super Admin —
// uses the new PasswordResetToken model, no time expiry, full audit trail):

const resetAdminPassword = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Account not found.",
      ),
    );
  }

  // Invalidate any previous unused tokens for this account (point 10)
  await PasswordResetToken.invalidateAllForAccount(account._id);

  const { rawToken, tokenHash } = generateToken(32);
  await PasswordResetToken.create({
    account: account._id,
    tokenHash,
    initiatedBy: "super_admin",
    initiatedByAccount: req.account._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]?.substring(0, 500),
  });

  const adminUrl = process.env.ADMIN_URL || "http://localhost:3000";
  const resetPathPrefix =
    account.role === "super_admin" ? "superadmin" : "admin";
  const resetLink = `${adminUrl}/${resetPathPrefix}/reset-password/${rawToken}`;

  const emailResult = await sendPasswordResetLink(account.email, {
    adminName: account.email,
    resetLink,
  });

  await req.logAction(AUDIT_ACTIONS.ADMIN_PASSWORD_RESET_BY_SUPER, {
    targetModel: "Account",
    targetId: account._id,
    description: `Password reset initiated by Super Admin for: ${account.email}`,
    metadata: {
      targetEmail: account.email,
      targetRole: account.role,
      initiatedBy: "super_admin",
      emailSent: emailResult.success,
    },
  });

  if (!emailResult.success) {
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      null,
      `Password reset email failed to deliver to ${account.email}. Please contact them directly.`,
    );
  }

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Password reset email sent to ${account.email}.`,
  );
});

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/v1/superadmin/accounts/:id
// BR06: Super Admin cannot delete their own account
// ─────────────────────────────────────────────────────────────────────
const deleteAdminAccount = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.account._id.toString()) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "CANNOT_DELETE_SELF",
        "You cannot delete your own account.",
      ),
    );
  }

  const account = await Account.findById(req.params.id);
  if (!account) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "ACCOUNT_NOT_FOUND",
        "Admin account not found.",
      ),
    );
  }

  await req.logAction(AUDIT_ACTIONS.ADMIN_ACCOUNT_DELETED, {
    targetModel: "Account",
    targetId: account._id,
    description: `Admin account permanently deleted: ${account.email}`,
  });

  await Account.findByIdAndDelete(account._id);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Admin account for ${account.email} has been permanently deleted.`,
  );
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/v1/superadmin/accounts/:id/reset-password
// Super Admin resets another admin's password
// ─────────────────────────────────────────────────────────────────────
// FIND the entire resetAdminPassword function and REPLACE with this
// (now works for ANY account regardless of role — Admin or Super Admin —
// uses the new PasswordResetToken model, no time expiry, full audit trail):

// FIND the module.exports and REPLACE with (createAdminAccount removed):

export {
  getAllAdminAccounts,
  updateAdminAccount,
  deactivateAdminAccount,
  reactivateAdminAccount,
  deleteAdminAccount,
  resetAdminPassword,
};
