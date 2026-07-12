/**
 * PanelLayout — Sidebar + TopNav + page content. Used by all Admin and
 * Super Admin pages. Page title for TopNav comes from the matched
 * route's `handle.title` (set via route.meta.title in the route arrays).
 */

import { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { Sidebar } from '../components/panel/Sidebar.jsx';
import { TopNav } from '../components/panel/TopNav.jsx';
import { useManageState } from '../hooks/useManageState.js';

export function PanelLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { ui } = useManageState();
  const matches = useMatches();
  const title = matches[matches.length - 1]?.handle?.title || 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <div className={`transition-all duration-200 ${ui.sidebarCollapsed ? 'lg:pl-[70px]' : 'lg:pl-60'}`}>
        <TopNav title={title} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PanelLayout;