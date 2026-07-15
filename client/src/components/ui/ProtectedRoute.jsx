/**
 * ProtectedRoute — reads a single generic `access` value ('allow' |
 * 'admin' | 'super-admin') off the matched route.
 *
 * ISSUE 1 FIX: For access:'allow' routes, this component returns the
 * children IMMEDIATELY — before even reading auth.bootstrapped — so a
 * public page never waits on, depends on, or is influenced by any auth
 * state whatsoever. The session check is only ever triggered (via the
 * useEffect below) when a route with access !== 'allow' is rendered,
 * making the auth check fully on-demand rather than app-wide.
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppPreloader } from './Preloader';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ access, children }) {
  const { isAuthenticated, bootstrapped, isAdminOrAbove, isSuperAdmin, ensureSessionChecked } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (access !== 'allow') ensureSessionChecked();
  }, [access, ensureSessionChecked]);

  // Public routes: zero dependency on auth state, zero network calls, zero waiting.
  if (access === 'allow') return children;

  if (!bootstrapped) return <AppPreloader />;

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (access === 'admin' && !isAdminOrAbove) return <ForbiddenNotice />;
  if (access === 'super-admin' && !isSuperAdmin) return <ForbiddenNotice />;

  return children;
}

function ForbiddenNotice() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert size={48} className="text-error" />
      <h2 className="font-heading text-xl font-semibold text-text-primary">Access Denied</h2>
      <p className="max-w-sm text-sm text-text-secondary">
        You do not have permission to view this page. This action requires Super Admin access.
      </p>
    </div>
  );
}

export default ProtectedRoute;