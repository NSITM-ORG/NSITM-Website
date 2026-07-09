/**
 * useAuth — Role/session convenience layer built on top of useManageState.
 *
 * Handles:
 *   - Session bootstrap: on first mount anywhere the hook is used app-wide
 *     (actually invoked once, at the App root — see App.jsx in Batch F5),
 *     calls getMe() to re-hydrate from the httpOnly cookie rather than
 *     trusting any client-side persisted state (there is none — see
 *     store.js docstring).
 *   - Listens for the 'nsitm:session-expired' DOM event dispatched by
 *     httpClient.js on any 401 and reacts by clearing the user + firing
 *     a caller-supplied redirect callback, decoupling httpClient (which
 *     cannot import React Router) from navigation.
 *   - Exposes hasRole()/isAdmin/isSuperAdmin booleans for ProtectedRoute
 *     and conditional UI (e.g. Super-Admin-only sidebar items).
 */

import { useCallback, useEffect } from 'react';
import { useManageState } from './useManageState';

export function useAuth() {
  const { auth, actions } = useManageState();

  const bootstrapSession = useCallback(
    async (roleHint) => {
      try {
        await actions.getMe(roleHint);
      } catch {
        // Not logged in — expected on first visit / after logout. No-op.
      }
    },
    [actions]
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      actions.clearUser();
      window.dispatchEvent(new CustomEvent('nsitm:redirect-to-login'));
    };
    window.addEventListener('nsitm:session-expired', handleSessionExpired);
    return () => window.removeEventListener('nsitm:session-expired', handleSessionExpired);
  }, [actions]);

  const hasRole = useCallback(
    (...roles) => !!auth.user && roles.includes(auth.user.role),
    [auth.user]
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    bootstrapped: auth.bootstrapped,
    loading: auth.loading,
    submitting: auth.submitting,
    error: auth.error,
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    isAdminOrAbove: hasRole('admin', 'super_admin'),
    hasRole,
    bootstrapSession,
    ...actions, // exposes adminLogin, superAdminLogin, logout, etc. directly
  };
}

export default useAuth;