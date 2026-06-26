'use strict';

/**
 * Super Admin — Settings Routes
 * Base: /api/v1/superadmin/settings
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  getFullSettings,
  updateSettings,
} from '../../controllers/settings.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// GET /api/v1/superadmin/settings
router.get('/', getFullSettings);

// PUT /api/v1/superadmin/settings
router.put('/', updateSettings);

export default router;