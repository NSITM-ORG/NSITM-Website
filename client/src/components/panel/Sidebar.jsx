/**
 * Sidebar — role-filtered panel navigation. Collapsible on desktop
 * (icon-only), drawer-style on mobile/tablet (overlay + backdrop).
 * Nav structure is the object array from the locked plan (Section 9),
 * filtered live against the current user's role via useAuth().hasRole().
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, BookOpen, Calendar, ShieldCheck,
  BarChart3, Settings, FileText, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useManageState } from '../../hooks/useManageState';

const ICONS = {
  LayoutDashboard, Users, CreditCard, BookOpen, Calendar, ShieldCheck,
  BarChart3, Settings, FileText,
};

const sidebarNavigation = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin/dashboard', roles: ['admin', 'super_admin'] },
  {
    key: 'enrollments', label: 'Enrollments', icon: 'Users', path: '/admin/enrollments', roles: ['admin', 'super_admin'],
    children: [
      { key: 'not-paid', label: 'Not Paid', path: '/admin/enrollments/not-paid' },
      { key: 'pending', label: 'Pending Reviews', path: '/admin/enrollments/pending' },
    ],
  },
  { key: 'instalments', label: 'Instalments', icon: 'CreditCard', path: '/admin/instalments/outstanding', roles: ['admin', 'super_admin'] },
  { key: 'programmes', label: 'Programmes', icon: 'BookOpen', path: '/superadmin/programmes', roles: ['super_admin'] },
  { key: 'cohorts', label: 'Cohorts', icon: 'Calendar', path: '/superadmin/cohorts', roles: ['super_admin'] },
  {
    key: 'accounts', label: 'Accounts', icon: 'ShieldCheck', path: '/superadmin/accounts', roles: ['super_admin'],
    children: [{ key: 'invitations', label: 'Invitations', path: '/superadmin/invitations' }],
  },
  { key: 'join-requests', label: 'Join Community', icon: 'Users', path: '/superadmin/join-requests', roles: ['super_admin'] },
  { key: 'faqs', label: 'FAQ Management', icon: 'FileText', path: '/superadmin/faqs', roles: ['super_admin'] },
  { key: 'legal-pages', label: 'Legal Pages', icon: 'FileText', path: '/admin/legal-pages', roles: ['admin', 'super_admin'] },
  {
    key: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/superadmin/analytics', roles: ['super_admin'],
    children: [{ key: 'export', label: 'Export CSV', path: '/superadmin/export' }],
  },
  { key: 'settings', label: 'Settings', icon: 'Settings', path: '/superadmin/settings', roles: ['super_admin'] },
  {
    key: 'audit', label: 'Audit Trail', icon: 'FileText', path: '/superadmin/audit/password-resets', roles: ['super_admin'],
    children: [{ key: 'audit-unauthorized', label: 'Unauthorized Access', path: '/superadmin/audit/unauthorized-access' }],
  },
];

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { hasRole } = useAuth();
  const { ui, actions } = useManageState();
  const collapsed = ui.sidebarCollapsed;

  const visibleItems = sidebarNavigation.filter((item) => hasRole(...item.roles));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/80 bg-surface-elevated/95 backdrop-blur-md
          transition-all duration-300 shadow-md
          ${collapsed ? 'w-[74px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          {!collapsed && (
            <span className="font-heading text-lg font-extrabold text-primary tracking-wide">
              Nextserve
            </span>
          )}
          <button onClick={onCloseMobile} className="text-text-secondary hover:text-text-primary lg:hidden p-1">
            <X size={20} />
          </button>
          <button
            onClick={() => actions.toggleSidebar()}
            className="hidden text-text-secondary hover:text-primary hover:bg-surface p-1.5 rounded-full transition-colors lg:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          {visibleItems.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.key}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none shadow-xs'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
                {!collapsed &&
                  item.children?.map((child) => (
                    <NavLink
                      key={child.key}
                      to={child.path}
                      className={({ isActive }) => `
                        ml-9 my-1 block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                        ${isActive ? 'text-primary bg-primary/5 font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'}
                      `}
                    >
                      {child.label}
                    </NavLink>
                  ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;