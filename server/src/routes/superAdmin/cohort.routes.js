'use strict';

/**
 * Super Admin — Cohort Management Routes
 * Base: /api/v1/superadmin/cohorts
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  getAllCohortsAdmin,
  getCohortByIdAdmin,
  createCohort,
  updateCohort,
  deleteCohort,
  bulkUpdateCohorts,
  bulkDeleteCohorts,
} from '../../controllers/cohort.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createCohortValidator,
  updateCohortValidator,
  bulkUpdateCohortsValidator,
  bulkDeleteValidator,
} from '../../utils/validators/programme.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// GET    /api/v1/superadmin/cohorts
router.get('/', getAllCohortsAdmin);
router.get('/:id', getCohortByIdAdmin);

router.patch('/bulk-update', bulkUpdateCohortsValidator, validate, bulkUpdateCohorts);
router.delete('/bulk', bulkDeleteValidator, validate, bulkDeleteCohorts);

// POST   /api/v1/superadmin/cohorts
router.post('/', createCohortValidator, validate, createCohort);

// PATCH  /api/v1/superadmin/cohorts/:id
router.patch('/:id', updateCohortValidator, validate, updateCohort);

// DELETE /api/v1/superadmin/cohorts/:id
router.delete('/:id', deleteCohort);

export default router;