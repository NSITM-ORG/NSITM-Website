/**
 * src/components/panel/BulkSelectionToolbar.jsx
 *
 * BulkSelectionToolbar — the "select all" header checkbox + floating
 * action bar shown once ≥1 row is selected, shared by Programme and
 * Cohort management tables.
 */

import { Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

export function BulkSelectAllCheckbox({ allSelected, onToggleAll }) {
  return (
    <FormField
      type="checkbox"
      value={allSelected}
      onChange={onToggleAll}
      inputClassName="!mt-0"
    />
  );
}

export function BulkRowCheckbox({ checked, onChange }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <FormField
        type="checkbox"
        value={checked}
        onChange={onChange}
        inputClassName="!mt-0"
      />
    </div>
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