'use strict';

/**
 * Cohort Controller
 * Public: getActiveCohorts, getCohortById
 * Super Admin: createCohort, updateCohort, deleteCohort
 * FRD FR-01.5, FR-05.2
 */
import mongoose from 'mongoose';
import Cohort from '../models/Cohort.model.js';
import Programme from '../models/Programme.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { HTTP_STATUS, COHORT_STATUS, AUDIT_ACTIONS } from '../config/constants.js';
import { assertCohortFieldsEditable, assertCohortDeletable } from '../helpers/cohortFieldGuard.helper.js';

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
  // Guard against non-ObjectId values (e.g. the string "active" if route order is wrong)
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID_FORMAT', 'Invalid cohort ID format.')
    );
  }

  const cohort = await Cohort.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select('+isDeleted').populate('programme', 'name slug category description subDescription bulletPoints prerequisites duration fees status');

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

/**
 * SUPER ADMIN: GET /api/v1/superadmin/cohorts/:id
 * Single cohort fetch for the edit-form pre-population use case.
 */
const getCohortByIdAdmin = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_ID_FORMAT', 'Invalid cohort ID format.')
    );
  }

  const cohort = await Cohort.findOne({ _id: req.params.id, isDeleted: false })
    .populate('programme', 'name slug category')
    .populate('createdBy', 'email')
    .populate('updatedBy', 'email');

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  return sendSuccess(res, HTTP_STATUS.OK, { cohort }, 'Cohort retrieved successfully.');
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


  // (no field-set change needed structurally — createCohort already accepts
  // whatever's in req.body via the validator; this note confirms
  // enrollmentStartDate/enrollmentEndDate now flow through unchanged since
  // they're plain schema fields, and status is now unlock-by-default on create,
  // which was already true — no gating existed on create, only on edit).

  const cohort = await Cohort.create({
    ...req.body,
    createdBy: req.account._id,
    updatedBy: req.account._id,
  });

  // Automatically link this cohort to the programme if it is created as active
  if (cohort.status === 'active') {
    await Programme.findByIdAndUpdate(programme._id, { activeCohort: cohort._id });
  }

  await req.logAction(AUDIT_ACTIONS.COHORT_CREATED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort created: "${cohort.name}" for programme "${programme.name}"`,
    metadata: { programme: programme.name, startDate: cohort.startDate },
  });

  // Populate the programme so the response matches what the frontend expects
  const populatedCohort = await Cohort.findById(cohort._id).populate('programme', 'name slug category');

  return sendSuccess(res, HTTP_STATUS.CREATED, { cohort: populatedCohort }, `Cohort "${cohort.name}" created successfully.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: PATCH /api/v1/superadmin/cohorts/:id
// ─────────────────────────────────────────────────────────────────────
/**
 *
 * Field-locking rule (client decision): `status` transitions are always
 * permitted. Every other field is locked while the cohort's CURRENT
 * status is 'active' — the `programme` field specifically remains
 * VISIBLE in the response either way, just rejected if present in a
 * locked-state update payload (the frontend disables the input; this
 * is the server-side enforcement backing that UI state).
 */
const updateCohort = asyncHandler(async (req, res, next) => {
  const cohort = await Cohort.findOne({ _id: req.params.id, isDeleted: false });

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  assertCohortFieldsEditable(cohort.status, req.body, `"${cohort.name}"`);

  const allowedFields = [
    'name', 'programme', 'startDate', 'endDate',
    'enrollmentStartDate', 'enrollmentEndDate',
    'deliveryFormat', 'whatsappGroupLink', 'status', 'maxCapacity',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) cohort[field] = req.body[field];
  });

  cohort.updatedBy = req.account._id;
  await cohort.save();

  // Automatically link or unlink this cohort from the programme based on status
  if (cohort.status === 'active') {
    await Programme.findByIdAndUpdate(cohort.programme, { activeCohort: cohort._id });
  } else {
    // If it was active but is no longer, unset it from the programme if it was the active one
    await Programme.findOneAndUpdate({ activeCohort: cohort._id }, { $set: { activeCohort: null } });
  }

  await req.logAction(AUDIT_ACTIONS.COHORT_UPDATED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort updated: "${cohort.name}"`,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  const populated = await Cohort.findById(cohort._id).populate('programme', 'name slug category');

  return sendSuccess(res, HTTP_STATUS.OK, { cohort: populated }, `Cohort "${cohort.name}" updated successfully.`);
});

// ─────────────────────────────────────────────────────────────────────
// SUPER ADMIN: DELETE /api/v1/superadmin/cohorts/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────
// FIND the entire deleteCohort function and REPLACE with:

/**
 * Blocked entirely while cohort status is 'active', per client decision.
 */
const deleteCohort = asyncHandler(async (req, res, next) => {
  const cohort = await Cohort.findOne({ _id: req.params.id, isDeleted: false });

  if (!cohort) {
    return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'COHORT_NOT_FOUND', 'Cohort not found.'));
  }

  assertCohortDeletable(cohort.status, `"${cohort.name}"`);

  cohort.isDeleted = true;
  cohort.deletedAt = new Date();
  cohort.deletedBy = req.account._id;
  cohort.status = 'completed';
  await cohort.save();

  await Programme.findOneAndUpdate({ activeCohort: cohort._id }, { $set: { activeCohort: null } });

  await req.logAction(AUDIT_ACTIONS.COHORT_DELETED, {
    targetModel: 'Cohort',
    targetId: cohort._id,
    description: `Cohort soft-deleted: "${cohort.name}"`,
  });

  return sendSuccess(res, HTTP_STATUS.OK, null, `Cohort "${cohort.name}" has been removed.`);
});

/**
 * SUPER ADMIN: PATCH /api/v1/superadmin/cohorts/bulk-update
 * Bulk edit: status, deliveryFormat, maxCapacity across selected cohorts.
 * Each target cohort is individually checked against the field-lock rule
 * — an active cohort in the selection set is simply SKIPPED for locked
 * fields (not a hard failure for the whole batch), and the response
 * reports exactly which cohorts were fully updated, partially updated
 * (status only), or skipped, so the admin sees precisely what happened.
 */
const bulkUpdateCohorts = asyncHandler(async (req, res, next) => {
  const { ids, updates } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'NO_IDS_PROVIDED', 'Please select at least one cohort.'));
  }

  const BULK_ALLOWED_FIELDS = ['status', 'deliveryFormat', 'maxCapacity'];
  const sanitizedUpdates = {};
  BULK_ALLOWED_FIELDS.forEach((field) => {
    if (updates[field] !== undefined) sanitizedUpdates[field] = updates[field];
  });

  if (Object.keys(sanitizedUpdates).length === 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'NO_VALID_FIELDS', 'No valid bulk-editable fields were provided.'));
  }

  const cohorts = await Cohort.find({ _id: { $in: ids }, isDeleted: false });

  const results = { updated: [], partiallyUpdated: [], skipped: [] };

  for (const cohort of cohorts) {
    const isActive = cohort.status === 'active';
    const nonStatusFieldsRequested = Object.keys(sanitizedUpdates).some((f) => f !== 'status');

    if (isActive && nonStatusFieldsRequested) {
      // Active cohort with locked-field changes requested: apply status only, if present.
      if (sanitizedUpdates.status !== undefined) {
        cohort.status = sanitizedUpdates.status;
        cohort.updatedBy = req.account._id;
        await cohort.save();
        if (cohort.status === 'active') {
          await Programme.findByIdAndUpdate(cohort.programme, { activeCohort: cohort._id });
        } else {
          await Programme.findOneAndUpdate({ activeCohort: cohort._id }, { $set: { activeCohort: null } });
        }
        results.partiallyUpdated.push({ id: cohort._id, name: cohort.name });
      } else {
        results.skipped.push({ id: cohort._id, name: cohort.name, reason: 'Cohort is active — locked fields cannot be bulk-edited.' });
      }
      continue;
    }

    Object.entries(sanitizedUpdates).forEach(([field, value]) => {
      cohort[field] = value;
    });
    cohort.updatedBy = req.account._id;
    await cohort.save();

    if (sanitizedUpdates.status !== undefined) {
      if (cohort.status === 'active') {
        await Programme.findByIdAndUpdate(cohort.programme, { activeCohort: cohort._id });
      } else {
        await Programme.findOneAndUpdate({ activeCohort: cohort._id }, { $set: { activeCohort: null } });
      }
    }

    results.updated.push({ id: cohort._id, name: cohort.name });
  }

  await req.logAction(AUDIT_ACTIONS.COHORT_BULK_UPDATED, {
    targetModel: 'Cohort',
    description: `Bulk cohort update applied to ${ids.length} cohort(s)`,
    metadata: { fields: Object.keys(sanitizedUpdates), results },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    results,
    `${results.updated.length} cohort(s) fully updated, ${results.partiallyUpdated.length} partially updated (status only), ${results.skipped.length} skipped.`
  );
});

/**
 * SUPER ADMIN: DELETE /api/v1/superadmin/cohorts/bulk
 * Bulk soft-delete. Active cohorts in the selection are skipped, not
 * hard-failed, matching the per-item reporting pattern above.
 */
const bulkDeleteCohorts = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'NO_IDS_PROVIDED', 'Please select at least one cohort.'));
  }

  const cohorts = await Cohort.find({ _id: { $in: ids }, isDeleted: false });
  const results = { deleted: [], skipped: [] };

  for (const cohort of cohorts) {
    if (cohort.status === 'active') {
      results.skipped.push({ id: cohort._id, name: cohort.name, reason: 'Cohort is active and cannot be deleted.' });
      continue;
    }
    cohort.isDeleted = true;
    cohort.deletedAt = new Date();
    cohort.deletedBy = req.account._id;
    cohort.status = 'completed';
    await cohort.save();
    await Programme.findOneAndUpdate({ activeCohort: cohort._id }, { $set: { activeCohort: null } });
    results.deleted.push({ id: cohort._id, name: cohort.name });
  }

  await req.logAction(AUDIT_ACTIONS.COHORT_BULK_DELETED, {
    targetModel: 'Cohort',
    description: `Bulk cohort delete: ${ids.length} selected`,
    metadata: { results },
  });

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    results,
    `${results.deleted.length} cohort(s) removed, ${results.skipped.length} skipped (active).`
  );
});


/**
 * PUBLIC: GET /api/v1/public/cohorts/completed
 */
const getCompletedCohorts = asyncHandler(async (req, res) => {
  const cohorts = await Cohort.getCompletedCohorts();
  return sendSuccess(res, HTTP_STATUS.OK, { cohorts }, 'Completed cohorts retrieved successfully.');
});

/**
 * PUBLIC: GET /api/v1/public/cohorts/exists
 * Cheap existence-only check — powers the Header's conditional "Cohorts"
 * nav link (per client Issue 4) without pulling any actual cohort data.
 * Uses .where().in() rather than a raw $in object (same cast-safety
 * pattern established for every other enum-field query in this codebase).
 */
const checkCohortsExist = asyncHandler(async (req, res) => {
  // const exists = await Cohort.exists({ isDeleted: false }).where('status').in(['active', 'completed']);
  const exists = await Cohort.exists({
    isDeleted: false,
    status: mongoose.trusted({ $in: ['active', 'completed'] })
  });

  return sendSuccess(res, HTTP_STATUS.OK, { exists: !!exists }, 'Cohort existence check complete.');
});


export {
  getActiveCohorts,
  getCohortById,
  getAllCohortsAdmin,
  getCohortByIdAdmin,
  createCohort,
  updateCohort,
  deleteCohort,
  bulkUpdateCohorts,
  bulkDeleteCohorts,
  getCompletedCohorts, checkCohortsExist,
};