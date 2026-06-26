'use strict';

/**
 * Programme & Cohort Validators
 * Covers Super Admin programme management (FRD FR-05.2) and cohort creation.
 */

import { body } from 'express-validator';
import { PROGRAMME_CATEGORIES, PROGRAMME_STATUS, DELIVERY_FORMATS, COHORT_STATUS }from '../../config/constants.js';

// ── Create programme ──────────────────────────────────────────────────
const createProgrammeValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Programme name is required.')
    .isLength({ min: 3 }).withMessage('Programme name must be at least 3 characters.')
    .isLength({ max: 150 }).withMessage('Programme name must not exceed 150 characters.'),

  body('category')
    .notEmpty().withMessage('Programme category is required.')
    .isIn(Object.values(PROGRAMME_CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(PROGRAMME_CATEGORIES).join(', ')}.`),

  body('subCategory')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Sub-category must not exceed 100 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Programme description is required.')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters.')
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters.'),

  body('duration')
    .trim()
    .notEmpty().withMessage('Programme duration is required.')
    .isLength({ max: 100 }).withMessage('Duration must not exceed 100 characters.'),

  body('fees.full')
    .notEmpty().withMessage('Full payment fee is required.')
    .isNumeric().withMessage('Full payment fee must be a number.')
    .custom((v) => { if (Number(v) < 0) throw new Error('Fee must be a positive number.'); return true; }),

  body('fees.instalment.total')
    .optional({ checkFalsy: true })
    .isNumeric().withMessage('Instalment total must be a number.')
    .custom((v) => { if (Number(v) < 0) throw new Error('Instalment total must be a positive number.'); return true; }),

  body('fees.instalment.breakdown')
    .optional()
    .isArray({ min: 3, max: 3 })
    .withMessage('Instalment breakdown must contain exactly 3 entries.'),

  body('fees.instalment.breakdown.*.instalmentNumber')
    .optional()
    .isIn([1, 2, 3]).withMessage('Instalment number must be 1, 2, or 3.'),

  body('fees.instalment.breakdown.*.amount')
    .optional()
    .isNumeric().withMessage('Instalment amount must be a number.'),

  body('fees.instalment.breakdown.*.dueDayOffset')
    .optional()
    .isInt({ min: 0 }).withMessage('Due day offset must be a non-negative integer.'),

  body('status')
    .optional()
    .isIn(Object.values(PROGRAMME_STATUS))
    .withMessage(`Status must be one of: ${Object.values(PROGRAMME_STATUS).join(', ')}.`),

  body('prerequisites')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Prerequisites must not exceed 500 characters.'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
];

// ── Update programme (all fields optional) ────────────────────────────
const updateProgrammeValidator = createProgrammeValidator.map((validator) =>
  validator.optional ? validator : validator
);

// ── Create cohort ─────────────────────────────────────────────────────
const createCohortValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Cohort name is required.')
    .isLength({ max: 200 }).withMessage('Cohort name must not exceed 200 characters.'),

  body('programme')
    .notEmpty().withMessage('Programme is required.')
    .isMongoId().withMessage('Invalid programme ID.'),

  body('startDate')
    .notEmpty().withMessage('Start date is required.')
    .isISO8601().withMessage('Start date must be a valid date (ISO 8601 format).')
    .toDate(),

  body('endDate')
    .notEmpty().withMessage('End date is required.')
    .isISO8601().withMessage('End date must be a valid date (ISO 8601 format).')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date.');
      }
      return true;
    }),

  body('deliveryFormat')
    .notEmpty().withMessage('Delivery format is required.')
    .isIn(Object.values(DELIVERY_FORMATS))
    .withMessage(`Delivery format must be one of: ${Object.values(DELIVERY_FORMATS).join(', ')}.`),

  body('whatsappGroupLink')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('WhatsApp group link must be a valid URL.'),

  body('maxCapacity')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Maximum capacity must be at least 1.'),
];

// ── Update cohort ─────────────────────────────────────────────────────
const updateCohortValidator = [
  body('name').optional().trim()
    .isLength({ max: 200 }).withMessage('Cohort name must not exceed 200 characters.'),

  body('startDate').optional()
    .isISO8601().withMessage('Start date must be a valid date.').toDate(),

  body('endDate').optional()
    .isISO8601().withMessage('End date must be a valid date.').toDate(),

  body('deliveryFormat').optional()
    .isIn(Object.values(DELIVERY_FORMATS))
    .withMessage(`Delivery format must be one of: ${Object.values(DELIVERY_FORMATS).join(', ')}.`),

  body('whatsappGroupLink').optional({ checkFalsy: true })
    .trim().isURL().withMessage('WhatsApp group link must be a valid URL.'),

  body('status').optional()
    .isIn(Object.values(COHORT_STATUS))
    .withMessage(`Status must be one of: ${Object.values(COHORT_STATUS).join(', ')}.`),

  body('enrollmentOpen').optional()
    .isBoolean().withMessage('enrollmentOpen must be true or false.'),

  body('maxCapacity').optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Maximum capacity must be at least 1.'),
];

export {
  createProgrammeValidator,
  updateProgrammeValidator,
  createCohortValidator,
  updateCohortValidator,
};