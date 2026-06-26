'use strict';

/**
 * Public Instalment Routes
 * Base: /api/v1/public/my-payment
 * Access: No authentication required (one-time token-based)
 */

import express from 'express';
const router = express.Router();

import {
  requestAccessLink,
  validateTokenAndGetSummary,
  submitInstalmentReceipt,
} from '../../controllers/instalment.controller.js';

import {
  uploadInstalmentReceipt,
  requireFile,
} from '../../middleware/upload.middleware.js';

import { validate } from '../../middleware/validate.middleware.js';
import { instalmentLinkLimiter }from '../../middleware/rateLimiter.middleware.js';

import {
  requestAccessLinkValidator,
  validateTokenValidator,
  submitInstalmentReceiptValidator,
} from '../../utils/validators/instalment.validator.js';

// POST /api/v1/public/my-payment
// Request a one-time access link (FRD FR-10.1)
// Rate limited: 5 requests per 15 minutes per IP
router.post(
  '/',
  instalmentLinkLimiter,
  requestAccessLinkValidator,
  validate,
  requestAccessLink
);

// GET /api/v1/public/my-payment/access
// Validate token and return enrollment summary (FRD FR-10.2)
// Token is consumed (marked used) when summary page loads successfully
router.get(
  '/access',
  validateTokenValidator,
  validate,
  validateTokenAndGetSummary
);

// POST /api/v1/public/my-payment/submit
// Submit next instalment receipt (FRD FR-10.3)
// uploadInstalmentReceipt processes the multipart form before validators
router.post(
  '/submit',
  uploadInstalmentReceipt,
  requireFile,
  submitInstalmentReceiptValidator,
  validate,
  submitInstalmentReceipt
);

export default router;