/**
 * MetricCard — dashboard overview stat card. Optionally clickable
 * (navigates to a pre-filtered list view), per FRD FR-04.2 ("each
 * metric card is clickable and navigates to the filtered list view").
 */

import { Link } from 'react-router-dom';

export function MetricCard({ label, value, icon: Icon, to, color = 'primary' }) {
  const COLOR_CLASSES = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    grey: 'bg-surface text-text-secondary',
  };

  const ACCENT_BORDERS = {
    primary: 'border-t-primary',
    secondary: 'border-t-secondary',
    warning: 'border-t-warning',
    error: 'border-t-error',
    grey: 'border-t-border',
  };

  const content = (
    <div className={`rounded-2xl border border-border/80 border-t-4 ${ACCENT_BORDERS[color] || 'border-t-primary'} bg-surface-elevated/90 backdrop-blur-sm p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lift hover:border-primary/40`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{label}</span>
        {Icon && (
          <div className={`rounded-xl p-2.5 shadow-xs ${COLOR_CLASSES[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <p className="font-heading text-3xl font-extrabold text-text-primary tracking-tight">{value ?? '—'}</p>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export default MetricCard;