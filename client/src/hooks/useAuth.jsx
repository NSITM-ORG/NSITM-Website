
/**
 * useAuth — Role/session convenience layer built on top of useManageState.
 *
 * ISSUE 1 FIX: Session bootstrapping is now LAZY. It is no longer called
 * automatically on app mount (that was the root cause of the public site
 * depending on auth state). `ensureSessionChecked()` is exposed here and
 * is called ONLY by ProtectedRoute, ONLY when a protected route (access
 * !== 'allow') is actually visited. Public site pages never trigger an
 * auth check, never show an auth-related preloader, and never make an
 * auth-related network call — full independence from login state.
 *
 * The 'nsitm:session-expired' listener remains here (unrelated to Issue
 * 1) — it only ever fires in response to an ACTUAL 401 from a protected
 * API call the app already chose to make, which can only happen while
 * the panel is in use.
 */

import { useCallback, useEffect } from 'react';
import { useManageState } from './useManageState';

export function useAuth() {
  const { auth, actions } = useManageState();

  /**
   * Triggers a session check ONLY if one hasn't already run and isn't
   * currently in flight. Safe to call from multiple ProtectedRoute
   * instances mounting simultaneously — the bootstrapped/loading guard
   * prevents duplicate calls.
   */
  const ensureSessionChecked = useCallback(() => {
    if (auth.bootstrapped || auth.loading) return;
    actions.getMe().catch(() => {});
  }, [auth.bootstrapped, auth.loading, actions]);

  useEffect(() => {
    const handleSessionExpired = () => {
      actions.clearUser();
      window.dispatchEvent(new CustomEvent('nsitm:redirect-to-login'));
    };
    window.addEventListener('nsitm:session-expired', handleSessionExpired);
    return () => window.removeEventListener('nsitm:session-expired', handleSessionExpired);
  }, [actions]);

  const hasRole = useCallback((...roles) => !!auth.user && roles.includes(auth.user.role), [auth.user]);

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
    ensureSessionChecked,
    // Issue 2 / Issue 3 state passthrough
    sessions: auth.sessions,
    sessionsLoading: auth.sessionsLoading,
    profileUpdating: auth.profileUpdating,
    passwordChanging: auth.passwordChanging,
    ...actions, // adminLogin, superAdminLogin, logout, updateOwnProfile, changeOwnPassword, fetchSessions, revokeSession, revokeOtherSessions, etc.
  };
}

export default useAuth;