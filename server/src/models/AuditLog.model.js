'use strict';

/**
 * AuditLog Model — System-Wide Immutable Audit Trail
 *
 * Records every significant action in the system with full context.
 *
 * IMMUTABILITY:
 *   Audit logs are never updated or deleted.
 *   The schema uses { timestamps: { createdAt: true, updatedAt: false } }
 *   to prevent Mongoose from managing an updatedAt field.
 *   The model has no update instance methods. Write-only by design.
 *
 * NON-BLOCKING WRITES:
 *   Audit log writes are fire-and-forget in the application layer.
 *   A failure to write an audit log does NOT fail the primary operation.
 *   Log write failures are reported to the logger (Winston) but not
 *   propagated to the client.
 *
 * COVERAGE:
 *   - Admin login, logout, failed login, account lockout
 *   - Password reset requests and completions
 *   - Payment status changes (confirm, reject, reverse)
 *   - Instalment confirmation and rejection
 *   - Admin account creation, deactivation, deletion
 *   - Programme and cohort management changes
 *   - Settings updates
 *   - CSV exports
 *   - Unauthorized access attempts (403 events)
 *
 * PER PRD F-06:
 *   "Unauthorized access attempts are logged with timestamp, attempted
 *   endpoint, and account ID."
 *   This model satisfies that requirement via ipAddress, endpoint,
 *   method, actor, and UNAUTHORIZED_ACCESS_ATTEMPT action type.
 */

import mongoose from 'mongoose';
import { AUDIT_ACTIONS }from '../config/constants.js';

const auditLogSchema = new mongoose.Schema(
  {
    // ── Actor ──────────────────────────────────────────────────────
    // Who performed this action. null for system-initiated actions.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    // Denormalized email at time of action (in case actor account is later deleted)
    actorEmail: {
      type: String,
      default: null,
    },
    // Denormalized role at time of action (in case role is later changed)
    actorRole: {
      type: String,
      default: null,
    },

    // ── Action ─────────────────────────────────────────────────────
    action: {
      type: String,
      required: [true, 'Audit action type is required.'],
      enum: {
        values: Object.values(AUDIT_ACTIONS),
        message: `Action must be a valid AUDIT_ACTIONS value.`,
      },
    },

    // ── Target ─────────────────────────────────────────────────────
    // The model collection affected by this action.
    // e.g., 'Enrollment', 'Account', 'Programme', 'Cohort', 'Settings'
    targetModel: {
      type: String,
      default: null,
      trim: true,
    },
    // The _id of the specific document affected.
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ── Description ────────────────────────────────────────────────
    // Human-readable summary of what happened.
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: [1000, 'Audit description must not exceed 1000 characters.'],
    },

    // ── Metadata ───────────────────────────────────────────────────
    // Flexible key-value store for additional context.
    // Examples:
    //   Payment rejection: { rejectionReason: '...', studentEmail: '...' }
    //   Reversal:          { reversalReason: '...', previousStatus: 'confirmed' }
    //   CSV export:        { filters: { cohort: '...', status: '...' }, rowCount: 42 }
    //   Unauthorized:      { attemptedRole: 'admin', requiredRole: 'super_admin' }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Request Context ────────────────────────────────────────────
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
      maxlength: 500,
    },
    // HTTP endpoint that was called (for unauthorized access logs)
    endpoint: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', null],
      default: null,
    },

    // ── Outcome ────────────────────────────────────────────────────
    outcome: {
      type: String,
      enum: {
        values: ['success', 'failure'],
        message: 'Outcome must be either success or failure.',
      },
      default: 'success',
    },
  },
  {
    // createdAt only — audit logs are immutable
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ outcome: 1 });
auditLogSchema.index({ createdAt: -1 });
// For querying all actions on a specific document (e.g., all actions on one enrollment)
auditLogSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });
// For querying all actions by a specific admin
auditLogSchema.index({ actor: 1, createdAt: -1 });
// For querying unauthorized access attempts
auditLogSchema.index({ action: 1, outcome: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────

/**
 * Write an audit log entry. Fire-and-forget — errors are logged but not thrown.
 * This is the ONLY method that should be used to create audit log entries.
 *
 * @param {Object} logData - Audit log fields
 * @param {Object} [options] - Options
 * @param {boolean} [options.silent=true] - If true, swallows errors silently
 * @returns {Promise<AuditLog|null>}
 */
auditLogSchema.statics.write = async function (logData, options = { silent: true }) {
  try {
    return await this.create(logData);
  } catch (err) {
    if (!options.silent) throw err;
    // Import logger lazily to avoid circular dependency
    const logger = require('../utils/logger');
    logger.error('Audit log write failed (non-blocking)', {
      action: logData.action,
      actor: logData.actor,
      error: err.message,
    });
    return null;
  }
};

/**
 * Get audit history for a specific document (e.g., all actions on an enrollment).
 *
 * @param {string} targetModel - Collection name (e.g., 'Enrollment')
 * @param {ObjectId} targetId - Document ID
 * @param {Object} [options] - { limit: number }
 * @returns {Promise<AuditLog[]>}
 */
auditLogSchema.statics.getForDocument = function (targetModel, targetId, options = {}) {
  return this.find({ targetModel, targetId })
    .populate('actor', 'email role')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;