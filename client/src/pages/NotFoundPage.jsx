/**
 * NotFoundPage — standalone 404 (no SiteLayout/PanelLayout wrapper).
 * Offers a context-aware primary action based on the attempted URL
 * prefix, per the locked plan's Section 11 spec.
 */

import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export function NotFoundPage() {
  const location = useLocation();
  useSEO({ title: 'Page Not Found' });

  const isSuperAdminPath = location.pathname.startsWith('/superadmin');
  const isAdminPath = location.pathname.startsWith('/admin');

  const primaryLink = isSuperAdminPath
    ? { to: '/superadmin/login', label: 'Go to Super Admin Login' }
    : isAdminPath
    ? { to: '/admin/login', label: 'Go to Admin Login' }
    : { to: '/', label: 'Go to Homepage' };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Compass size={48} className="text-text-secondary" />
      <h1 className="font-heading text-3xl font-bold text-text-primary">404</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        The page <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist.
      </p>
      <Link
        to={primaryLink.to}
        className="mt-2 rounded-sm bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-90"
      >
        {primaryLink.label}
      </Link>
    </div>
  );
}

export default NotFoundPage;