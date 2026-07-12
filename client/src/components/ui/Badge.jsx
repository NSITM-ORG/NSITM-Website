/**
 * Badge — colour-coded status pill. Primary use: payment/instalment
 * status badges (grey/yellow/green/red) per FRD FR-03.2, but generalized
 * for any labeled status chip in the app (e.g. FAQ Published/Draft).
 */

const COLOR_CLASSES = {
  grey: 'bg-surface text-text-secondary',
  yellow: 'bg-warning/15 text-warning',
  green: 'bg-success/15 text-success',
  red: 'bg-error/15 text-error',
  blue: 'bg-info/15 text-info',
  primary: 'bg-primary/15 text-primary',
};

export function Badge({ color = 'grey', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;