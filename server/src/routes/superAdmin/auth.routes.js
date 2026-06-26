'use strict';

/**
 * Super Admin Authentication Routes
 * Base: /api/v1/superadmin/auth
 * Deliberately separate namespace from /admin/auth (point 1/2).
 */

import express from 'express';
const router = express.Router();

import { logout, getMe } from '../../controllers/auth.controller.js'; // role-agnostic, reused
import {
  register, login, forgotPassword, resetPassword,
} from '../../controllers/superAdminAuth.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginLimiter, superAdminRegisterLimiter } from '../../middleware/rateLimiter.middleware.js';
import {
  loginValidator, forgotPasswordValidator, resetPasswordValidator,
  superAdminRegisterValidator,
} from '../../utils/validators/auth.validator.js';

router.post('/register', superAdminRegisterLimiter, superAdminRegisterValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;