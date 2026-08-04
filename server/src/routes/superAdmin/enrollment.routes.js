'use strict';

/**
 * Super Admin — Enrollment Management Routes
 * Base: /api/v1/superadmin/enrollments
 * Access: Super Admin only
 *
 * Currently holds only the archive/delete action for stale partial
 * ('Not Paid') records — FRD FR-08.4. All read/filter/review operations
 * on enrollments remain under /admin/enrollments (shared with Admin role).
 */

import express from 'express';
const router = express.Router();

import { archivePartialEnrollment } from '../../controllers/enrollment.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

// DELETE /api/v1/superadmin/enrollments/:id
router.delete('/:id', archivePartialEnrollment);

export default router;