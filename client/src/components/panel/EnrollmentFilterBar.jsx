/**
 * EnrollmentFilterBar — shared filter controls for EnrollmentsPage,
 * NotPaidPage, and PendingReviewsPage (each pre-applies its own status
 * filter and hides that specific control, per `hideStatusFilter`).
 * Collapses to a toggleable panel on mobile, per the locked plan.
 */

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { FormField } from '../ui/FormField.jsx';
import { Button } from '../ui/Button.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'not_paid', label: 'Not Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
];

export function EnrollmentFilterBar({ filters, onChange, onClear, hideStatusFilter = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const body = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <FormField
        placeholder="Search name or email"
        value={filters.search}
        onChange={(v) => onChange({ search: v })}
      />
      {!hideStatusFilter && (
        <FormField
          type="select"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => onChange({ status: v })}
        />
      )}
      <FormField type="text" placeholder="From date (YYYY-MM-DD)" value={filters.fromDate} onChange={(v) => onChange({ fromDate: v })} />
      <FormField type="text" placeholder="To date (YYYY-MM-DD)" value={filters.toDate} onChange={(v) => onChange({ toDate: v })} />
      <Button variant="outline" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="mb-5 rounded-md border border-border bg-surface-elevated p-4">
      <button
        className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary lg:hidden"
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X size={16} /> : <SlidersHorizontal size={16} />} Filters
      </button>
      <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>{body}</div>
    </div>
  );
}

export default EnrollmentFilterBar;