/**
 * Redux Store Configuration
 *
 * Combines all 15 domain slices. This file — along with the slices
 * themselves — is imported ONLY by useManageState.js (Batch F3).
 * Components must never import a slice or this store directly; see the
 * project convention documented in useManageState.js.
 *
 * No persistence middleware is used. Session state survives page
 * refreshes via the httpOnly cookie itself (the backend re-validates it
 * on every request) — authSlice re-hydrates by calling GET .../auth/me
 * once on app mount (see useAuth.js), rather than trusting stale
 * client-side state after a refresh.
 */

import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import programmeReducer from './slices/programmeSlice';
import cohortReducer from './slices/cohortSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import paymentReducer from './slices/paymentSlice';
import instalmentReducer from './slices/instalmentSlice';
import accountReducer from './slices/accountSlice';
import invitationReducer from './slices/invitationSlice';
import joinRequestReducer from './slices/joinRequestSlice';
// import contactMessageReducer from './slices/contactMessageSlice';
import faqReducer from './slices/faqSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';
import auditReducer from './slices/auditSlice';
import uiReducer from './slices/uiSlice';
import legalPageReducer from './slices/legalPageSlice';
import { toastMiddleware } from './toastMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    programmes: programmeReducer,
    cohorts: cohortReducer,
    enrollments: enrollmentReducer,
    payments: paymentReducer,
    instalments: instalmentReducer,
    accounts: accountReducer,
    invitations: invitationReducer,
    joinRequests: joinRequestReducer,
    // contactMessages: contactMessageReducer,
    faqs: faqReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    audit: auditReducer,
    ui: uiReducer,
    legalPages: legalPageReducer,
  },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(toastMiddleware),
  devTools: import.meta.env.VITE_APP_ENV !== 'production',
});

export default store;