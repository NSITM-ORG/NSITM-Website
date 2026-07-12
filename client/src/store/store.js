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

import authReducer from './slices/authSlice.js';
import programmeReducer from './slices/programmeSlice.js';
import cohortReducer from './slices/cohortSlice.js';
import enrollmentReducer from './slices/enrollmentSlice.js';
import paymentReducer from './slices/paymentSlice.js';
import instalmentReducer from './slices/instalmentSlice.js';
import accountReducer from './slices/accountSlice.js';
import invitationReducer from './slices/invitationSlice.js';
import joinRequestReducer from './slices/joinRequestSlice.js';
import contactMessageReducer from './slices/contactMessageSlice.js';
import faqReducer from './slices/faqSlice.js';
import analyticsReducer from './slices/analyticsSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import auditReducer from './slices/auditSlice.js';
import uiReducer from './slices/uiSlice.js';
import { toastMiddleware } from './toastMiddleware.js';

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
    contactMessages: contactMessageReducer,
    faqs: faqReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    audit: auditReducer,
    ui: uiReducer,
  },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(toastMiddleware),
  devTools: import.meta.env.VITE_APP_ENV !== 'production',
});

export default store;