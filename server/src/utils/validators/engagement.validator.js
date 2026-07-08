'use strict';

/**
 * Engagement Validators
 * Covers: Join Community, Contact Message, FAQ management.
 * Grouped under one file since these are all lightweight, low-complexity
 * public engagement features (distinct from the core enrollment domain).
 */

import { body } from 'express-validator';
import { JOIN_COMMUNITY_ROLES } from '../../config/constants.js';

// ── Join Our Community ────────────────────────────────────────────────
const joinRequestValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('role')
    .notEmpty().withMessage('Please select a role.')
    .isIn(Object.values(JOIN_COMMUNITY_ROLES))
    .withMessage(`Role must be one of: ${Object.values(JOIN_COMMUNITY_ROLES).join(', ')}.`),
];

const updateJoinRequestStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['new', 'reviewed', 'archived'])
    .withMessage("Status must be 'new', 'reviewed', or 'archived'."),
];

// ── Contact Message ───────────────────────────────────────────────────
const contactMessageValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.'),
];

const updateContactMessageStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['new', 'read', 'archived'])
    .withMessage("Status must be 'new', 'read', or 'archived'."),
];

// ── FAQ Management ────────────────────────────────────────────────────
const createFaqValidator = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question is required.')
    .isLength({ min: 5, max: 300 }).withMessage('Question must be between 5 and 300 characters.'),

  body('answer')
    .trim()
    .notEmpty().withMessage('Answer is required.')
    .isLength({ min: 5, max: 3000 }).withMessage('Answer must be between 5 and 3000 characters.'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters.'),

  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be true or false.'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
];

const updateFaqValidator = [
  body('question').optional().trim()
    .isLength({ min: 5, max: 300 }).withMessage('Question must be between 5 and 300 characters.'),
  body('answer').optional().trim()
    .isLength({ min: 5, max: 3000 }).withMessage('Answer must be between 5 and 3000 characters.'),
  body('category').optional().trim()
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters.'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false.'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer.'),
];

export {
  joinRequestValidator,
  updateJoinRequestStatusValidator,
  contactMessageValidator,
  updateContactMessageStatusValidator,
  createFaqValidator,
  updateFaqValidator,
};