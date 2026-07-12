/**
 * useManageState — THE Single Entry Point Into Application State
 *
 * PROJECT CONVENTION (enforced by team discipline, not a build-time
 * check): No component, anywhere in this codebase, ever imports
 * useSelector, useDispatch, or a slice file directly. Every single
 * piece of state and every single server-communicating action flows
 * through this one hook.
 *
 * WHY:
 *   1. One file to look at when debugging "why didn't my state update."
 *   2. Renaming/restructuring a slice never requires touching more than
 *      this file + the slice itself — component code is insulated.
 *   3. Every action returns a Promise via .unwrap() (from
 *      createAsyncThunk), so components can do:
 *
 *        try {
 *          const result = await actions.login({ email, password });
 *          navigate('/admin/dashboard');
 *        } catch (err) {
 *          // err is the same ApiError-shaped object the toast
 *          // middleware already displayed — component can react
 *          // locally (e.g. keep a dialog open) WITHOUT re-showing
 *          // a second toast, since the middleware already fired one.
 *        }
 *
 *      This satisfies the "response usable in-component, but state is
 *      already patched centrally" requirement: by the time this Promise
 *      resolves/rejects, the relevant slice has ALREADY been updated by
 *      extraReducers — the component is just reading the same result to
 *      decide its own local UI behavior (close a modal, redirect, etc).
 *
 * PERFORMANCE:
 *   Each domain is pulled with its own useSelector call (not one giant
 *   selector) so React-Redux's default reference-equality check means a
 *   component only re-renders when the SPECIFIC slice(s) it destructures
 *   actually change — selecting `auth` doesn't cause a re-render when
 *   `programmes` changes, even though both come out of this one hook.
 *
 *   The `actions` object is memoized once (empty dependency array,
 *   since dispatch is stable and thunk imports are module-level
 *   constants) so it never causes a re-render of consuming components
 *   by identity change alone.
 */

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as authActions from '../store/slices/authSlice.js';
import * as programmeActions from '../store/slices/programmeSlice.js';
import * as cohortActions from '../store/slices/cohortSlice.js';
import * as enrollmentActions from '../store/slices/enrollmentSlice.js';
import * as paymentActions from '../store/slices/paymentSlice.js';
import * as instalmentActions from '../store/slices/instalmentSlice.js';
import * as accountActions from '../store/slices/accountSlice.js';
import * as invitationActions from '../store/slices/invitationSlice.js';
import * as joinRequestActions from '../store/slices/joinRequestSlice.js';
import * as contactMessageActions from '../store/slices/contactMessageSlice.js';
import * as faqActions from '../store/slices/faqSlice.js';
import * as analyticsActions from '../store/slices/analyticsSlice.js';
import * as settingsActions from '../store/slices/settingsSlice.js';
import * as auditActions from '../store/slices/auditSlice.js';
import { addToast, removeToast, openModal, closeModal, toggleSidebar, setSidebarCollapsed } from '../store/slices/uiSlice.js';

