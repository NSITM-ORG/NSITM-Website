'use strict';

import LegalPage from '../models/LegalPage.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/legal-pages/:slug
// Returns the published data object for the given slug
// ─────────────────────────────────────────────────────────────────────
export const getPublicLegalPageBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const page = await LegalPage.findOne({ slug, status: 'published' });

  if (!page) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'PAGE_NOT_FOUND',
        `The legal page '${slug}' was not found or is not published.`
      )
    );
  }

  return sendSuccess(res, HTTP_STATUS.OK, { data: page }, 'Legal page retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN/SUPERADMIN: GET /api/v1/admin/legal-pages
// Lists all legal pages with basic info
// ─────────────────────────────────────────────────────────────────────
export const getAllLegalPages = asyncHandler(async (req, res, next) => {
  const pages = await LegalPage.find()
    .select('slug status hero.title hero.lastUpdated publishedAt updatedAt')
    .sort({ 'hero.title': 1 });

  return sendSuccess(res, HTTP_STATUS.OK, { pages }, 'Legal pages retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN/SUPERADMIN: GET /api/v1/admin/legal-pages/:slug
// Gets full data for a specific legal page (draft or published)
// ─────────────────────────────────────────────────────────────────────
export const getLegalPageBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const page = await LegalPage.findOne({ slug });

  if (!page) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'PAGE_NOT_FOUND',
        `The legal page '${slug}' was not found.`
      )
    );
  }

  return sendSuccess(res, HTTP_STATUS.OK, { page }, 'Legal page retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN/SUPERADMIN: POST /api/v1/admin/legal-pages
// Creates a new legal page
// ─────────────────────────────────────────────────────────────────────
export const createLegalPage = asyncHandler(async (req, res, next) => {
  const { slug, title } = req.body;

  if (!slug || !title) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'MISSING_FIELDS', 'Slug and title are required.'));
  }

  const existing = await LegalPage.findOne({ slug });
  if (existing) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'PAGE_EXISTS', `A legal page with slug '${slug}' already exists.`));
  }

  const page = await LegalPage.create({
    slug,
    status: 'draft',
    hero: { title },
    createdBy: req.account._id,
    updatedBy: req.account._id,
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, { page }, 'Legal page created successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN/SUPERADMIN: PUT /api/v1/admin/legal-pages/:slug
// Updates a legal page (keeps it in current status, typically draft)
// ─────────────────────────────────────────────────────────────────────
export const updateLegalPage = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  // The pre-findOneAndUpdate hook enforces punctuation
  const updatedPage = await LegalPage.findOneAndUpdate(
    { slug },
    {
      $set: {
        ...req.body,
        updatedBy: req.account._id,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedPage) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'PAGE_NOT_FOUND',
        `The legal page '${slug}' was not found.`
      )
    );
  }

  // Log action
  await req.logAction(AUDIT_ACTIONS.SETTINGS_UPDATED, { // Reusing SETTINGS_UPDATED for content updates
    targetModel: 'LegalPage',
    targetId: updatedPage._id,
    description: `Updated legal page content for ${slug}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, { page: updatedPage }, 'Legal page updated successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// ADMIN/SUPERADMIN: PATCH /api/v1/admin/legal-pages/:slug/publish
// Publishes a legal page
// ─────────────────────────────────────────────────────────────────────
export const publishLegalPage = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const publishedPage = await LegalPage.findOneAndUpdate(
    { slug },
    {
      $set: {
        status: 'published',
        publishedAt: new Date(),
        updatedBy: req.account._id,
        'hero.lastUpdated': new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      },
    },
    { new: true }
  );

  if (!publishedPage) {
    return next(
      new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'PAGE_NOT_FOUND',
        `The legal page '${slug}' was not found.`
      )
    );
  }

  // Log action
  await req.logAction(AUDIT_ACTIONS.SETTINGS_UPDATED, {
    targetModel: 'LegalPage',
    targetId: publishedPage._id,
    description: `Published legal page ${slug}`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, { page: publishedPage }, 'Legal page published successfully.');
});
