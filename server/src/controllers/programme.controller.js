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
import { HTTP_STATUS, PROGRAMME_STATUS, AUDIT_ACTIONS,  PAGINATION  } from '../config/constants.js';

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
/**
 *
 * Paginated per the confirmed decision — the frontend requests
 * ?limit=4|6|8 depending on its current breakpoint (mobile/tablet/desktop).
 * If ?limit is omitted, PAGINATION.PROGRAMMES_DEFAULT_LIMIT (8) applies.
 */
const getProgrammesByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.PROGRAMMES_DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  const filter = { category, isDeleted: false };

  const [programmes, total] = await Promise.all([
    Programme.find(filter)
      .populate('activeCohort', 'name startDate endDate deliveryFormat status')
      .sort({ status: -1, enrollmentCount: -1, sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    Programme.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    programmes,
    `Programmes in category '${category}' retrieved successfully.`,
    getPaginationMeta(total, page, limit)
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


/**
 * SUPER ADMIN: GET /api/v1/superadmin/programmes/:id
 * Single programme fetch for the edit-form pre-population use case —
 * distinct from the public getProgrammeBySlug (which is slug-based and
 * excludes admin-only metadata like createdBy/updatedBy).
 */
const getProgrammeByIdAdmin = asyncHandler(async (req, res, next) => {
  const programme = await Programme.findOne({ _id: req.params.id, isDeleted: false })
    .populate('activeCohort', 'name startDate endDate deliveryFormat status')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email');

  if (!programme) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'PROGRAMME_NOT_FOUND', 'Programme not found.'));
  }

  return sendSuccess(res, HTTP_STATUS.OK, { programme }, 'Programme retrieved successfully.');
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

/**
 * SUPER ADMIN: PATCH /api/v1/superadmin/programmes/bulk-update
 * Bulk edit: status, duration, and fees (flat override or percentage
 * adjustment) across selected programmes.
 *
 * Fee bulk-edit modes (mutually exclusive per request):
 *   - updates.fees.full            → flat override, same value for every selected programme
 *   - updates.fees.percentageAdjust → e.g. 10 means "+10%" applied individually to EACH
 *                                      programme's own current fees.full (and, if it has
 *                                      an instalment plan, its instalment.total scales by
 *                                      the same percentage, with the 3-entry breakdown
 *                                      recalculated via the existing 40/30/30-preserving
 *                                      instalmentCalculator helper logic inline below).
 */
const bulkUpdateProgrammes = asyncHandler(async (req, res, next) => {
  const { ids, updates } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'NO_IDS_PROVIDED', 'Please select at least one programme.'));
  }

  const programmes = await Programme.find({ _id: { $in: ids }, isDeleted: false });
  const results = { updated: [] };

  for (const programme of programmes) {
    if (updates.status !== undefined) programme.status = updates.status;
    if (updates.duration !== undefined) programme.duration = updates.duration;

    if (updates.fees?.full !== undefined) {
      // Flat override mode
      programme.fees.full = Number(updates.fees.full);
    } else if (updates.fees?.percentageAdjust !== undefined) {
      // Percentage-adjustment mode — applied per-programme against its OWN current value
      const pct = Number(updates.fees.percentageAdjust) / 100;
      const newFull = Math.round(programme.fees.full * (1 + pct));
      programme.fees.full = newFull;

      if (programme.fees.instalment?.total) {
        const newTotal = Math.round(programme.fees.instalment.total * (1 + pct));
        const first = Math.round(newTotal * 0.4);
        const second = Math.round(newTotal * 0.3);
        const third = newTotal - first - second;
        programme.fees.instalment.total = newTotal;
        programme.fees.instalment.breakdown = [
          { instalmentNumber: 1, amount: first, dueDayOffset: 0 },
          { instalmentNumber: 2, amount: second, dueDayOffset: 30 },
          { instalmentNumber: 3, amount: third, dueDayOffset: 60 },
        ];
      }
    }

    programme.updatedBy = req.account._id;
    await programme.save();
    results.updated.push({ id: programme._id, name: programme.name });
  }

  await req.logAction(AUDIT_ACTIONS.PROGRAMME_BULK_UPDATED, {
    targetModel: 'Programme',
    description: `Bulk programme update applied to ${ids.length} programme(s)`,
    metadata: { fields: Object.keys(updates), results },
  });

  return sendSuccess(res, HTTP_STATUS.OK, results, `${results.updated.length} programme(s) updated successfully.`);
});

/**
 * SUPER ADMIN: DELETE /api/v1/superadmin/programmes/bulk
 * Bulk soft-delete — no status-lock concept exists for Programme (only
 * Cohort has the active-lock rule), so this is unconditional per-item.
 */
const bulkDeleteProgrammes = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'NO_IDS_PROVIDED', 'Please select at least one programme.'));
  }

  const programmes = await Programme.find({ _id: { $in: ids }, isDeleted: false });
  const results = { deleted: [] };

  for (const programme of programmes) {
    programme.isDeleted = true;
    programme.deletedAt = new Date();
    programme.deletedBy = req.account._id;
    programme.status = 'coming_soon';
    programme.activeCohort = null;
    await programme.save();
    results.deleted.push({ id: programme._id, name: programme.name });
  }

  await req.logAction(AUDIT_ACTIONS.PROGRAMME_BULK_DELETED, {
    targetModel: 'Programme',
    description: `Bulk programme delete: ${ids.length} selected`,
    metadata: { results },
  });

  return sendSuccess(res, HTTP_STATUS.OK, results, `${results.deleted.length} programme(s) removed.`);
});

// FIND the final export block and REPLACE with:
export {
  getAllProgrammes,
  getProgrammeBySlug,
  getProgrammesByCategory,
  getAllProgrammesAdmin,
  getProgrammeByIdAdmin,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  bulkUpdateProgrammes,
  bulkDeleteProgrammes,
};