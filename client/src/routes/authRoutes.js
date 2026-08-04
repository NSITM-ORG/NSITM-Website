/**
 * Auth Routes — standalone pages, no shared layout wrapper (layout: 'none'
 * resolves to a passthrough in the layout registry — see router.jsx).
 */

export const authRoutes = [
  { id: 'admin-login', path: '/admin/login', page: 'AdminLoginPage', layout: 'none', access: 'guest', meta: { title: 'Admin Login' } },
  { id: 'admin-forgot-password', path: '/admin/forgot-password', page: 'AdminForgotPasswordPage', layout: 'none', access: 'guest', meta: { title: 'Reset Password' } },
  { id: 'admin-reset-password', path: '/admin/reset-password/:token', page: 'AdminResetPasswordPage', layout: 'none', access: 'guest', meta: { title: 'Set New Password' } },
  { id: 'admin-register', path: '/admin/register', page: 'AdminRegisterPage', layout: 'none', access: 'guest', meta: { title: 'Complete Registration' } },
  { id: 'superadmin-register', path: '/superadmin/register', page: 'SuperAdminRegisterPage', layout: 'none', access: 'guest', meta: { title: 'Super Admin Setup' } },
  { id: 'superadmin-login', path: '/superadmin/login', page: 'SuperAdminLoginPage', layout: 'none', access: 'guest', meta: { title: 'Super Admin Login' } },
  { id: 'superadmin-forgot-password', path: '/superadmin/forgot-password', page: 'SuperAdminForgotPasswordPage', layout: 'none', access: 'guest', meta: { title: 'Reset Password' } },
  { id: 'superadmin-reset-password', path: '/superadmin/reset-password/:token', page: 'SuperAdminResetPasswordPage', layout: 'none', access: 'guest', meta: { title: 'Set New Password' } },
];

export default authRoutes;