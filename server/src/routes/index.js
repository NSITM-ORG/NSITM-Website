'use strict';

import express from 'express';
const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────
import publicProgrammeRoutes  from './public/programme.routes.js';
import publicCohortRoutes     from './public/cohort.routes.js';
import publicSettingsRoutes   from './public/settings.routes.js';
import publicEnrollmentRoutes from './public/enrollement.routes.js';
import publicInstalmentRoutes from './public/instalment.routes.js';
import publicEngagementRoutes  from './public/engagement.routes.js';

// ── Admin routes ─────────────────────────────────────────────────────
import adminAuthRoutes         from './admin/auth.routes.js';
import adminRegistrationRoutes from './admin/registration.routes.js';
import adminEnrollmentRoutes   from './admin/enrollment.routes.js';
import adminPaymentRoutes     from './admin/payment.routes.js';
import adminInstalmentRoutes   from './admin/instalment.routes.js';
import adminContactMessageRoutes from './admin/contactMessage.routes.js';

// ── Super Admin routes ───────────────────────────────────────────────
import superAdminAuthRoutes        from './superAdmin/auth.routes.js';
import superAdminAccountRoutes     from './superAdmin/account.routes.js';
import superAdminAdminInviteRoutes from './superAdmin/adminInvitation.routes.js';
import superAdminAuditRoutes       from './superAdmin/audit.routes.js';
import superAdminProgrammeRoutes   from './superAdmin/programme.routes.js';
import superAdminCohortRoutes      from './superAdmin/cohort.routes.js';
import superAdminAnalyticsRoutes   from './superAdmin/analytics.routes.js';
import superAdminSettingsRoutes    from './superAdmin/settings.routes.js';
import superAdminJoinRequestRoutes from './superAdmin/joinRequest.routes.js';
import superAdminFaqRoutes from './superAdmin/faq.routes.js';
import superAdminEnrollmentRoutes from './superAdmin/enrollment.routes.js';

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { api: 'NSITM Backend API', version: 'v1', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() },
    message: 'NSITM API v1 is running. All systems operational.',
  });
});

// ── PUBLIC ─────────────────────────────────────────────────────────────
router.use('/public/programmes', publicProgrammeRoutes);
router.use('/public/cohorts', publicCohortRoutes);
router.use('/public/settings', publicSettingsRoutes);
router.use('/public/enrollment', publicEnrollmentRoutes);
router.use('/public/my-payment', publicInstalmentRoutes);
router.use('/public', publicEngagementRoutes); // /join-requests, /contact-messages, /faqs


// ── ADMIN ──────────────────────────────────────────────────────────────
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/registration', adminRegistrationRoutes); // public, invite-based
router.use('/admin/enrollments', adminEnrollmentRoutes);
router.use('/admin/payments', adminPaymentRoutes);
router.use('/admin/instalments', adminInstalmentRoutes);
router.use('/admin/contact-messages', adminContactMessageRoutes);


// ── SUPER ADMIN ──────────────────────────────────────────────────────
router.use('/superadmin/auth', superAdminAuthRoutes);
router.use('/superadmin/accounts', superAdminAccountRoutes);
router.use('/superadmin/admins', superAdminAdminInviteRoutes);
router.use('/superadmin/audit', superAdminAuditRoutes);
router.use('/superadmin/programmes', superAdminProgrammeRoutes);
router.use('/superadmin/cohorts', superAdminCohortRoutes);
router.use('/superadmin/analytics', superAdminAnalyticsRoutes);
router.use('/superadmin/settings', superAdminSettingsRoutes);
router.use('/superadmin/join-requests', superAdminJoinRequestRoutes);
router.use('/superadmin/join-requests', superAdminJoinRequestRoutes);
router.use('/superadmin/faqs', superAdminFaqRoutes);
router.use('/superadmin/enrollments', superAdminEnrollmentRoutes);

export default router;