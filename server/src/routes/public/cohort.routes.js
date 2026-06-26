'use strict';

/**
 * Public Cohort Routes
 * Base: /api/v1/public/cohorts
 * Access: No authentication required
 */

import express from 'express';
const router = express.Router();

import {
  getActiveCohorts,
  getCohortById,
} from '../../controllers/cohort.controller.js';

// GET /api/v1/public/cohorts/active
// Active cohorts page (FRD FR-01.5)
// Must be before /:id to prevent 'active' being matched as an id
router.get('/active', getActiveCohorts);

// GET /api/v1/public/cohorts/:id
router.get('/:id', getCohortById);

export default router;