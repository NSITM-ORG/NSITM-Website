'use strict';

/**
 * Super Admin — Programme Management Routes
 * Base: /api/v1/superadmin/programmes
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  getAllProgrammesAdmin,
  getProgrammeByIdAdmin,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  bulkUpdateProgrammes,
   bulkDeleteProgrammes,
} from '../../controllers/programme.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createProgrammeValidator,
  updateProgrammeValidator,
   bulkUpdateProgrammesValidator,
    bulkDeleteValidator
}from '../../utils/validators/programme.validator.js';
import { ROLES }from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// GET    /api/v1/superadmin/programmes
router.get('/', getAllProgrammesAdmin);
router.get('/:id', getProgrammeByIdAdmin);
router.patch('/bulk-update', bulkUpdateProgrammesValidator, validate, bulkUpdateProgrammes);
router.delete('/bulk', bulkDeleteValidator, validate, bulkDeleteProgrammes);

// POST   /api/v1/superadmin/programmes
router.post('/', createProgrammeValidator, validate, createProgramme);

// PATCH  /api/v1/superadmin/programmes/:id
router.patch('/:id', updateProgrammeValidator, validate, updateProgramme);

// DELETE /api/v1/superadmin/programmes/:id
router.delete('/:id', deleteProgramme);

export default router;