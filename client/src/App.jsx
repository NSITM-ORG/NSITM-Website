/**
 * App — Root composition. Replaces the Batch F1 placeholder.
 *
 * Responsibilities:
 *   1. Applies the persisted theme on first paint (useTheme's effect
 *      runs regardless of whether ThemeToggle is mounted on the current
 *      route, since it's invoked here unconditionally).
 *   2. Bootstraps the session ONCE on mount (useAuth().bootstrapSession)
 *      — tries both Admin and Super Admin /me endpoints in sequence so
 *      a refresh on either panel re-hydrates correctly regardless of
 *      which role is actually logged in.
 *   3. Listens for the 'nsitm:redirect-to-login' event (dispatched by
 *      useAuth on session-expiry and useLogout on explicit logout) and
 *      imperatively navigates via router.navigate() — this is the one
 *      place that bridges a plain DOM CustomEvent back into React
 *      Router, since httpClient.js and useAuth.js cannot import
 *      useNavigate() outside a component.
 *   4. Mounts the two global overlays exactly once: <ToastContainer/>
 *      and <LogoutModal/>.
 *   5. Shows <AppPreloader/> until the initial session check resolves,
 *      preventing a flash of unauthenticated UI on a hard refresh of a
 *      protected panel route.
 */

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useAuth } from './hooks/useAuth.js';
import { ToastContainer } from './components/ui/Toast.jsx';
import { LogoutModal } from './components/ui/LogoutModal.jsx';
import { AppPreloader } from './components/ui/Preloader.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  useTheme(); // applies persisted theme class to <html> on mount
  const { bootstrapSession, bootstrapped } = useAuth();

  useEffect(() => {
    // Try Admin session first, then Super Admin — whichever cookie is
    // actually present will succeed; the other silently no-ops (see
    // authSlice.getMe's rejected handler, which just marks bootstrapped).
    (async () => {
      await bootstrapSession('admin');
      const stillUnauthenticated = !router.state.location; // defensive no-op check
      if (stillUnauthenticated) await bootstrapSession('super_admin');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRedirect = () => {
      const target = window.location.pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login';
      router.navigate(target);
    };
    window.addEventListener('nsitm:redirect-to-login', handleRedirect);
    return () => window.removeEventListener('nsitm:redirect-to-login', handleRedirect);
  }, []);

  if (!bootstrapped) return <AppPreloader />;

   return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
      <LogoutModal />
    </ErrorBoundary>
  );
}

export default App;