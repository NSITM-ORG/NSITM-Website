'use strict';

/**
 * Admin Authentication Routes
 * Base: /api/v1/admin/auth
 * Role-restricted to accounts with role === 'admin' (enforced in controller).
 */

import express from 'express';
const router = express.Router();

import { login, logout, forgotPassword, resetPassword, getMe } from '../../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginLimiter } from '../../middleware/rateLimiter.middleware.js';
import { loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../../utils/validators/auth.validator.js';

router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;