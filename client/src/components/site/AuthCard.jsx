/**
 * AuthCard — shared visual shell for every standalone auth page (login,
 * forgot/reset password, registration). Used instead of duplicating the
 * centered-card markup across 8 separate page files.
 */

import { Link } from 'react-router-dom';

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src="/nsitm-logo.svg" alt="Nextserve" className="h-10 w-10" />
          <span className="font-heading text-xl font-bold text-primary">Nextserve</span>
        </Link>

        <div className="rounded-lg border border-border bg-surface-elevated p-6 shadow-elevated sm:p-8">
          <h1 className="mb-1 text-center font-heading text-xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="mb-6 text-center text-sm text-text-secondary">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm text-text-secondary">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthCard;