/**
 * Sidebar — role-filtered panel navigation. Collapsible on desktop
 * (icon-only), drawer-style on mobile/tablet (overlay + backdrop).
 * Nav structure is the object array from the locked plan (Section 9),
 * filtered live against the current user's role via useAuth().hasRole().
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, BookOpen, Calendar, ShieldCheck,
  BarChart3, Settings, FileText, ChevronLeft, ChevronRight, X, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useManageState } from '../../hooks/useManageState';

const ICONS = {
  LayoutDashboard, Users, CreditCard, BookOpen, Calendar, ShieldCheck,
  BarChart3, Settings, FileText, MessageSquare,
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
  { key: 'contact-messages', label: 'Contact Messages', icon: 'MessageSquare', path: '/admin/contact-messages', roles: ['admin', 'super_admin'] },
  { key: 'programmes', label: 'Programmes', icon: 'BookOpen', path: '/superadmin/programmes', roles: ['super_admin'] },
  { key: 'cohorts', label: 'Cohorts', icon: 'Calendar', path: '/superadmin/cohorts', roles: ['super_admin'] },
  {
    key: 'accounts', label: 'Accounts', icon: 'ShieldCheck', path: '/superadmin/accounts', roles: ['super_admin'],
    children: [{ key: 'invitations', label: 'Invitations', path: '/superadmin/invitations' }],
  },
  { key: 'join-requests', label: 'Join Community', icon: 'Users', path: '/superadmin/join-requests', roles: ['super_admin'] },
  { key: 'faqs', label: 'FAQ Management', icon: 'FileText', path: '/superadmin/faqs', roles: ['super_admin'] },
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
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface-elevated
          transition-all duration-200
          ${collapsed ? 'w-[70px]' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          {!collapsed && <span className="font-heading font-bold text-primary">Nextserve</span>}
          <button onClick={onCloseMobile} className="text-text-secondary lg:hidden">
            <X size={20} />
          </button>
          <button
            onClick={() => actions.toggleSidebar()}
            className="hidden text-text-secondary hover:text-primary lg:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {visibleItems.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.key}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}
                  `}
                >
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
                {!collapsed &&
                  item.children?.map((child) => (
                    <NavLink
                      key={child.key}
                      to={child.path}
                      className={({ isActive }) => `
                        ml-9 block rounded-sm px-3 py-2 text-sm transition-colors
                        ${isActive ? 'text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}
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