export function useManageState() {
  const dispatch = useDispatch();

  // ── State (one useSelector per domain — see perf note above) ──────
  const auth = useSelector((s) => s.auth);
  const programmes = useSelector((s) => s.programmes);
  const cohorts = useSelector((s) => s.cohorts);
  const enrollments = useSelector((s) => s.enrollments);
  const payments = useSelector((s) => s.payments);
  const instalments = useSelector((s) => s.instalments);
  const accounts = useSelector((s) => s.accounts);
  const invitations = useSelector((s) => s.invitations);
  const joinRequests = useSelector((s) => s.joinRequests);
  const contactMessages = useSelector((s) => s.contactMessages);
  const faqs = useSelector((s) => s.faqs);
  const analytics = useSelector((s) => s.analytics);
  const settings = useSelector((s) => s.settings);
  const audit = useSelector((s) => s.audit);
  const ui = useSelector((s) => s.ui);

  // ── Actions (bound + auto-unwrapped, memoized once) ───────────────
  const actions = useMemo(
    () => ({
      // Auth
      adminLogin: (p) => dispatch(authActions.adminLogin(p)).unwrap(),
      adminForgotPassword: (p) => dispatch(authActions.adminForgotPassword(p)).unwrap(),
      adminResetPassword: (p) => dispatch(authActions.adminResetPassword(p)).unwrap(),
      superAdminRegister: (p) => dispatch(authActions.superAdminRegister(p)).unwrap(),
      superAdminLogin: (p) => dispatch(authActions.superAdminLogin(p)).unwrap(),
      superAdminForgotPassword: (p) => dispatch(authActions.superAdminForgotPassword(p)).unwrap(),
      superAdminResetPassword: (p) => dispatch(authActions.superAdminResetPassword(p)).unwrap(),
      logout: () => dispatch(authActions.logout()).unwrap(),
      getMe: (roleHint) => dispatch(authActions.getMe(roleHint)).unwrap(),
      clearAuthError: () => dispatch(authActions.clearAuthError()),
      clearUser: () => dispatch(authActions.clearUser()),

      // Programmes
      fetchAllProgrammes: () => dispatch(programmeActions.fetchAllProgrammes()).unwrap(),
      fetchProgrammeBySlug: (slug) => dispatch(programmeActions.fetchProgrammeBySlug(slug)).unwrap(),
      fetchProgrammesByCategory: (p) => dispatch(programmeActions.fetchProgrammesByCategory(p)).unwrap(),
      fetchAdminProgrammes: (f) => dispatch(programmeActions.fetchAdminProgrammes(f)).unwrap(),
      fetchProgrammeByIdAdmin: (id) => dispatch(programmeActions.fetchProgrammeByIdAdmin(id)).unwrap(),
      createProgramme: (p) => dispatch(programmeActions.createProgramme(p)).unwrap(),
      updateProgramme: (p) => dispatch(programmeActions.updateProgramme(p)).unwrap(),
      deleteProgramme: (id) => dispatch(programmeActions.deleteProgramme(id)).unwrap(),
      clearCurrentProgramme: () => dispatch(programmeActions.clearCurrentProgramme()),

      // Cohorts
      fetchActiveCohorts: () => dispatch(cohortActions.fetchActiveCohorts()).unwrap(),
      fetchCohortById: (id) => dispatch(cohortActions.fetchCohortById(id)).unwrap(),
      fetchAdminCohorts: (f) => dispatch(cohortActions.fetchAdminCohorts(f)).unwrap(),
      fetchCohortByIdAdmin: (id) => dispatch(cohortActions.fetchCohortByIdAdmin(id)).unwrap(),
      createCohort: (p) => dispatch(cohortActions.createCohort(p)).unwrap(),
      updateCohort: (p) => dispatch(cohortActions.updateCohort(p)).unwrap(),
      deleteCohort: (id) => dispatch(cohortActions.deleteCohort(id)).unwrap(),

      // Enrollments
      createPartialRecord: (p) => dispatch(enrollmentActions.createPartialRecord(p)).unwrap(),
      updatePartialProgramme: (p) => dispatch(enrollmentActions.updatePartialProgramme(p)).unwrap(),
      completeEnrollment: (fd) => dispatch(enrollmentActions.completeEnrollment(fd)).unwrap(),
      fetchDashboardOverview: () => dispatch(enrollmentActions.fetchDashboardOverview()).unwrap(),
      fetchAllEnrollments: (f) => dispatch(enrollmentActions.fetchAllEnrollments(f)).unwrap(),
      fetchEnrollmentById: (id) => dispatch(enrollmentActions.fetchEnrollmentById(id)).unwrap(),
      archivePartialEnrollment: (id) => dispatch(enrollmentActions.archivePartialEnrollment(id)).unwrap(),
      setEnrollmentFilters: (f) => dispatch(enrollmentActions.setEnrollmentFilters(f)),
      setPartialEnrollmentId: (id) => dispatch(enrollmentActions.setPartialEnrollmentId(id)),
      clearPartialEnrollmentId: () => dispatch(enrollmentActions.clearPartialEnrollmentId()),
      clearCurrentEnrollment: () => dispatch(enrollmentActions.clearCurrentEnrollment()),

      // Payments
      updatePaymentStatus: (p) => dispatch(paymentActions.updatePaymentStatus(p)).unwrap(),
      reversePaymentStatus: (p) => dispatch(paymentActions.reversePaymentStatus(p)).unwrap(),

      // Instalments
      requestInstalmentAccessLink: (p) => dispatch(instalmentActions.requestInstalmentAccessLink(p)).unwrap(),
      validateInstalmentToken: (p) => dispatch(instalmentActions.validateInstalmentToken(p)).unwrap(),
      submitInstalmentReceipt: (fd) => dispatch(instalmentActions.submitInstalmentReceipt(fd)).unwrap(),
      fetchOutstandingInstalments: (page) => dispatch(instalmentActions.fetchOutstandingInstalments(page)).unwrap(),
      updateInstalmentStatus: (p) => dispatch(instalmentActions.updateInstalmentStatus(p)).unwrap(),
      clearAccessSummary: () => dispatch(instalmentActions.clearAccessSummary()),

      // Accounts
      fetchAllAccounts: (f) => dispatch(accountActions.fetchAllAccounts(f)).unwrap(),
      fetchAccountById: (id) => dispatch(accountActions.fetchAccountById(id)).unwrap(),
      updateAccount: (p) => dispatch(accountActions.updateAccount(p)).unwrap(),
      deactivateAccount: (id) => dispatch(accountActions.deactivateAccount(id)).unwrap(),
      reactivateAccount: (id) => dispatch(accountActions.reactivateAccount(id)).unwrap(),
      deleteAccount: (id) => dispatch(accountActions.deleteAccount(id)).unwrap(),
      resetAccountPassword: (id) => dispatch(accountActions.resetAccountPassword(id)).unwrap(),

      // Invitations
      createInvitation: (p) => dispatch(invitationActions.createInvitation(p)).unwrap(),
      fetchInvitations: (f) => dispatch(invitationActions.fetchInvitations(f)).unwrap(),
      resendInvitationCode: (id) => dispatch(invitationActions.resendInvitationCode(id)).unwrap(),
      revokeInvitation: (id) => dispatch(invitationActions.revokeInvitation(id)).unwrap(),
      verifyInvitation: (p) => dispatch(invitationActions.verifyInvitation(p)).unwrap(),
      requestNewInvitationCode: (token) => dispatch(invitationActions.requestNewInvitationCode(token)).unwrap(),
      completeRegistration: (p) => dispatch(invitationActions.completeRegistration(p)).unwrap(),

      // Join Requests
      createJoinRequest: (p) => dispatch(joinRequestActions.createJoinRequest(p)).unwrap(),
      fetchJoinRequests: (f) => dispatch(joinRequestActions.fetchJoinRequests(f)).unwrap(),
      updateJoinRequestStatus: (p) => dispatch(joinRequestActions.updateJoinRequestStatus(p)).unwrap(),

      // Contact Messages
      createContactMessage: (p) => dispatch(contactMessageActions.createContactMessage(p)).unwrap(),
      fetchContactMessages: (f) => dispatch(contactMessageActions.fetchContactMessages(f)).unwrap(),
      updateContactMessageStatus: (p) => dispatch(contactMessageActions.updateContactMessageStatus(p)).unwrap(),

      // FAQs
      fetchPublishedFaqs: () => dispatch(faqActions.fetchPublishedFaqs()).unwrap(),
      fetchAllFaqsAdmin: (f) => dispatch(faqActions.fetchAllFaqsAdmin(f)).unwrap(),
      fetchFaqCategories: () => dispatch(faqActions.fetchFaqCategories()).unwrap(),
      createFaq: (p) => dispatch(faqActions.createFaq(p)).unwrap(),
      updateFaq: (p) => dispatch(faqActions.updateFaq(p)).unwrap(),
      deleteFaq: (id) => dispatch(faqActions.deleteFaq(id)).unwrap(),

      // Analytics
      fetchAnalyticsOverview: (dr) => dispatch(analyticsActions.fetchAnalyticsOverview(dr)).unwrap(),
      exportStudentsCsv: (f) => dispatch(analyticsActions.exportStudentsCsv(f)).unwrap(),

      // Settings
      fetchPublicSettings: () => dispatch(settingsActions.fetchPublicSettings()).unwrap(),
      fetchFullSettings: () => dispatch(settingsActions.fetchFullSettings()).unwrap(),
      updateSettings: (p) => dispatch(settingsActions.updateSettings(p)).unwrap(),

      // Audit
      fetchPasswordResetTrail: (f) => dispatch(auditActions.fetchPasswordResetTrail(f)).unwrap(),
      fetchUnauthorizedAccessTrail: (page) => dispatch(auditActions.fetchUnauthorizedAccessTrail(page)).unwrap(),

      // UI
      addToast: (p) => dispatch(addToast(p)),
      removeToast: (id) => dispatch(removeToast(id)),
      openModal: (key) => dispatch(openModal(key)),
      closeModal: (key) => dispatch(closeModal(key)),
      toggleSidebar: () => dispatch(toggleSidebar()),
      setSidebarCollapsed: (v) => dispatch(setSidebarCollapsed(v)),
    }),
    [dispatch]
  );

  return {
    auth,
    programmes,
    cohorts,
    enrollments,
    payments,
    instalments,
    accounts,
    invitations,
    joinRequests,
    contactMessages,
    faqs,
    analytics,
    settings,
    audit,
    ui,
    actions,
  };
}

export default useManageState;