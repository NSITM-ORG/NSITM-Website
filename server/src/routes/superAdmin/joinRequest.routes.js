'use strict';

/**
 * Super Admin — Join Request Routes
 * Base: /api/v1/superadmin/join-requests
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import { listJoinRequests, updateJoinRequestStatus } from '../../controllers/joinRequest.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateJoinRequestStatusValidator } from '../../utils/validators/engagement.validator.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', listJoinRequests);
router.patch('/:id/status', updateJoinRequestStatusValidator, validate, updateJoinRequestStatus);

export default router;