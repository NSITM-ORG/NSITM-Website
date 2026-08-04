/**
 * PanelLayout — Sidebar + TopNav + page content. Used by all Admin and
 * Super Admin pages. Page title for TopNav comes from the matched
 * route's `handle.title` (set via route.meta.title in the route arrays).
 */

import { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { Sidebar } from '../components/panel/Sidebar';
import { TopNav } from '../components/panel/TopNav';
import { useManageState } from '../hooks/useManageState';
import { useAuth } from "../hooks/useAuth";


export function PanelLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { ui } = useManageState();
  const { bootstrapped, isAuthenticated } = useAuth();
  const matches = useMatches();
  const title = matches[matches.length - 1]?.handle?.title || 'Dashboard';

  // Sidebar/TopNav chrome only ever renders once auth is CONFIRMED.
  // While the session check is still resolving, or once it resolves to
  // "not authenticated," this renders a bare <Outlet/> with no panel
  // chrome at all — the inner route's own ProtectedRoute then shows
  // either the AppPreloader (still checking) or a full, chrome-free
  // NotFoundPage (unauthorized) directly inside it. This is what makes
  // an unauthorized /admin/* visit indistinguishable from a genuinely
  // nonexistent route — the sidebar/topnav never leak that an admin
  // area exists at all.
  const showChrome = bootstrapped && isAuthenticated;

  if (!showChrome) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className={`transition-all duration-200 ${ui.sidebarCollapsed ? 'lg:pl-17.5' : 'lg:pl-60'}`}>
        <TopNav title={title} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default PanelLayout;