'use strict';

/**
 * Admin Authentication Routes
 * Base: /api/v1/admin/auth
 * Role-restricted to accounts with role === 'admin' (enforced in controller).
 */

import express from 'express';

import { login, logout, forgotPassword, resetPassword, getMe } from '../../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { loginLimiter } from '../../middleware/rateLimiter.middleware.js';
import { loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../../utils/validators/auth.validator.js';
import { updateOwnProfile, changeOwnPassword } from '../../controllers/selfAccount.controller.js';
import { listSessions, revokeSession, revokeOtherSessions } from '../../controllers/session.controller.js';
import { updateOwnProfileValidator, changeOwnPasswordValidator } from '../../utils/validators/selfAccount.validator.js';

const router = express.Router();


router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ── Self-service profile & password (Issue 3) ────────────────────────
router.patch('/profile', protect, updateOwnProfileValidator, validate, updateOwnProfile);
router.post('/change-password', protect, changeOwnPasswordValidator, validate, changeOwnPassword);

// ── Multi-device session management (Issue 2) ─────────────────────────
router.get('/sessions', protect, listSessions);
router.delete('/sessions/others', protect, revokeOtherSessions); // must precede /:id
router.delete('/sessions/:id', protect, revokeSession);

export default router;