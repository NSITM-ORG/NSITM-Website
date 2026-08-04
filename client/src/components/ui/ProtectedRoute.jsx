/**
 * ProtectedRoute — reads a single generic `access` value
 * ('allow' | 'guest' | 'admin' | 'super-admin') off the matched route.
 *
 * 'allow'  — Public site pages. Zero dependency on auth state, zero
 *            network calls (F12 fix — untouched, still holds).
 *
 * 'guest'  — Login/register/forgot-password/reset-password pages.
 *            If the session check confirms the visitor IS authenticated,
 *            they are silently redirected (no render of the auth form,
 *            ever) to wherever they came from, or a sensible default
 *            panel page. If not authenticated, the page renders normally.
 *
 * 'admin' / 'super-admin' — Protected panel pages. Per client
 *            instruction, unauthorized access (not logged in, OR wrong
 *            role) must be fully INVISIBLE — no redirect (which would
 *            itself prove the route exists), no "Access Denied" notice
 *            (same problem). Instead, the exact same NotFoundPage used
 *            for genuinely nonexistent routes is rendered IN PLACE, at
 *            the same URL, with no navigation event. An unauthorized
 *            visitor to /admin/dashboard sees literally the same thing
 *            they'd see at /this-route-does-not-exist.
 *
 * ZERO-FLASH GUARANTEE: while the async session check is in flight
 * (bootstrapped === false), this renders ONLY <AppPreloader/> — a
 * neutral, branded loading state that reveals nothing about the
 * destination. The moment the check resolves, exactly ONE final render
 * happens: the real page, a redirect, or the 404 — never more than one,
 * never the wrong one first.
 */

import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AppPreloader } from "./Preloader";
import NotFoundPage from "../../pages/NotFoundPage";

export function ProtectedRoute({ access, children }) {
  const {
    isAuthenticated,
    bootstrapped,
    isAdminOrAbove,
    isSuperAdmin,
    ensureSessionChecked,
  } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (access !== "allow") ensureSessionChecked();
  }, [access, ensureSessionChecked]);

  // Public site pages — no auth dependency whatsoever.
  if (access === "allow") return children;

  // Session check still in flight — neutral loader only, nothing else.
  if (!bootstrapped) return <AppPreloader />;

  // ── Guest-only pages (login / register / forgot / reset password) ──
  if (access === "guest") {
    if (isAuthenticated) {
      const defaultTarget = isSuperAdmin
        ? "/superadmin/programmes"
        : "/admin/dashboard";
      return <Navigate to={location.state?.from || defaultTarget} replace />;
    }
    return children;
  }

  // ── Protected panel pages — fully invisible on any failure ─────────
  if (!isAuthenticated) return <NotFoundPage />;
  if (access === "admin" && !isAdminOrAbove) return <NotFoundPage />;
  if (access === "super-admin" && !isSuperAdmin) return <NotFoundPage />;

  return children;
}

export default ProtectedRoute;
