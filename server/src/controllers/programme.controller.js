'use strict';

/**
 * Programme Controller
 * Public: getAllProgrammes, getProgrammeBySlug, getProgrammesByCategory
 * Super Admin: createProgramme, updateProgramme, deleteProgramme
 * FRD FR-01.3, FR-01.4, FR-05.2
 */

import Programme from '../models/Programme.model.js';
import Cohort from '../models/Cohort.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta }from '../utils/pagination.js';
import { HTTP_STATUS, PROGRAMME_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/programmes
// All 26 programmes grouped by category (FRD FR-01.3)
// ─────────────────────────────────────────────────────────────────────
const getAllProgrammes = asyncHandler(async (req, res, next) => {
  const grouped = await Programme.getGroupedByCategory();

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { programmes: grouped },
    'Programmes retrieved successfully.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/programmes/:slug
// FRD FR-01.4 — individual programme detail page
// ─────────────────────────────────────────────────────────────────────
const getProgrammeBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const programme = await Programme.findBySlug(slug)
    .populate('activeCohort', 'name startDate endDate deliveryFormat status enrollmentOpen whatsappGroupLink');

  if (!programme) {
    return next(new ApiError(
      HTTP_STATUS.NOT_FOUND,
      'PROGRAMME_NOT_FOUND',
      `No programme found with the identifier '${slug}'.`
    ));
  }

  return sendSuccess(res, HTTP_STATUS.OK, { programme }, 'Programme retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/programmes/category/:category
// ─────────────────────────────────────────────────────────────────────
const getProgrammesByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  const programmes = await Programme.find({
    category,
    isDeleted: false,
  })
    .populate('activeCohort', 'name startDate endDate deliveryFormat status')
    .sort({ sortOrder: 1, name: 1 });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { programmes },
    `Programmes in category '${category}' retrieved successfully.`
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/programmes
// Full list with admin metadata (FRD FR-05.2)
// ─────────────────────────────────────────────────────────────────────
const getAllProgrammesAdmin = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { search, category, status } = req.query;

  const filter = { isDeleted: false };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const [programmes, total] = await Promise.all([
    Programme.find(filter)
      .populate('activeCohort', 'name startDate status')
      .populate('updatedBy', 'email')
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    Programme.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    programmes,
    'Programmes retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/programmes
// FRD FR-05.2
// ─────────────────────────────────────────────────────────────────────
const createProgramme = asyncHandler(async (req, res, next) => {
  const programmeData = {
    ...req.body,
    createdBy: req.account._id,
    updatedBy: req.account._id,
  };

  const programme = await Programme.create(programmeData);

  await req.logAction(AUDIT_ACTIONS.PROGRAMME_CREATED, {
    targetModel: 'Programme',
    targetId: programme._id,
    description: `Programme created: "${programme.name}"`,
    metadata: { category: programme.category, status: programme.status },
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, { programme }, `Programme "${programme.name}" created successfully.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/v1/superadmin/programmes/:id
// FRD FR-05.2 — changes take effect on public website immediately
// ─────────────────────────────────────────────────────────────────────
const updateProgramme = asyncHandler(async (req, res, next) => {
  const programme = await Programme.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!programme) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'PROGRAMME_NOT_FOUND', 'Programme not found.'));
  }

  const allowedFields = [
    'name', 'category', 'subCategory', 'description', 'duration',
    'prerequisites', 'status', 'fees', 'sortOrder', 'activeCohort',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      programme[field] = req.body[field];
    }
  });

  programme.updatedBy = req.account._id;
  await programme.save();

  await req.logAction(AUDIT_ACTIONS.PROGRAMME_UPDATED, {
    targetModel: 'Programme',
    targetId: programme._id,
    description: `Programme updated: "${programme.name}"`,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  return sendSuccess(res, HTTP_STATUS.OK, { programme }, `Programme "${programme.name}" updated successfully. Changes are live on the public website.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: DELETE /api/v1/superadmin/programmes/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────
const deleteProgramme = asyncHandler(async (req, res, next) => {
  const programme = await Programme.findOne({ _id: req.params.id, isDeleted: false });

  if (!programme) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'PROGRAMME_NOT_FOUND', 'Programme not found.'));
  }

  programme.isDeleted = true;
  programme.deletedAt = new Date();
  programme.deletedBy = req.account._id;
  programme.status = PROGRAMME_STATUS.COMING_SOON;
  programme.activeCohort = null;
  await programme.save();

  await req.logAction(AUDIT_ACTIONS.PROGRAMME_DELETED, {
    targetModel: 'Programme',
    targetId: programme._id,
    description: `Programme soft-deleted: "${programme.name}"`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, `Programme "${programme.name}" has been removed.`);
});

export {
  getAllProgrammes,
  getProgrammeBySlug,
  getProgrammesByCategory,
  getAllProgrammesAdmin,
  createProgramme,
  updateProgramme,
  deleteProgramme,
};