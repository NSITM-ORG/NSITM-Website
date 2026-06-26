'use strict';

/**
 * Public Programme Routes
 * Base: /api/v1/public/programmes
 * Access: No authentication required
 */

import express from 'express';
const router = express.Router();

import {
  getAllProgrammes,
  getProgrammeBySlug,
  getProgrammesByCategory,
} from '../../controllers/programme.controller.js';

// GET /api/v1/public/programmes
// All 26 programmes grouped by category (FRD FR-01.3)
router.get('/', getAllProgrammes);

// GET /api/v1/public/programmes/category/:category
// Must be before /:slug to prevent 'category' being matched as a slug
router.get('/category/:category', getProgrammesByCategory);

// GET /api/v1/public/programmes/:slug
// Individual programme detail page (FRD FR-01.4)
router.get('/:slug', getProgrammeBySlug);

export default router;