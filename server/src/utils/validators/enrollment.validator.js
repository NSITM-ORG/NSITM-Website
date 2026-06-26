'use strict';

/**
 * Enrollment Form Validators
 * Covers FRD FR-02.1 through FR-02.4 field requirements.
 *
 * NIGERIAN PHONE NUMBER FORMAT (FRD FR-02.1):
 *   "Must be a valid Nigerian mobile number format (beginning with 0 or +234, 11 digits)"
 *   Accepts: 080XXXXXXXX / 081XXXXXXXX / 070XXXXXXXX / 090XXXXXXXX etc.
 *   Accepts +234 prefix equivalent.
 */

import { body, query }from 'express-validator';
import { DELIVERY_FORMATS, PAYMENT_TYPES } from '../../config/constants.js';

// ── Nigerian phone regex ──────────────────────────────────────────────
// Matches: 0[7-9][0-9]\d{8} (local format, 11 digits)
//          +234[7-9][0-9]\d{8} (international format)
const NIGERIAN_PHONE_REGEX = /^(\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/;

// ── Step 1: Personal Details (creates partial record) ────────────────
const step1Validator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters.')
    .isLength({ max: 100 }).withMessage('Full name must not exceed 100 characters.')
    .custom((value) => {
      // FRD FR-02.1: "Must contain at least a first and last name separated by a space"
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2 || parts.some((p) => p.length < 1)) {
        throw new Error('Please enter your full name (first and last name).');
      }
      return true;
    }),

  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required.')
    .matches(NIGERIAN_PHONE_REGEX)
    .withMessage('Please enter a valid Nigerian mobile number (e.g. 08012345678 or +2348012345678).'),

  body('whatsappNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(NIGERIAN_PHONE_REGEX)
    .withMessage('WhatsApp number must be a valid Nigerian mobile number.'),

  body('emailAddress')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('programme')
    .trim()
    .notEmpty().withMessage('Please select a programme.')
    .isMongoId().withMessage('Invalid programme identifier. Please select a valid programme.'),

  body('deliveryFormat')
    .notEmpty().withMessage('Please select a delivery format (Online or In-Person).')
    .isIn(Object.values(DELIVERY_FORMATS))
    .withMessage(`Delivery format must be one of: ${Object.values(DELIVERY_FORMATS).join(', ')}.`),

  body('referralCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Referral code must not exceed 20 characters.'),
];

// ── PATCH partial record: programme field update only ────────────────
const updateProgrammeValidator = [
  body('programme')
    .trim()
    .notEmpty().withMessage('Programme ID is required.')
    .isMongoId().withMessage('Invalid programme identifier.'),
];

// ── Step 4: Complete enrollment (receipt submission) ─────────────────
const completeEnrollmentValidator = [
  body('enrollmentId')
    .trim()
    .notEmpty().withMessage('Enrollment ID is required.')
    .isMongoId().withMessage('Invalid enrollment ID.'),

  body('paymentType')
    .notEmpty().withMessage('Please select a payment type (Full Payment or Instalment).')
    .isIn(Object.values(PAYMENT_TYPES))
    .withMessage(`Payment type must be one of: ${Object.values(PAYMENT_TYPES).join(', ')}.`),

  body('depositAmount')
    .optional()
    .isNumeric().withMessage('Deposit amount must be a number.')
    .custom((value) => {
      if (Number(value) <= 0) throw new Error('Deposit amount must be greater than zero.');
      return true;
    }),
];

// ── Admin: update payment status ─────────────────────────────────────
const updatePaymentStatusValidator = [
  body('paymentStatus')
    .notEmpty().withMessage('Payment status is required.')
    .isIn(['confirmed', 'rejected', 'pending'])
    .withMessage("Payment status must be 'confirmed', 'rejected', or 'pending'."),

  body('rejectionReason')
    .if(body('paymentStatus').equals('rejected'))
    .notEmpty().withMessage('A rejection reason is required when rejecting a payment.')
    .isLength({ max: 500 }).withMessage('Rejection reason must not exceed 500 characters.'),

  body('reversalReason')
    .if(body('paymentStatus').equals('pending'))
    .optional()
    .isLength({ max: 500 }).withMessage('Reversal reason must not exceed 500 characters.'),
];

export  {
  step1Validator,
  updateProgrammeValidator,
  completeEnrollmentValidator,
  updatePaymentStatusValidator,
};