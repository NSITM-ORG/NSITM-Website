'use strict';

/**
 * Join Request Controller
 * Public: createJoinRequest
 * Super Admin only: listJoinRequests, updateJoinRequestStatus
 */

import JoinRequest from '../models/JoinRequest.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import { getPaginationMeta } from '../utils/pagination';
import { HTTP_STATUS, PAGINATION, AUDIT_ACTIONS } from '../config/constants';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/join-requests
// Rate limit: 5/hour per IP
// ─────────────────────────────────────────────────────────────────────
const createJoinRequest = asyncHandler(async (req, res, next) => {
  const { email, role } = req.body;

  await JoinRequest.create({
    email: email.toLowerCase().trim(),
    role,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 500),
  });

  // No email is sent to the submitter — confirmed decision.
  // This is an internal lead-capture list for Super Admin review only.

  return sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    null,
    "Thanks for your interest in joining our community! We'll be in touch."
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/join-requests
// Fixed page size of 100 per confirmed product decision — the `limit`
// query param is intentionally ignored here in favour of the fixed
// PAGINATION.JOIN_REQUESTS_LIMIT constant, so the frontend never has to
// think about this value.
// ─────────────────────────────────────────────────────────────────────
const listJoinRequests = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = PAGINATION.JOIN_REQUESTS_LIMIT; // fixed at 100
  const skip = (page - 1) * limit;

  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const [requests, total] = await Promise.all([
    JoinRequest.find(filter)
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JoinRequest.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    requests,
    'Join community requests retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/v1/superadmin/join-requests/:id/status
// ─────────────────────────────────────────────────────────────────────
const updateJoinRequestStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const joinRequest = await JoinRequest.findById(req.params.id);
  if (!joinRequest) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'JOIN_REQUEST_NOT_FOUND', 'Join request not found.'));
  }

  joinRequest.status = status;
  joinRequest.reviewedBy = req.account._id;
  joinRequest.reviewedAt = new Date();
  await joinRequest.save();

  await req.logAction(AUDIT_ACTIONS.JOIN_REQUEST_STATUS_UPDATED, {
    targetModel: 'JoinRequest',
    targetId: joinRequest._id,
    description: `Join request status updated to '${status}' for: ${joinRequest.email}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, { joinRequest }, `Status updated to '${status}'.`);
});

export { createJoinRequest, listJoinRequests, updateJoinRequestStatus };