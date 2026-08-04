'use strict';

/**
 * Session Controller — Multi-device active session management (Issue 2).
 *
 * Fully self-service: every action operates ONLY on req.account's own
 * sessions. No RBAC role check is needed beyond "must be authenticated"
 * (protect middleware alone gates these routes) — an Admin managing
 * their own devices and a Super Admin managing theirs go through
 * identical logic, since "which sessions" is always scoped to the caller.
 *
 * Mounted identically under /admin/auth/sessions and
 * /superadmin/auth/sessions — see both auth.routes.js files.
 */

import Session from  '../models/Session.model.js';
import TokenBlocklist from  '../models/TokenBlocklist.model.js';
import asyncHandler from  '../utils/asyncHandler.js';
import ApiError from  '../utils/ApiError.js';
import { sendSuccess } from  '../utils/ApiResponse.js';
import { HTTP_STATUS } from  '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// GET /{admin|superadmin}/auth/sessions
// ─────────────────────────────────────────────────────────────────────
const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.getActiveForAccount(req.account._id);

  // Mark which entry corresponds to the request's own current token,
  // so the frontend can label it "This device" and prevent self-revoke.
  const decorated = sessions.map((s) => {
    const obj = s.toObject({ virtuals: true });
    obj.isCurrent = s.jti === req.tokenJti;
    return obj;
  });

  return sendSuccess(res, HTTP_STATUS.OK, { sessions: decorated }, 'Active sessions retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// DELETE /{admin|superadmin}/auth/sessions/:id
// ─────────────────────────────────────────────────────────────────────
const revokeSession = asyncHandler(async (req, res, next) => {
  const session = await Session.findOne({ _id: req.params.id, account: req.account._id });

  if (!session) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'SESSION_NOT_FOUND', 'Session not found.'));
  }
  if (session.jti === req.tokenJti) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'CANNOT_REVOKE_CURRENT_SESSION',
        'You cannot revoke your current session from this list. Use Logout instead.'
      )
    );
  }

  await Session.revokeById(session._id, req.account._id);
  await TokenBlocklist.blacklist(session.jti, req.account._id, session.expiresAt);

  return sendSuccess(res, HTTP_STATUS.OK, null, 'Session revoked. That device has been logged out.');
});

// ─────────────────────────────────────────────────────────────────────
// DELETE /{admin|superadmin}/auth/sessions/others
// ─────────────────────────────────────────────────────────────────────
const revokeOtherSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.getActiveForAccount(req.account._id);
  const others = sessions.filter((s) => s.jti !== req.tokenJti);

  await Promise.all(others.map((s) => TokenBlocklist.blacklist(s.jti, req.account._id, s.expiresAt)));
  await Session.revokeAllExcept(req.account._id, req.tokenJti);

  return sendSuccess(res, HTTP_STATUS.OK, { revokedCount: others.length }, `Logged out ${others.length} other device(s).`);
});

export { listSessions, revokeSession, revokeOtherSessions };