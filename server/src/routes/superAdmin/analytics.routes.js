'use strict';

/**
 * Super Admin — Analytics & Export Routes
 * Base: /api/v1/superadmin/analytics
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  getAnalyticsOverview,
  exportStudentsCsv,
}from '../../controllers/analytic.controller.js';

import { reversePaymentStatus } from '../../controllers/payment.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { body } from 'express-validator';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// GET /api/v1/superadmin/analytics
// Full analytics overview — all required FRD FR-05.3 metrics
router.get('/', getAnalyticsOverview);

// GET /api/v1/superadmin/analytics/export
// CSV export with optional filters (FRD FR-05.4)
router.get('/export', exportStudentsCsv);

// PATCH /api/v1/superadmin/analytics/payments/:id/reverse
// Reverse Confirmed → Pending (FRD FR-05.5, BR05)
// Mounted here under analytics because it's a Super Admin-only action
// that lives alongside analytics in the Super Admin dashboard
router.patch(
  '/payments/:id/reverse',
  [
    body('reversalReason')
      .trim()
      .notEmpty().withMessage('Please enter the reason for reversing this confirmation.')
      .isLength({ max: 500 }).withMessage('Reversal reason must not exceed 500 characters.'),
  ],
  validate,
  reversePaymentStatus
);

export default router;