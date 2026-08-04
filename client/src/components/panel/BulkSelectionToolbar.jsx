/**
 * src/components/panel/BulkSelectionToolbar.jsx
 *
 * BulkSelectionToolbar — the "select all" header checkbox + floating
 * action bar shown once ≥1 row is selected, shared by Programme and
 * Cohort management tables.
 */

import { Layers } from 'lucide-react';
import { Button } from '../ui/Button';

export function BulkSelectAllCheckbox({ allSelected, onToggleAll }) {
  return (
    <input
      type="checkbox"
      checked={allSelected}
      onChange={onToggleAll}
      className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
    />
  );
}

export function BulkRowCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
    />
  );
}

export function BulkActionBar({ selectedCount, onOpenDialog, onClearSelection }) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-medium text-primary">
        <Layers size={16} /> {selectedCount} selected
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onClearSelection}>
          Clear
        </Button>
        <Button size="sm" onClick={onOpenDialog}>
          Bulk Actions
        </Button>
      </div>
    </div>
  );
}

export default { BulkSelectAllCheckbox, BulkRowCheckbox, BulkActionBar };