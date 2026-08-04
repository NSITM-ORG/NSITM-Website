/**
 * src/components/panel/CohortForm.jsx (REPLACES the F10 version)
 *
 * Changes from F10:
 *   - deliveryFormat options now include Hybrid
 *   - enrollmentOpen checkbox REMOVED (no longer a settable field — F13
 *     converted it to a computed backend virtual)
 *   - enrollmentStartDate / enrollmentEndDate ADDED (required, drives the
 *     computed enrollmentOpen server-side)
 *   - Field-locking: when isEdit AND initialData.status === 'active',
 *     every field except `status` renders disabled — enforces the
 *     client's cohort-locking rule visually, backed by the server-side
 *     guard from F13's assertCohortFieldsEditable
 */

import { useState, useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { DELIVERY_FORMAT_LABELS } from '../../utils/constants';
import { Lock } from 'lucide-react';

const emptyForm = {
  name: '', programme: '', startDate: '', endDate: '',
  enrollmentStartDate: '', enrollmentEndDate: '',
  deliveryFormat: '', whatsappGroupLink: '', maxCapacity: '', status: 'upcoming',
};

const DELIVERY_OPTIONS = Object.entries(DELIVERY_FORMAT_LABELS).map(([value, label]) => ({ value, label }));

export function CohortForm({ initialData, onSubmit, submitting, submitLabel = 'Save Cohort', isEdit = false }) {
  const { programmes, actions } = useManageState();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isLocked = isEdit && initialData?.status === 'active';

  useEffect(() => {
    if (programmes.adminList.length === 0) actions.fetchAdminProgrammes({ limit: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialData) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: initialData.name || '',
      programme: initialData.programme?.id || initialData.programme || '',
      startDate: initialData.startDate?.split('T')[0] || '',
      endDate: initialData.endDate?.split('T')[0] || '',
      enrollmentStartDate: initialData.enrollmentStartDate?.split('T')[0] || '',
      enrollmentEndDate: initialData.enrollmentEndDate?.split('T')[0] || '',
      deliveryFormat: initialData.deliveryFormat || '',
      whatsappGroupLink: initialData.whatsappGroupLink || '',
      maxCapacity: initialData.maxCapacity || '',
      status: initialData.status || 'upcoming',
    });
  }, [initialData]);

  const handleField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!isLocked) {
      if (!form.name.trim()) errs.name = 'Cohort name is required.';
      if (!isEdit && !form.programme) errs.programme = 'Programme is required.';
      if (!form.startDate) errs.startDate = 'Start date is required.';
      if (!form.endDate) errs.endDate = 'End date is required.';
      if (form.startDate && form.endDate && form.endDate <= form.startDate) errs.endDate = 'End date must be after start date.';
      if (!form.enrollmentStartDate) errs.enrollmentStartDate = 'Enrollment start date is required.';
      if (!form.enrollmentEndDate) errs.enrollmentEndDate = 'Enrollment end date is required.';
      if (form.enrollmentStartDate && form.enrollmentEndDate && form.enrollmentEndDate <= form.enrollmentStartDate) {
        errs.enrollmentEndDate = 'Enrollment end date must be after enrollment start date.';
      }
      if (!form.deliveryFormat) errs.deliveryFormat = 'Delivery format is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLocked) {
      // Active cohort — only status is submittable
      onSubmit({ status: form.status });
      return;
    }

    onSubmit({
      name: form.name.trim(),
      ...(isEdit ? {} : { programme: form.programme }),
      startDate: form.startDate,
      endDate: form.endDate,
      enrollmentStartDate: form.enrollmentStartDate,
      enrollmentEndDate: form.enrollmentEndDate,
      deliveryFormat: form.deliveryFormat,
      whatsappGroupLink: form.whatsappGroupLink.trim() || undefined,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
      ...(isEdit ? { status: form.status } : {}),
    });
  };

  const programmeOptions = programmes.adminList.map((p) => ({ value: p.id, label: p.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isLocked && (
        <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <Lock size={18} className="mt-0.5 shrink-0" />
          This cohort is currently <strong>active</strong>. Only its status can be changed — every other
          field is locked until it moves to Completed.
        </div>
      )}

      <FormField label="Cohort Name" value={form.name} onChange={(v) => handleField('name', v)} error={errors.name} placeholder="e.g. June 2026 — Online" disabled={isLocked} required={!isLocked} />

      {!isEdit ? (
        <FormField
          type="select"
          label="Programme"
          options={programmeOptions}
          value={form.programme}
          onChange={(v) => handleField('programme', v)}
          error={errors.programme}
          required
        />
      ) : (
        <FormField
          type="select"
          label="Programme"
          options={programmeOptions}
          value={form.programme}
          onChange={() => {}}
          disabled
          hint={isLocked ? 'Locked while active.' : 'Programme cannot be changed after creation.'}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField type="date" label="Start Date" value={form.startDate} onChange={(v) => handleField('startDate', v)} error={errors.startDate} placeholder="YYYY-MM-DD" disabled={isLocked} required={!isLocked} />
        <FormField type="date" label="End Date" value={form.endDate} onChange={(v) => handleField('endDate', v)} error={errors.endDate} placeholder="YYYY-MM-DD" disabled={isLocked} required={!isLocked} />
      </div>

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-text-primary">Enrollment Window</legend>
        <p className="mb-3 text-xs text-text-secondary">
          The public "Enroll Now" button is shown automatically only within this date range, while the cohort is Active.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField type="date" label="Enrollment Opens" value={form.enrollmentStartDate} onChange={(v) => handleField('enrollmentStartDate', v)} error={errors.enrollmentStartDate} placeholder="YYYY-MM-DD" disabled={isLocked} required={!isLocked} />
          <FormField type="date" label="Enrollment Closes" value={form.enrollmentEndDate} onChange={(v) => handleField('enrollmentEndDate', v)} error={errors.enrollmentEndDate} placeholder="YYYY-MM-DD" disabled={isLocked} required={!isLocked} />
        </div>
      </fieldset>

      <FormField
        type="radio-group"
        label="Delivery Format"
        options={DELIVERY_OPTIONS}
        value={form.deliveryFormat}
        onChange={(v) => handleField('deliveryFormat', v)}
        error={errors.deliveryFormat}
        disabled={isLocked}
        required={!isLocked}
      />

      <FormField label="WhatsApp Group Link" value={form.whatsappGroupLink} onChange={(v) => handleField('whatsappGroupLink', v)} hint="Set before first payment confirmation" disabled={isLocked} />
      <FormField type="number" label="Max Capacity" value={form.maxCapacity} onChange={(v) => handleField('maxCapacity', v)} hint="Optional — leave blank for unlimited" disabled={isLocked} />

      <FormField
        type="select"
        label="Status"
        options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }]}
        value={form.status}
        onChange={(v) => handleField('status', v)}
        hint="Status can always be changed, even while the cohort is active."
      />

      <Button type="submit" loading={submitting} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}

export default CohortForm;