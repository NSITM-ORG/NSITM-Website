'use strict';

/**
 * Public Engagement Routes
 * Base: /api/v1/public
 * Covers: Join Community submission, Contact Message submission, published FAQs.
 */

import express from 'express';
const router = express.Router();

import { createJoinRequest } from '../../controllers/joinRequest.controller.js';
import { createContactMessage } from '../../controllers/contactMessage.controller.js';
import { getPublishedFaqs } from '../../controllers/faq.controller.js';

import { validate } from '../../middleware/validate.middleware.js';
import { joinCommunityLimiter, contactMessageLimiter } from '../../middleware/rateLimiter.middleware.js';
import {
  joinRequestValidator,
  contactMessageValidator,
} from '../../utils/validators/engagement.validator.js';

// POST /api/v1/public/join-requests
router.post('/join-requests', joinCommunityLimiter, joinRequestValidator, validate, createJoinRequest);

// POST /api/v1/public/contact-messages
router.post('/contact-messages', contactMessageLimiter, contactMessageValidator, validate, createContactMessage);

// GET /api/v1/public/faqs
router.get('/faqs', getPublishedFaqs);

export default router;