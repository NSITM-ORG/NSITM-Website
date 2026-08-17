/**
 * src/components/panel/BulkActionDialog.jsx
 *
 * BulkActionDialog — generic reusable bulk-edit/bulk-delete modal, per
 * client instruction ("custom modal dialog... reusable for future bulk-
 * action needs, not a one-off"). Consuming pages supply:
 *
 *   - fields: array of { name, label, type, options? } describing which
 *     bulk-editable fields to render (Programme vs Cohort pass different
 *     field sets — see wiring in each management page below)
 *   - onSubmitUpdate(updates) / onSubmitDelete() — the actual thunk calls
 *   - selectedCount — for the confirmation copy
 *
 * Two modes, switched by a tab: "Edit" and "Delete" — since both bulk
 * operations share the same "which items are selected" context, one
 * dialog covers both rather than two separate modals.
 *
 * Only fields the admin actually toggles "on" (via the per-field
 * checkbox) are included in the update payload — this prevents
 * accidentally overwriting every selected item's untouched fields with
 * an empty/default value.
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Tabs } from '../ui/Tabs';
import { AlertTriangle } from 'lucide-react';

export function BulkActionDialog({ isOpen, onClose, selectedCount, fields, onSubmitUpdate, onSubmitDelete, submitting }) {
  const [mode, setMode] = useState('edit');
  const [enabledFields, setEnabledFields] = useState({});
  const [values, setValues] = useState({});

  const toggleField = (name) => setEnabledFields((f) => ({ ...f, [name]: !f[name] }));
  const setValue = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleClose = () => {
    setMode('edit');
    setEnabledFields({});
    setValues({});
    onClose();
  };

  const handleUpdateSubmit = async () => {
    const updates = {};
    Object.entries(enabledFields).forEach(([name, isOn]) => {
      if (isOn && values[name] !== undefined && values[name] !== '') {
        updates[name] = values[name];
      }
    });
    if (Object.keys(updates).length === 0) return;
    await onSubmitUpdate(updates);
    handleClose();
  };

  const handleDeleteSubmit = async () => {
    await onSubmitDelete();
    handleClose();
  };

  const anyFieldEnabled = Object.values(enabledFields).some(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Actions (${selectedCount} selected)`}>
      <Tabs
        tabs={[{ value: 'edit', label: 'Bulk Edit' }, { value: 'delete', label: 'Bulk Delete' }]}
        activeTab={mode}
        onChange={setMode}
      />

      <div className="mt-5">
        {mode === 'edit' ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Toggle a field on to apply a new value to all {selectedCount} selected items. Untoggled fields stay unchanged.
            </p>
            {fields.map((field) => (
              <div key={field.name} className="rounded-md border border-border p-3">
                <div className="mb-2 font-medium">
                  <FormField
                    type="checkbox"
                    label={field.label}
                    value={!!enabledFields[field.name]}
                    onChange={() => toggleField(field.name)}
                  />
                </div>
                {enabledFields[field.name] && (
                  <FormField
                    type={field.type}
                    options={field.options}
                    value={values[field.name] ?? ''}
                    onChange={(v) => setValue(field.name, v)}
                    hint={field.hint}
                  />
                )}
              </div>
            ))}
            <Button onClick={handleUpdateSubmit} disabled={!anyFieldEnabled} loading={submitting} fullWidth>
              Apply to {selectedCount} Item(s)
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border border-error/30 bg-error/10 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-error" />
              <p className="text-sm text-error">
                This will attempt to delete {selectedCount} selected item(s). Items that cannot be deleted
                (e.g. active cohorts) will be automatically skipped and reported back to you.
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteSubmit} loading={submitting} fullWidth>
              Delete {selectedCount} Item(s)
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default BulkActionDialog;