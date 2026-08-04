'use strict';

/**
 * Admin Instalment Routes
 * Base: /api/v1/admin/instalments
 * Access: Admin + Super Admin
 */

import express from 'express';
const router = express.Router();

import {
  getOutstandingInstalments,
  updateInstalmentStatus,
} from '../../controllers/instalment.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateInstalmentStatusValidator }from '../../utils/validators/instalment.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// GET /api/v1/admin/instalments/outstanding
// Outstanding Instalments filter (FRD FR-10.4)
// Overdue records sorted to the top
router.get('/outstanding', getOutstandingInstalments);

// PATCH /api/v1/admin/instalments/:id/status
// Confirm or reject a single instalment payment record
router.patch(
  '/:id/status',
  updateInstalmentStatusValidator,
  validate,
  updateInstalmentStatus
);

export default router;