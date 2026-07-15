/**
 * EmptyState — clean minimalist empty-state block (icon + heading +
 * muted helper text + optional primary action), per the design spec.
 * Used for empty lists everywhere: no programmes match a filter, no
 * enrollments yet, no FAQs, etc.
 */

import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-surface p-4">
        <Icon size={32} className="text-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold font-heading text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;