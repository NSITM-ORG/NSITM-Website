'use strict';

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Enforces server-side permission boundaries between Admin and Super Admin.
 *
 * FRD FR-06.3 requirements:
 *   1. Extract the authenticated user's role from their JWT / account (via req.account)
 *   2. Compare role against the required permissions for the endpoint
 *   3. If insufficient: return 403 Forbidden AND log the attempt to AuditLog
 *   4. If sufficient: proceed normally
 *
 * FRD FR-06.4 — Every 403 triggered by a role mismatch must be written
 * to the access log with:
 *   - timestamp, accountId, accountEmail, endpoint, httpMethod, outcome: '403 Forbidden'
 *
 * Client-side UI hiding of Super Admin elements is supplementary only.
 * This server-side check is the authoritative security control.
 *
 * Usage:
 *   const { protect } = require('./auth.middleware');
 *   const { authorize } = require('./rbac.middleware');
 *   const { ROLES } = require('../config/constants');
 *
 *   // Both Admin and Super Admin:
 *   router.patch('/:id/status', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller);
 *
 *   // Super Admin only:
 *   router.post('/accounts', protect, authorize(ROLES.SUPER_ADMIN), controller);
 */

import AuditLog from '../models/AuditLog.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS, ROLES, AUDIT_ACTIONS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * authorize — Factory function that returns a middleware enforcing role requirements.
 *
 * @param {...string} allowedRoles - One or more role strings from ROLES constants
 * @returns {Function} Express middleware
 *
 * NOTE: protect middleware MUST run before authorize.
 *       authorize depends on req.account being set by protect.
 */
const authorize = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    // Defensive check: protect must have run first
    if (!req.account) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'NOT_AUTHENTICATED',
          'Authentication is required before authorization can be checked.'
        )
      );
    }

    const { role, _id: accountId, email: accountEmail } = req.account;

    // ── Corrupted role falls back to 'admin' (lowest privilege) ──
    // FRD FR-06.1: "If a role field is missing or corrupted, the system
    // defaults to admin (lower permission level)."
    const effectiveRole = Object.values(ROLES).includes(role) ? role : ROLES.ADMIN;

    // ── Role check ────────────────────────────────────────────────
    if (!allowedRoles.includes(effectiveRole)) {
      // ── Log the unauthorized access attempt (FRD FR-06.4) ──────
      AuditLog.write({
        actor: accountId,
        actorEmail: accountEmail,
        actorRole: effectiveRole,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        targetModel: null,
        targetId: null,
        description: `Unauthorized access attempt by ${effectiveRole} on ${req.method} ${req.originalUrl}`,
        metadata: {
          requiredRoles: allowedRoles,
          attemptedRole: effectiveRole,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        method: req.method,
        outcome: 'failure',
      }).catch((err) => {
        // Audit log failure must never block the 403 response
        logger.error('Failed to write unauthorized access audit log', {
          error: err.message,
          accountId,
          endpoint: req.originalUrl,
        });
      });

      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'PERMISSION_DENIED',
          `You do not have permission to perform this action. Required role: ${allowedRoles.join(' or ')}.`
        )
      );
    }

    // ── Role check passed ─────────────────────────────────────────
    next();
  });

/**
 * authorizeOwn — Middleware that allows a Super Admin to act on any account,
 * but blocks an Admin from acting on another account.
 * Used for account-level operations where the actor may only modify themselves
 * unless they are a Super Admin.
 *
 * NOTE: This is used in conjunction with authorize for complex permission checks.
 */
const authorizeOwn = (paramName = 'id') =>
  asyncHandler(async (req, res, next) => {
    if (!req.account) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, 'NOT_AUTHENTICATED', 'Authentication required.')
      );
    }

    const { role, _id: accountId } = req.account;
    const targetId = req.params[paramName];

    // Super Admin can act on any account
    if (role === ROLES.SUPER_ADMIN) return next();

    // Admin can only act on their own account
    if (accountId.toString() === targetId) return next();

    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'PERMISSION_DENIED',
        'You can only perform this action on your own account.'
      )
    );
  });

export{ authorize, authorizeOwn };