/**
 * Admin Routes — PanelLayout, access:'admin' (Admin + Super Admin).
 */

export const adminRoutes = [
  { id: 'admin-dashboard', path: '/admin/dashboard', page: 'DashboardPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'Dashboard' } },
  { id: 'admin-enrollments', path: '/admin/enrollments', page: 'EnrollmentsPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'All Enrollments' } },
  { id: 'admin-enrollment-detail', path: '/admin/enrollments/:id', page: 'EnrollmentDetailPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'Enrollment Detail' } },
  { id: 'admin-not-paid', path: '/admin/enrollments/not-paid', page: 'NotPaidPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'Not Paid Follow-Up' } },
  { id: 'admin-pending-reviews', path: '/admin/enrollments/pending', page: 'PendingReviewsPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'Pending Reviews' } },
  { id: 'admin-outstanding-instalments', path: '/admin/instalments/outstanding', page: 'OutstandingInstalmentsPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'Outstanding Instalments' } },
  { id: 'admin-account', path: '/admin/account', page: 'AccountSettingsPage', layout: 'PanelLayout', access: 'admin', meta: { title: 'My Account' } },
];

export default adminRoutes;