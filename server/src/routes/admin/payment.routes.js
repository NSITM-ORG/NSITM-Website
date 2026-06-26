'use strict';

/**
 * Admin Payment Routes
 * Base: /api/v1/admin/payments
 * Access: Admin + Super Admin
 */

import express from 'express';
const router = express.Router();

import {
  updatePaymentStatus,
}from '../../controllers/payment.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize }from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updatePaymentStatusValidator }from '../../utils/validators/enrollment.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// PATCH /api/v1/admin/payments/:id/status
// Confirm (Pending → Confirmed) or Reject (Pending → Rejected)
// Also handles Rejected → Pending (allow resubmission)
router.patch(
  '/:id/status',
  updatePaymentStatusValidator,
  validate,
  updatePaymentStatus
);

export default router;