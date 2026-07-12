/**
 * ProtectedRoute — reads a single generic `access` value ('allow' |
 * 'admin' | 'super-admin') off the matched route, per build instruction
 * #16 ("centralize page authorization"). No per-route role arrays
 * hardcoded anywhere else in the app — this is the ONE place access
 * logic lives.
 *
 * BEHAVIOR:
 *   - Waits for auth.bootstrapped before deciding anything (prevents a
 *     flash-redirect to /login while the initial getMe() call is still
 *     in flight on page refresh).
 *   - 'admin'      → allows role admin OR super_admin
 *   - 'super-admin'→ allows role super_admin only; an authenticated
 *     Admin hitting a Super-Admin-only route sees an inline 403 message
 *     (not a redirect) — this mirrors the backend's actual behavior
 *     (403 Forbidden) rather than silently bouncing them, and keeps the
 *     URL visible for debugging exactly as specified in the earlier
 *     locked plan.
 *   - Unauthenticated on a protected route → redirect to the correct
 *     login page based on the route's own namespace (admin vs superadmin),
 *     preserving the originally-requested path via `state.from` so the
 *     login page can redirect back after success.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { AppPreloader } from './Preloader.jsx';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ access, children }) {
  const { isAuthenticated, bootstrapped, isAdmin, isSuperAdmin, isAdminOrAbove } = useAuth();
  const location = useLocation();

  if (access === 'allow') return children;

  if (!bootstrapped) return <AppPreloader />;

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (access === 'admin' && !isAdminOrAbove) {
    return <ForbiddenNotice />;
  }

  if (access === 'super-admin' && !isSuperAdmin) {
    return <ForbiddenNotice />;
  }

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