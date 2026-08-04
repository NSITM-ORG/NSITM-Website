'use strict';

/**
 * Authentication & Account Validators
 * Covers: Admin login/reset, Super Admin register/login/reset,
 * Admin invitation generation, and registration completion.
 */

import { body, query } from 'express-validator';
import { NIGERIAN_PHONE_REGEX } from '../../config/constants.js';

// ── Shared password complexity rules ──────────────────────────────────
const passwordComplexityRules = (fieldName = 'password') => [
  body(fieldName)
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

const confirmPasswordRule = [
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match.');
      return true;
    }),
];

// ── Admin / Super Admin login (shared shape, used by both endpoints) ──
const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.') ,
  body('password').notEmpty().withMessage('Password is required.'),
];

// ── Forgot password (shared shape) ────────────────────────────────────
const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
];

// ── Reset password (shared shape — token has no expiry check here) ───
const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Reset token is required.'),
  ...passwordComplexityRules('password'),
  ...confirmPasswordRule,
];

// ── Super Admin self-registration ──────────────────────────────────────
const superAdminRegisterValidator = [
  body('setupKey').notEmpty().withMessage('Setup key is required.'),
  body('name').trim().notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').trim().notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required.')
    .matches(NIGERIAN_PHONE_REGEX).withMessage('Please enter a valid Nigerian mobile number.'),
  ...passwordComplexityRules('password'),
  ...confirmPasswordRule,
];

// ── Super Admin invites an Admin (email only) ─────────────────────────
const inviteAdminValidator = [
  body('email').trim().notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
];

// ── Verify an invitation link (GET query params) ──────────────────────
const verifyInvitationValidator = [
  query('token').notEmpty().withMessage('Registration token is required.'),
  query('code').notEmpty().withMessage('Verification code is required.'),
];

// ── Resend invitation code ─────────────────────────────────────────────
const resendInvitationCodeValidator = [
  body('token').trim().notEmpty().withMessage('Registration token is required.'),
];

// ── Complete admin registration ────────────────────────────────────────
const completeRegistrationValidator = [
  body('token').trim().notEmpty().withMessage('Registration token is required.'),
  body('code').trim().notEmpty().withMessage('Verification code is required.'),
  body('name').trim().notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.')
    .matches(NIGERIAN_PHONE_REGEX).withMessage('Please enter a valid Nigerian mobile number.'),
  ...passwordComplexityRules('password'),
  ...confirmPasswordRule,
];

// ── Update admin account (Super Admin action — unchanged shape) ───────
const updateAdminAccountValidator = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').optional().trim()
    .isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim()
    .matches(NIGERIAN_PHONE_REGEX).withMessage('Please enter a valid Nigerian mobile number.'),
];

export {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  superAdminRegisterValidator,
  inviteAdminValidator,
  verifyInvitationValidator,
  resendInvitationCodeValidator,
  completeRegistrationValidator,
  updateAdminAccountValidator,
  passwordComplexityRules,
};