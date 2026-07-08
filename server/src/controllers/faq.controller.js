'use strict';

/**
 * FAQ Controller
 * Public: getPublishedFaqs
 * Super Admin only: listAllFaqs, createFaq, updateFaq, deleteFaq, getFaqCategories
 */

import Faq from '../models/Faq.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { HTTP_STATUS, AUDIT_ACTIONS, DEFAULT_FAQ_CATEGORIES } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/faqs
// Grouped by category, published only — powers the /faq page and the
// About page teaser strip.
// ─────────────────────────────────────────────────────────────────────
const getPublishedFaqs = asyncHandler(async (req, res, next) => {
  const grouped = await Faq.getPublishedGrouped();

  return sendSuccess(res, HTTP_STATUS.OK, { faqs: grouped }, 'FAQs retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/faqs
// Full list (published + drafts), filterable, paginated, for management UI.
// ─────────────────────────────────────────────────────────────────────
const listAllFaqs = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, isPublished, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  if (search) filter.$text = { $search: search };

  const [faqs, total] = await Promise.all([
    Faq.find(filter)
      .populate('updatedBy', 'email')
      .sort({ category: 1, sortOrder: 1 })
      .skip(skip)
      .limit(limit),
    Faq.countDocuments(filter),
  ]);

  return sendPaginated(res, HTTP_STATUS.OK, faqs, 'FAQs retrieved successfully.', getPaginationMeta(total, page, limit));
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/faqs/categories
// Returns the union of DEFAULT_FAQ_CATEGORIES and any custom categories
// already in use, for the admin UI's category dropdown/autocomplete.
// ─────────────────────────────────────────────────────────────────────
const getFaqCategories = asyncHandler(async (req, res, next) => {
  const usedCategories = await Faq.getDistinctCategories();
  const merged = Array.from(new Set([...DEFAULT_FAQ_CATEGORIES, ...usedCategories])).sort();

  return sendSuccess(res, HTTP_STATUS.OK, { categories: merged }, 'FAQ categories retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/faqs
// ─────────────────────────────────────────────────────────────────────
const createFaq = asyncHandler(async (req, res, next) => {
  const faq = await Faq.create({
    ...req.body,
    createdBy: req.account._id,
    updatedBy: req.account._id,
  });

  await req.logAction(AUDIT_ACTIONS.FAQ_CREATED, {
    targetModel: 'Faq',
    targetId: faq._id,
    description: `FAQ created: "${faq.question}"`,
    metadata: { category: faq.category },
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, { faq }, 'FAQ created successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/v1/superadmin/faqs/:id
// ─────────────────────────────────────────────────────────────────────
const updateFaq = asyncHandler(async (req, res, next) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ_NOT_FOUND', 'FAQ not found.'));
  }

  const allowedFields = ['question', 'answer', 'category', 'isPublished', 'sortOrder'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) faq[field] = req.body[field];
  });
  faq.updatedBy = req.account._id;
  await faq.save();

  await req.logAction(AUDIT_ACTIONS.FAQ_UPDATED, {
    targetModel: 'Faq',
    targetId: faq._id,
    description: `FAQ updated: "${faq.question}"`,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  return sendSuccess(res, HTTP_STATUS.OK, { faq }, 'FAQ updated successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: DELETE /api/v1/superadmin/faqs/:id
// Hard delete — FAQs have no downstream references, so soft delete is
// unnecessary here (unlike Programme/Cohort).
// ─────────────────────────────────────────────────────────────────────
const deleteFaq = asyncHandler(async (req, res, next) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'FAQ_NOT_FOUND', 'FAQ not found.'));
  }

  await Faq.findByIdAndDelete(faq._id);

  await req.logAction(AUDIT_ACTIONS.FAQ_DELETED, {
    targetModel: 'Faq',
    targetId: faq._id,
    description: `FAQ deleted: "${faq.question}"`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, 'FAQ deleted successfully.');
});

export { getPublishedFaqs, listAllFaqs, getFaqCategories, createFaq, updateFaq, deleteFaq };