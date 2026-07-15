/**
 * API Endpoint Registry — Single Source of Truth
 *
 * Every path the frontend calls is declared here, mirroring the backend's
 * final route map exactly (Batches 1–12). Parameterized endpoints are
 * functions; static ones are plain strings. Slices never hardcode a URL
 * string — they always import from here.
 */

export const API = {
  HEALTH: '/health',

  PUBLIC: {
    PROGRAMMES_ALL: '/public/programmes',
    PROGRAMME_BY_SLUG: (slug) => `/public/programmes/${slug}`,
    PROGRAMMES_BY_CATEGORY: (category) => `/public/programmes/category/${category}`,
    COHORTS_ACTIVE: '/public/cohorts/active',
    COHORT_BY_ID: (id) => `/public/cohorts/${id}`,
    SETTINGS: '/public/settings',
    FAQS: '/public/faqs',
    JOIN_REQUESTS: '/public/join-requests',
    CONTACT_MESSAGES: '/public/contact-messages',
    ENROLLMENT_PARTIAL: '/public/enrollment/partial',
    ENROLLMENT_PARTIAL_UPDATE: (id) => `/public/enrollment/partial/${id}`,
    ENROLLMENT_COMPLETE: '/public/enrollment/complete',
    MY_PAYMENT: '/public/my-payment',
    MY_PAYMENT_ACCESS: '/public/my-payment/access',
    MY_PAYMENT_SUBMIT: '/public/my-payment/submit',
  },

  ADMIN_AUTH: {
    LOGIN:           '/admin/auth/login',
    LOGOUT:          '/admin/auth/logout',
    FORGOT_PASSWORD: '/admin/auth/forgot-password',
    RESET_PASSWORD:  '/admin/auth/reset-password',
    ME:              '/admin/auth/me',
    PROFILE:              '/admin/auth/profile',
    CHANGE_PASSWORD:      '/admin/auth/change-password',
    SESSIONS:             '/admin/auth/sessions',
    SESSIONS_REVOKE_OTHERS: '/admin/auth/sessions/others',
    SESSION_BY_ID:        (id) => `/admin/auth/sessions/${id}`,
  },

  ADMIN_REGISTRATION: {
    VERIFY: '/admin/registration/verify',
    RESEND_CODE: '/admin/registration/resend-code',
    COMPLETE: '/admin/registration/complete',
  },

  SUPERADMIN_AUTH: {
    REGISTER:        '/superadmin/auth/register',
    LOGIN:           '/superadmin/auth/login',
    LOGOUT:          '/superadmin/auth/logout',
    FORGOT_PASSWORD: '/superadmin/auth/forgot-password',
    RESET_PASSWORD:  '/superadmin/auth/reset-password',
    ME:              '/superadmin/auth/me',
    PROFILE:              '/superadmin/auth/profile',
    CHANGE_PASSWORD:      '/superadmin/auth/change-password',
    SESSIONS:             '/superadmin/auth/sessions',
    SESSIONS_REVOKE_OTHERS: '/superadmin/auth/sessions/others',
    SESSION_BY_ID:        (id) => `/superadmin/auth/sessions/${id}`,
  },

  ADMIN: {
    DASHBOARD: '/admin/enrollments/dashboard',
    ENROLLMENTS: '/admin/enrollments',
    ENROLLMENT_BY_ID: (id) => `/admin/enrollments/${id}`,
    PAYMENT_STATUS: (id) => `/admin/payments/${id}/status`,
    INSTALMENTS_OUTSTANDING: '/admin/instalments/outstanding',
    INSTALMENT_STATUS: (id) => `/admin/instalments/${id}/status`,
    CONTACT_MESSAGES: '/admin/contact-messages',
    CONTACT_MESSAGE_STATUS: (id) => `/admin/contact-messages/${id}/status`,
  },

  SUPERADMIN: {
    ACCOUNTS: '/superadmin/accounts',
    ACCOUNT_BY_ID: (id) => `/superadmin/accounts/${id}`,
    ACCOUNT_DEACTIVATE: (id) => `/superadmin/accounts/${id}/deactivate`,
    ACCOUNT_REACTIVATE: (id) => `/superadmin/accounts/${id}/reactivate`,
    ACCOUNT_RESET_PASSWORD: (id) => `/superadmin/accounts/${id}/reset-password`,

    INVITE_ADMIN: '/superadmin/admins/invite',
    INVITATIONS: '/superadmin/admins/invitations',
    INVITATION_RESEND: (id) => `/superadmin/admins/invitations/${id}/resend`,
    INVITATION_REVOKE: (id) => `/superadmin/admins/invitations/${id}/revoke`,

    PROGRAMMES: '/superadmin/programmes',
    PROGRAMME_BY_ID: (id) => `/superadmin/programmes/${id}`,

    COHORTS: '/superadmin/cohorts',
    COHORT_BY_ID: (id) => `/superadmin/cohorts/${id}`,

    ENROLLMENT_ARCHIVE: (id) => `/superadmin/enrollments/${id}`,

    JOIN_REQUESTS: '/superadmin/join-requests',
    JOIN_REQUEST_STATUS: (id) => `/superadmin/join-requests/${id}/status`,

    FAQS: '/superadmin/faqs',
    FAQ_BY_ID: (id) => `/superadmin/faqs/${id}`,
    FAQ_CATEGORIES: '/superadmin/faqs/categories',

    ANALYTICS: '/superadmin/analytics',
    EXPORT: '/superadmin/analytics/export',
    PAYMENT_REVERSE: (id) => `/superadmin/analytics/payments/${id}/reverse`,

    SETTINGS: '/superadmin/settings',

    AUDIT_PASSWORD_RESETS: '/superadmin/audit/password-resets',
    AUDIT_UNAUTHORIZED: '/superadmin/audit/unauthorized-access',
  },
};

export default API;