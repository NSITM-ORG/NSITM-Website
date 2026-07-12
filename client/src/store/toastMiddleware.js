/**
 * Toast Middleware — Automatic Error Toasts on Every Rejected Thunk
 *
 * Implements the project convention (per the locked plan) that error
 * display is centralized, not hand-wired per-component. Any thunk,
 * anywhere, that rejects with an ApiError-shaped payload automatically
 * produces a toast — components don't need to remember to call
 * showToast() in a .catch() block themselves.
 *
 * Components CAN still override/suppress this per-call if needed by
 * checking the thunk's returned promise result locally (see
 * useManageState.js docstring for the pattern), but the default behavior
 * requires zero extra code.
 */

import { addToast } from './slices/uiSlice.js';

export const toastMiddleware = (storeApi) => (next) => (action) => {
  if (action.type?.endsWith('/rejected') && action.payload?.message) {
    // Skip session-expiry errors — those are handled by a redirect,
    // not a toast (see useAuth.js), to avoid a toast flashing right
    // before the user is bounced to a login page.
    const SILENT_CODES = ['NOT_AUTHENTICATED', 'SESSION_EXPIRED', 'TOKEN_INVALIDATED', 'TOKEN_EXPIRED'];
    if (!SILENT_CODES.includes(action.payload.code)) {
      storeApi.dispatch(
        addToast({ type: 'error', message: action.payload.message, duration: 5000 })
      );
    }
  }
  return next(action);
};