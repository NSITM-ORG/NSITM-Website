'use strict';

/**
 * Public Enrollment Routes
 * Base: /api/v1/public/enrollment
 * Access: No authentication required
 */

import express from 'express';
const router = express.Router();

import {
  createPartialRecord,
  updatePartialRecord,
  completeEnrollment,
} from '../../controllers/enrollment.controller.js';

import {
  uploadEnrollmentReceipt,
  requireFile,
} from '../../middleware/upload.middleware.js';

import { validate } from '../../middleware/validate.middleware.js';
import { enrollmentStep1Limiter } from '../../middleware/rateLimiter.middleware.js';
import {
  step1Validator,
  updateProgrammeValidator,
  completeEnrollmentValidator,
} from '../../utils/validators/enrollment.validator.js';

// POST /api/v1/public/enrollment/partial
// Step 1 advancement — creates or updates a Not Paid partial record (FR-08)
// Rate limited: 5 requests per 10 minutes per IP (FRD Q-10)
router.post(
  '/partial',
  enrollmentStep1Limiter,
  step1Validator,
  validate,
  createPartialRecord
);

// PATCH /api/v1/public/enrollment/partial/:id
// Programme field real-time update (FR-08.3)
// Called when the student changes their programme selection after Step 1
router.patch(
  '/partial/:id',
  updateProgrammeValidator,
  validate,
  updatePartialRecord
);

// POST /api/v1/public/enrollment/complete
// Step 4 — receipt upload and enrollment submission (FR-02.4)
// uploadEnrollmentReceipt processes the multipart form before the validator runs
router.post(
  '/complete',
  uploadEnrollmentReceipt,
  requireFile,
  completeEnrollmentValidator,
  validate,
  completeEnrollment
);

export default router;