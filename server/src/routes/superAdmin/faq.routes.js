'use strict';

/**
 * Super Admin — FAQ Management Routes
 * Base: /api/v1/superadmin/faqs
 * Access: Super Admin only
 */

import express from 'express';
const router = express.Router();

import {
  listAllFaqs, getFaqCategories, createFaq, updateFaq, deleteFaq,
} from '../../controllers/faq.controller';

import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createFaqValidator, updateFaqValidator } from'../../utils/validators/engagement.validator';
import { ROLES } from '../../config/constants';

router.use(protect);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/categories', getFaqCategories); // before '/:id' — avoids collision
router.get('/', listAllFaqs);
router.post('/', createFaqValidator, validate, createFaq);
router.patch('/:id', updateFaqValidator, validate, updateFaq);
router.delete('/:id', deleteFaq);

module.exports = router;