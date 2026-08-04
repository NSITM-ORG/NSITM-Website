/**
 * App — Root composition.
 *
 * ISSUE 1 FIX: The eager bootstrapSession() call and the app-wide
 * `if (!bootstrapped) return <AppPreloader/>` gate are BOTH REMOVED from
 * this file. The site now renders immediately on every load, regardless
 * of auth state — public pages are never blocked behind, delayed by, or
 * dependent on a session check. Session bootstrapping is now entirely
 * owned by ProtectedRoute (see useAuth.js / ProtectedRoute.jsx), firing
 * only when a protected route is actually visited.
 *
 * The 'nsitm:redirect-to-login' listener remains — it's the bridge from
 * plain DOM events (dispatched by useAuth on session-expiry, useLogout
 * on explicit logout, and now also the self-service password-change flow)
 * back into React Router navigation.
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { useTheme } from './hooks/useTheme';
import { ToastContainer } from './components/ui/Toast';
import { LogoutModal } from './components/ui/LogoutModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  useTheme(); // applies persisted theme class to <html> on mount — independent of auth

  useEffect(() => {
    const handleRedirect = () => {
      const target = window.location.pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login';
      router.navigate(target);
    };
    window.addEventListener('nsitm:redirect-to-login', handleRedirect);
    return () => window.removeEventListener('nsitm:redirect-to-login', handleRedirect);
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
      <LogoutModal />
    </ErrorBoundary>
  );
}

export default App;