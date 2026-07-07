'use strict';

/**
 * Settings Validators
 * Covers Super Admin PUT /superadmin/settings — bank details, WhatsApp
 * contact info, and institution info. All three top-level sections are
 * optional per request (partial updates are allowed — see Settings.model.js
 * updateSettings() dot-notation merge logic), but any section that IS
 * present must have valid shape.
 */

import { body } from 'express-validator';

const updateSettingsValidator = [
  // ── Bank Details (optional section) ─────────────────────────────
  body('bankDetails.bankName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Bank name must not exceed 100 characters.'),

  body('bankDetails.accountNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 10 }).withMessage('Account number must be exactly 10 digits.')
    .isNumeric().withMessage('Account number must contain only digits.'),

  body('bankDetails.accountName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 }).withMessage('Account name must not exceed 150 characters.'),

  body('bankDetails.bankCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 10 }).withMessage('Bank code must not exceed 10 characters.'),

  // ── WhatsApp (optional section) ─────────────────────────────────
  body('whatsapp.number')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[0-9\s\-().]{7,20}$/).withMessage('Please provide a valid WhatsApp number.'),

  body('whatsapp.link')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^https:\/\/wa\.me\/.+$/).withMessage("WhatsApp link must be a valid wa.me URL."),

  body('whatsapp.prefilledMessage')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Pre-filled message must not exceed 500 characters.'),

  // ── Institution (optional section) ──────────────────────────────
  body('institution.name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Institution name must not exceed 200 characters.'),

  body('institution.address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 }).withMessage('Address must not exceed 300 characters.'),

  body('institution.phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[0-9\s\-().]{7,20}$/).withMessage('Please provide a valid phone number.'),

  body('institution.email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('institution.website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Please provide a valid website URL.'),

  body('institution.instagram').optional({ checkFalsy: true }).trim().isURL().withMessage('Instagram must be a valid URL.'),
  body('institution.linkedin').optional({ checkFalsy: true }).trim().isURL().withMessage('LinkedIn must be a valid URL.'),
  body('institution.facebook').optional({ checkFalsy: true }).trim().isURL().withMessage('Facebook must be a valid URL.'),
];

export { updateSettingsValidator };