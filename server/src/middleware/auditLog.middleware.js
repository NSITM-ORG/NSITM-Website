'use strict';

/**
 * Audit Log Middleware — Request Context Attachment
 *
 * Attaches a lightweight `req.logAction()` helper to every request.
 * Controllers and services call this helper to write audit log entries
 * without importing AuditLog directly everywhere.
 *
 * DESIGN PRINCIPLES:
 *   - Non-blocking: all writes are fire-and-forget. A failure to write
 *     an audit log entry NEVER fails the primary operation.
 *   - Context-enriched: automatically includes IP address, user agent,
 *     endpoint, and HTTP method from the request object.
 *   - Actor-aware: automatically includes the authenticated account's
 *     ID, email, and role when req.account is populated (post-protect).
 *
 * Usage in a controller:
 *   await req.logAction(AUDIT_ACTIONS.PAYMENT_CONFIRMED, {
 *     targetModel: 'Enrollment',
 *     targetId: enrollment._id,
 *     description: `Payment confirmed for ${student.fullName}`,
 *     metadata: { programme: programme.name, cohort: cohort.name },
 *   });
 *
 * The helper is available on all routes — both authenticated and public.
 * For public routes (e.g., enrollment Step 1), req.account will be null
 * and the actor fields will be omitted from the log entry.
 */

import AuditLog from '../models/AuditLog.model.js';
import { AUDIT_ACTIONS } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * attachAuditLogger — Express middleware that adds req.logAction() to the request.
 * Apply globally in app.js (before routes) so it is available everywhere.
 */
const attachAuditLogger = (req, res, next) => {
  /**
   * req.logAction — Write an audit log entry for this request context.
   *
   * @param {string} action - One of the AUDIT_ACTIONS constants
   * @param {Object} [options] - Additional log fields
   * @param {string} [options.targetModel] - Affected collection name
   * @param {import('mongoose').Types.ObjectId} [options.targetId] - Affected document ID
   * @param {string} [options.description] - Human-readable description
   * @param {Object} [options.metadata] - Any additional context
   * @param {string} [options.outcome] - 'success' (default) or 'failure'
   * @returns {Promise<void>} Non-blocking — caller does not need to await
   */
  req.logAction = (action, options = {}) => {
    const logEntry = {
      // ── Actor (populated after protect middleware runs) ────────
      actor: req.account?._id || null,
      actorEmail: req.account?.email || null,
      actorRole: req.account?.role || null,

      // ── Action ────────────────────────────────────────────────
      action,

      // ── Target ────────────────────────────────────────────────
      targetModel: options.targetModel || null,
      targetId: options.targetId || null,

      // ── Description ───────────────────────────────────────────
      description: options.description || null,

      // ── Metadata ──────────────────────────────────────────────
      metadata: options.metadata || null,

      // ── Request Context ───────────────────────────────────────
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent']?.substring(0, 500) || null,
      endpoint: req.originalUrl || null,
      method: req.method || null,

      // ── Outcome ───────────────────────────────────────────────
      outcome: options.outcome || 'success',
    };

    // Fire-and-forget: do NOT await, do NOT propagate errors
    AuditLog.write(logEntry).catch((err) => {
      logger.error('req.logAction: audit log write failed (non-blocking)', {
        action,
        error: err.message,
        endpoint: req.originalUrl,
      });
    });
  };

  next();
};

export { attachAuditLogger };