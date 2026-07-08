'use strict';

/**
 * JoinRequest Model — "Join Our Community" Submissions
 *
 * Captures the Home page dialog submission: email + role
 * (frontend_dev | backend_dev). No account, no profile linkage —
 * this is a lightweight lead-capture form, not a student or admin
 * identity, so it deliberately does NOT touch the centralized Profile
 * model.
 *
 * REVIEW WORKFLOW:
 *   Super Admin views a paginated list (fixed page size of 100 per the
 *   product decision) and can move a submission through:
 *     new → reviewed → archived
 *   No automated email is sent to the submitter (confirmed decision) —
 *   this is purely an internal lead list for Super Admin follow-up.
 */

import mongoose from 'mongoose';
import { JOIN_COMMUNITY_ROLES, JOIN_REQUEST_STATUS } from '../config/constants.js';

const joinRequestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      enum: {
        values: Object.values(JOIN_COMMUNITY_ROLES),
        message: `Role must be one of: ${Object.values(JOIN_COMMUNITY_ROLES).join(', ')}.`,
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(JOIN_REQUEST_STATUS),
        message: `Status must be one of: ${Object.values(JOIN_REQUEST_STATUS).join(', ')}.`,
      },
      default: JOIN_REQUEST_STATUS.NEW,
    },
    // ── Request context (basic audit — no IP-based abuse tracking beyond rate limiting) ──
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 500 },

    // ── Who reviewed / actioned this submission ────────────────────
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
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
joinRequestSchema.index({ status: 1 });
joinRequestSchema.index({ createdAt: -1 });
joinRequestSchema.index({ email: 1 });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

export default JoinRequest;