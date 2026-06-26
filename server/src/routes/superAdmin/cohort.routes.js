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
  createCohort,
  updateCohort,
  deleteCohort,
} from '../../controllers/cohort.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createCohortValidator,
  updateCohortValidator,
} from '../../utils/validators/programme.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// GET    /api/v1/superadmin/cohorts
router.get('/', getAllCohortsAdmin);

// POST   /api/v1/superadmin/cohorts
router.post('/', createCohortValidator, validate, createCohort);

// PATCH  /api/v1/superadmin/cohorts/:id
router.patch('/:id', updateCohortValidator, validate, updateCohort);

// DELETE /api/v1/superadmin/cohorts/:id
router.delete('/:id', deleteCohort);

export default router;