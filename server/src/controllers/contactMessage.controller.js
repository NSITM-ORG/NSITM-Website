'use strict';

/**
 * Contact Message Controller
 * Public: createContactMessage
 * Admin + Super Admin: listContactMessages, updateContactMessageStatus
 *
 * Unlike Join Requests (Super Admin only), general contact messages are
 * operational triage work — both Admin and Super Admin can view/action
 * these, matching the existing RBAC pattern used for enrollment records.
 */

import ContactMessage from '../models/ContactMessage.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';
import { HTTP_STATUS, AUDIT_ACTIONS } from '../config/constants';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: POST /api/v1/public/contact-messages
// Rate limit: 5/hour per IP
// ─────────────────────────────────────────────────────────────────────
const createContactMessage = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;

  await ContactMessage.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    message: message.trim(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 500),
  });

  return sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    null,
    "Your message has been sent. We'll get back to you shortly."
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN + SUPER ADMIN: GET /api/v1/admin/contact-messages
// Standard project-wide pagination (default 25) applies here.
// ─────────────────────────────────────────────────────────────────────
const listContactMessages = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .populate('actionedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    messages,
    'Contact messages retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN + SUPER ADMIN: PATCH /api/v1/admin/contact-messages/:id/status
// ─────────────────────────────────────────────────────────────────────
const updateContactMessageStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const contactMessage = await ContactMessage.findById(req.params.id);
  if (!contactMessage) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'CONTACT_MESSAGE_NOT_FOUND', 'Contact message not found.'));
  }

  contactMessage.status = status;
  contactMessage.actionedBy = req.account._id;
  contactMessage.actionedAt = new Date();
  await contactMessage.save();

  await req.logAction(AUDIT_ACTIONS.CONTACT_MESSAGE_STATUS_UPDATED, {
    targetModel: 'ContactMessage',
    targetId: contactMessage._id,
    description: `Contact message status updated to '${status}' from: ${contactMessage.email}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, { contactMessage }, `Status updated to '${status}'.`);
});

export { createContactMessage, listContactMessages, updateContactMessageStatus };