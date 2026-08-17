'use strict';

import express from 'express';
const router = express.Router();

import { getPublicLegalPageBySlug } from '../../controllers/legalPage.controller.js';

// GET /api/v1/public/legal-pages/:slug
router.get('/:slug', getPublicLegalPageBySlug);

export default router;
