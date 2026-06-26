'use strict';

/**
 * Instalment Payment Flow Validators
 * Covers FRD FR-10 requirements.
 */

import { body, query } from 'express-validator';

// ── Request one-time access link (POST /my-payment) ───────────────────
const requestAccessLinkValidator = [
  body('emailAddress')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
];

// ── Validate token query params (GET /my-payment/access) ─────────────
const validateTokenValidator = [
  query('token')
    .notEmpty().withMessage('Access token is required.')
    .isHexadecimal().withMessage('Invalid token format.')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid token length.'),

  query('email')
    .notEmpty().withMessage('Email parameter is required.')
    .isEmail().withMessage('Invalid email parameter.'),
];

// ── Submit instalment receipt (POST /my-payment/submit) ───────────────
const submitInstalmentReceiptValidator = [
  body('enrollmentId')
    .trim()
    .notEmpty().withMessage('Enrollment ID is required.')
    .isMongoId().withMessage('Invalid enrollment ID.'),

  body('instalmentNumber')
    .notEmpty().withMessage('Instalment number is required.')
    .isIn([2, 3]).withMessage('Instalment number must be 2 or 3 (instalment 1 is paid at enrollment).'),
];

// ── Admin: update instalment status ──────────────────────────────────
const updateInstalmentStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['confirmed', 'rejected'])
    .withMessage("Instalment status must be 'confirmed' or 'rejected'."),

  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty().withMessage('A rejection reason is required when rejecting an instalment payment.')
    .isLength({ max: 500 }).withMessage('Rejection reason must not exceed 500 characters.'),
];

export {
  requestAccessLinkValidator,
  validateTokenValidator,
  submitInstalmentReceiptValidator,
  updateInstalmentStatusValidator,
};