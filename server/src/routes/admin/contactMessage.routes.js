'use strict';

/**
 * Admin — Contact Message Routes
 * Base: /api/v1/admin/contact-messages
 * Access: Admin + Super Admin
 */

import express from 'express';
const router = express.Router();

import { listContactMessages, updateContactMessageStatus } from '../../controllers/contactMessage.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateContactMessageStatusValidator } from '../../utils/validators/engagement.validator';
import { ROLES } from '../../config/constants';

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', listContactMessages);
router.patch('/:id/status', updateContactMessageStatusValidator, validate, updateContactMessageStatus);

export default router;