/**
 * src/routes/cohortPublicRoutes.js
 *
 * Public Cohort Routes — SinglePageLayout, per client instruction. Kept
 * as its own small array rather than folded into enrollmentRoutes.js,
 * since these aren't part of the enrollment form flow itself, just
 * grouped under the same minimal-chrome layout.
 */

export const cohortPublicRoutes = [
    { id: 'cohorts-hub', path: '/cohorts', page: 'CohortsHubPage', layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Cohorts' } },
    { id: 'cohorts-active-list', path: '/cohorts/active', page: 'CohortsActiveListPage', layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Active Cohorts' } },
    { id: 'cohorts-completed-list', path: '/cohorts/completed', page: 'CohortsCompletedListPage', layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Completed Cohorts' } },
    { id: 'active-cohort-detail', path: '/cohorts/:id', page: 'ActiveCohortDetailPage', layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Cohort Details' } },
];

export default cohortPublicRoutes;