'use strict';

/**
 * Admin Registration Routes (Public — invitation-based)
 * Base: /api/v1/admin/registration
 *
 * The ONLY pathway through which an Admin account can be created (point 4).
 */

import express from 'express';
const router = express.Router();

import {
  verifyInvitation, requestNewCode, completeRegistration,
} from '../../controllers/adminInvitation.controller.js';

import { validate } from '../../middleware/validate.middleware.js';
import { adminRegistrationLimiter } from '../../middleware/rateLimiter.middleware.js';
import {
  verifyInvitationValidator, resendInvitationCodeValidator, completeRegistrationValidator,
} from '../../utils/validators/auth.validator.js';

router.get('/verify', adminRegistrationLimiter, verifyInvitationValidator, validate, verifyInvitation);
router.post('/resend-code', adminRegistrationLimiter, resendInvitationCodeValidator, validate, requestNewCode);
router.post('/complete', adminRegistrationLimiter, completeRegistrationValidator, validate, completeRegistration);

export default router;