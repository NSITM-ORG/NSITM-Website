'use strict';

/**
 * Cohort Controller
 * Public: getActiveCohorts, getCohortById
 * Super Admin: createCohort, updateCohort, deleteCohort
 * FRD FR-01.5, FR-05.2
 */

import Cohort from '../models/Cohort.model.js';
import Programme from '../models/Programme.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { HTTP_STATUS, COHORT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/cohorts/active
// FRD FR-01.5 — active cohorts page
// ─────────────────────────────────────────────────────────────────────
const getActiveCohorts = asyncHandler(async (req, res, next) => {
  const cohorts = await Cohort.getActiveCohorts();

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    { cohorts },
    cohorts.length > 0
      ? 'Active cohorts retrieved successfully.'
      : 'No cohorts are currently active. Please check our programmes page for upcoming cohort dates.'
  );
});

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: GET /api/v1/public/cohorts/:id
// ─────────────────────────────────────────────────────────────────────
const getCohortById = asyncHandler(async (req, res, next) => {
  const cohort = await Cohort.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate('programme', 'name slug category fees status');

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  return sendSuccess(res, HTTP_STATUS.OK, { cohort }, 'Cohort retrieved successfully.');
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: GET /api/v1/superadmin/cohorts
// ─────────────────────────────────────────────────────────────────────
const getAllCohortsAdmin = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, programme } = req.query;

  const filter = { isDeleted: false };
  if (status) filter.status = status;
  if (programme) filter.programme = programme;

  const [cohorts, total] = await Promise.all([
    Cohort.find(filter)
      .populate('programme', 'name slug category')
      .populate('updatedBy', 'email')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    Cohort.countDocuments(filter),
  ]);

  return sendPaginated(
    res,
    HTTP_STATUS.OK,
    cohorts,
    'Cohorts retrieved successfully.',
    getPaginationMeta(total, page, limit)
  );
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: POST /api/v1/superadmin/cohorts
// FRD FR-05.2
// ─────────────────────────────────────────────────────────────────────
const createCohort = asyncHandler(async (req, res, next) => {
  // Verify programme exists
  const programme = await Programme.findOne({ _id: req.body.programme, isDeleted: false });
  if (!programme) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'PROGRAMME_NOT_FOUND', 'Programme not found.'));
  }

  const cohort = await Cohort.create({
    ...req.body,
    createdBy: req.account._id,
    updatedBy: req.account._id,
  });

  await req.logAction(AUDIT_ACTIONS.COHORT_CREATED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort created: "${cohort.name}" for programme "${programme.name}"`,
    metadata: { programme: programme.name, startDate: cohort.startDate },
  });

  return sendSuccess(res, HTTP_STATUS.CREATED, { cohort }, `Cohort "${cohort.name}" created successfully.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/v1/superadmin/cohorts/:id
// ─────────────────────────────────────────────────────────────────────
const updateCohort = asyncHandler(async (req, res, next) => {
  const cohort = await Cohort.findOne({ _id: req.params.id, isDeleted: false });

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  const allowedFields = [
    'name', 'startDate', 'endDate', 'deliveryFormat',
    'whatsappGroupLink', 'status', 'enrollmentOpen', 'maxCapacity',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) cohort[field] = req.body[field];
  });

  cohort.updatedBy = req.account._id;
  await cohort.save();

  // If cohort is being deactivated (status → completed / upcoming),
  // remove it as the activeCohort from its programme
  if (
    req.body.status &&
    req.body.status !== COHORT_STATUS.ACTIVE
  ) {
    await Programme.findOneAndUpdate(
      { activeCohort: cohort._id },
      { $set: { activeCohort: null } }
    );
  }

  await req.logAction(AUDIT_ACTIONS.COHORT_UPDATED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort updated: "${cohort.name}"`,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  return sendSuccess(res, HTTP_STATUS.OK, { cohort }, `Cohort "${cohort.name}" updated successfully.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: DELETE /api/v1/superadmin/cohorts/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────
const deleteCohort = asyncHandler(async (req, res, next) => {
  const cohort = await Cohort.findOne({ _id: req.params.id, isDeleted: false });

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  cohort.isDeleted = true;
  cohort.deletedAt = new Date();
  cohort.deletedBy = req.account._id;
  cohort.status = COHORT_STATUS.COMPLETED;
  cohort.enrollmentOpen = false;
  await cohort.save();

  // Remove as activeCohort from programme
  await Programme.findOneAndUpdate(
    { activeCohort: cohort._id },
    { $set: { activeCohort: null } }
  );

  await req.logAction(AUDIT_ACTIONS.COHORT_DELETED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort soft-deleted: "${cohort.name}"`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, `Cohort "${cohort.name}" has been removed.`);
});

export {
  getActiveCohorts,
  getCohortById,
  getAllCohortsAdmin,
  createCohort,
  updateCohort,
  deleteCohort,
};