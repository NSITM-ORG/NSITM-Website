'use strict';

/**
 * Public Settings Routes
 * Base: /api/v1/public/settings
 * Access: No authentication required
 *
 * Exposes only bank details and WhatsApp info for:
 *   - The payment details page (Step 3 of enrollment form)
 *   - The instalment receipt submission page (FR-10.3)
 *
 * FRD BR10: "Bank account details displayed on the payment page are
 * retrieved from the database. They cannot be hardcoded in the frontend."
 */

import express from 'express';
const router = express.Router();

import { getPublicSettings } from '../../controllers/settings.controller.js';

// GET /api/v1/public/settings
router.get('/', getPublicSettings);

export default router;