'use strict';

/**
 * ContactMessage Model — Footer "Send Us a Message" Submissions
 *
 * Replaces the removed public Contact page. A plain 3-field message
 * (name / email / message) submitted from the footer, visible to both
 * Admin and Super Admin as an inbox-style list (unlike Join Requests,
 * which are Super Admin only — general inquiries are operational, so
 * regular Admins can triage them too).
 *
 * No categorization or routing logic — confirmed as a plain message form.
 */

import mongoose from 'mongoose';
import { CONTACT_MESSAGE_STATUS } from '../config/constants.js';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [100, 'Name must not exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters.'],
      maxlength: [2000, 'Message must not exceed 2000 characters.'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: Object.values(CONTACT_MESSAGE_STATUS),
        message: `Status must be one of: ${Object.values(CONTACT_MESSAGE_STATUS).join(', ')}.`,
      },
      default: CONTACT_MESSAGE_STATUS.NEW,
    },

    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 500 },

    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    actionedAt: {
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
contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;