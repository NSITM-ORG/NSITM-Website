'use strict';

/**
 * Super Admin — Admin Invitation Management Routes
 * Base: /api/v1/superadmin/admins
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  createInvitation, listInvitations, resendInvitationCode, revokeInvitation,
} from '../../controllers/adminInvitation.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { inviteAdminValidator } from '../../utils/validators/auth.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.post('/invite', inviteAdminValidator, validate, createInvitation);
router.get('/invitations', listInvitations);
router.post('/invitations/:id/resend', resendInvitationCode);
router.post('/invitations/:id/revoke', revokeInvitation);

export default router;