/**
 * Enrollment Routes — the Enrollment page-group, rendered inside
 * SinglePageLayout (no header/footer — see layout docstring).
 */

export const enrollmentRoutes = [
  {
    id: 'enroll', path: '/enroll', page: 'EnrollmentPage', layout: 'SinglePageLayout', access: 'allow',
    meta: { title: 'Enroll Now' },
  },
  {
    id: 'enrollment-confirmation', path: '/enroll/confirmation', page: 'EnrollmentConfirmationPage',
    layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Enrollment Submitted' },
  },
  {
    id: 'my-payment', path: '/my-payment', page: 'MyPaymentPage', layout: 'SinglePageLayout', access: 'allow',
    meta: { title: 'Submit Instalment Payment' },
  },
  {
    id: 'my-payment-access', path: '/my-payment/access', page: 'MyPaymentAccessPage',
    layout: 'SinglePageLayout', access: 'allow', meta: { title: 'Your Payment Details' },
  },
];

export default enrollmentRoutes;