'use strict';

/**
 * Admin — Contact Message Routes
 * Base: /api/v1/admin/contact-messages
 * Access: Admin + Super Admin
 */

import express from 'express';
const router = express.Router();

import { listContactMessages, updateContactMessageStatus } from '../../controllers/contactMessage.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateContactMessageStatusValidator } from '../../utils/validators/engagement.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', listContactMessages);
router.patch('/:id/status', updateContactMessageStatusValidator, validate, updateContactMessageStatus);

export default router;