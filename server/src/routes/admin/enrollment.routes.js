'use strict';

/**
 * Admin Enrollment Routes
 * Base: /api/v1/admin/enrollments
 * Access: Admin + Super Admin
 */

import express from 'express';
const router = express.Router();

import {
  getAllEnrollments,
  getEnrollmentById,
  getDashboardOverview,
} from '../../controllers/enrollment.controller.js';

import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

// All routes in this file require authentication
router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));
console.log('ADMIN:', ROLES.ADMIN);
console.log('SUPER_ADMIN:', ROLES.SUPER_ADMIN);

// GET /api/v1/admin/enrollments/dashboard
// Must be before /:id to prevent 'dashboard' being treated as an id
router.get('/dashboard', getDashboardOverview);

// GET /api/v1/admin/enrollments
// Filterable by: status, programme, cohort, fromDate, toDate, search
router.get('/', getAllEnrollments);

// GET /api/v1/admin/enrollments/:id
router.get('/:id', getEnrollmentById);

export default router;