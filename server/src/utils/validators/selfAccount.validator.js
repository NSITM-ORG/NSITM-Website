'use strict';

import { body } from 'express-validator';
import { NIGERIAN_PHONE_REGEX } from '../../config/constants.js';

const updateOwnProfileValidator = [
  body('currentPassword').notEmpty().withMessage('Your current password is required to save changes.'),
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid email address.'),
  body('phone').optional({ checkFalsy: true }).trim().matches(NIGERIAN_PHONE_REGEX).withMessage('Please enter a valid Nigerian mobile number.'),
];

const changeOwnPasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Your current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Passwords do not match.');
      return true;
    }),
];

export { updateOwnProfileValidator, changeOwnPasswordValidator };