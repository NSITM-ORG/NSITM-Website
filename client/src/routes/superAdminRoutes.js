/**
 * Super Admin Routes — PanelLayout, access:'super-admin' only.
 */

export const superAdminRoutes = [
  { id: 'sa-programmes', path: '/superadmin/programmes', page: 'ProgrammeManagementPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Programmes' } },
  { id: 'sa-programme-create', path: '/superadmin/programmes/create', page: 'ProgrammeCreatePage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Create Programme' } },
  { id: 'sa-programme-edit', path: '/superadmin/programmes/:id/edit', page: 'ProgrammeEditPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Edit Programme' } },
  { id: 'sa-cohorts', path: '/superadmin/cohorts', page: 'CohortManagementPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Cohorts' } },
  { id: 'sa-cohort-create', path: '/superadmin/cohorts/create', page: 'CohortCreatePage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Create Cohort' } },
  { id: 'sa-cohort-edit', path: '/superadmin/cohorts/:id/edit', page: 'CohortEditPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Edit Cohort' } },
  { id: 'sa-accounts', path: '/superadmin/accounts', page: 'AccountManagementPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Admin Accounts' } },
  { id: 'sa-invitations', path: '/superadmin/invitations', page: 'InvitationsPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Admin Invitations' } },
  { id: 'sa-join-requests', path: '/superadmin/join-requests', page: 'JoinRequestsPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Join Community Requests' } },
  { id: 'sa-faqs', path: '/superadmin/faqs', page: 'FaqManagementPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'FAQ Management' } },
  { id: 'sa-analytics', path: '/superadmin/analytics', page: 'AnalyticsPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Analytics' } },
  { id: 'sa-export', path: '/superadmin/export', page: 'ExportPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Export Students' } },
  { id: 'sa-settings', path: '/superadmin/settings', page: 'SettingsPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Settings' } },
  { id: 'sa-audit-password-resets', path: '/superadmin/audit/password-resets', page: 'AuditPasswordResetsPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Password Reset Audit' } },
  { id: 'sa-audit-unauthorized', path: '/superadmin/audit/unauthorized-access', page: 'AuditUnauthorizedPage', layout: 'PanelLayout', access: 'super-admin', meta: { title: 'Unauthorized Access Audit' } },
];

export default superAdminRoutes;