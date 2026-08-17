'use strict';

import express from 'express';
const router = express.Router();

import {
  getAllLegalPages,
  getLegalPageBySlug,
  updateLegalPage,
  publishLegalPage,
} from '../../controllers/legalPage.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { ROLES } from '../../config/constants.js';

// All routes require at least admin privileges
router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// GET /api/v1/admin/legal-pages
router.get('/', getAllLegalPages);

// GET /api/v1/admin/legal-pages/:slug
router.get('/:slug', getLegalPageBySlug);

// PUT /api/v1/admin/legal-pages/:slug
router.put('/:slug', updateLegalPage);

// PATCH /api/v1/admin/legal-pages/:slug/publish
router.patch('/:slug/publish', publishLegalPage);

export default router;
