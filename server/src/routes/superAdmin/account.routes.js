'use strict';

/**
 * Super Admin — Account Management Routes
 * Base: /api/v1/superadmin/accounts
 * Access: Super Admin only
 *
 * Account CREATION is no longer here — see adminInvitation.routes.js.
 * This file now only manages EXISTING accounts (any role).
 */

import express from 'express';
const router = express.Router();

import {
  getAllAdminAccounts, updateAdminAccount, deactivateAdminAccount,
  reactivateAdminAccount, deleteAdminAccount, resetAdminPassword,
} from '../../controllers/superAdmin.controller.js' ;

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateAdminAccountValidator } from '../../utils/validators/auth.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', getAllAdminAccounts);
router.patch('/:id', updateAdminAccountValidator, validate, updateAdminAccount);
router.patch('/:id/deactivate', deactivateAdminAccount);
router.patch('/:id/reactivate', reactivateAdminAccount);
router.delete('/:id', deleteAdminAccount);
router.post('/:id/reset-password', resetAdminPassword);

export default router;