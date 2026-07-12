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

  const content = (
    <div className="rounded-md border border-border bg-surface-elevated p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {Icon && (
          <div className={`rounded-full p-2 ${COLOR_CLASSES[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="font-heading text-2xl font-bold text-text-primary">{value ?? '—'}</p>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export default MetricCard;