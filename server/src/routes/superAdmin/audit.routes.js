'use strict';

/**
 * Super Admin — Audit Trail Routes
 * Base: /api/v1/superadmin/audit
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import { getPasswordResetTrail, getUnauthorizedAccessTrail } from '../../controllers/auditTrail.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/password-resets', getPasswordResetTrail);
router.get('/unauthorized-access', getUnauthorizedAccessTrail);

export default router;