"use strict";

/**
 * Audit Trail Controller — Super Admin Only
 *
 * getPasswordResetTrail — fulfills points 7/8: a Super Admin can view the
 * full password reset history for themselves, every Admin, and every
 * other Super Admin.
 *
 * getUnauthorizedAccessTrail — closes a pre-existing gap: FRD FR-06.4
 * required these logs to be "accessible to Super Admin only" but no
 * endpoint ever exposed them until now.
 */

import mongoose from 'mongoose';
import AuditLog from "../models/AuditLog.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendPaginated } from "../utils/ApiResponse.js";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination.js";
import { HTTP_STATUS, AUDIT_ACTIONS } from "../config/constants.js";

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/superadmin/audit/password-resets
// Query params: accountId?, role? ('admin' | 'super_admin')
// ─────────────────────────────────────────────────────────────────────
const getPasswordResetTrail = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { accountId, role } = req.query;

  const filter = {
    action: {
      $in: [
        AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
        AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE,
        AUDIT_ACTIONS.ADMIN_PASSWORD_RESET_BY_SUPER,
      ],
    },
  };
  if (accountId) filter.targetId = accountId;
  if (role) filter["metadata.targetRole"] = role;

  const serializedFilter = {
    action: mongoose.trusted({
      $in: [
        AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
        AUDIT_ACTIONS.PASSWORD_RESET_COMPLETE,
        AUDIT_ACTIONS.ADMIN_PASSWORD_RESET_BY_SUPER,
      ],
    }),
  }

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(serializedFilter),
    AuditLog.find(serializedFilter)
      .populate("actor", "email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    logs,
    "Password reset audit trail retrieved successfully.",
    getPaginationMeta(total, page, limit),
  );
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/v1/superadmin/audit/unauthorized-access
// FRD FR-06.4 — previously logged but never exposed via an endpoint
// ─────────────────────────────────────────────────────────────────────
const getUnauthorizedAccessTrail = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const filter = { action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT };

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    logs,
    "Unauthorized access attempts retrieved successfully.",
    getPaginationMeta(total, page, limit),
  );
});

export {
   getPasswordResetTrail, 
   getUnauthorizedAccessTrail
   };
