/**
 * CohortForm — shared form body for CohortCreatePage/CohortEditPage.
 * Programme dropdown pulls from the Super Admin programme list (fetched
 * on mount if not already loaded).
 */

import { useState, useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { DELIVERY_FORMATS } from '../../utils/constants';

const emptyForm = {
  name: '', programme: '', startDate: '', endDate: '', deliveryFormat: '',
  whatsappGroupLink: '', maxCapacity: '', status: 'upcoming', enrollmentOpen: false,
};

export function CohortForm({ initialData, onSubmit, submitting, submitLabel = 'Save Cohort', isEdit = false }) {
  const { programmes, actions } = useManageState();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (programmes.adminList.length === 0) actions.fetchAdminProgrammes({ limit: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      name: initialData.name || '',
      programme: initialData.programme?.id || initialData.programme || '',
      startDate: initialData.startDate?.split('T')[0] || '',
      endDate: initialData.endDate?.split('T')[0] || '',
      deliveryFormat: initialData.deliveryFormat || '',
      whatsappGroupLink: initialData.whatsappGroupLink || '',
      maxCapacity: initialData.maxCapacity || '',
      status: initialData.status || 'upcoming',
      enrollmentOpen: !!initialData.enrollmentOpen,
    });
  }, [initialData]);

  const handleField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Cohort name is required.';
    if (!isEdit && !form.programme) errs.programme = 'Programme is required.';
    if (!form.startDate) errs.startDate = 'Start date is required.';
    if (!form.endDate) errs.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate <= form.startDate) errs.endDate = 'End date must be after start date.';
    if (!form.deliveryFormat) errs.deliveryFormat = 'Delivery format is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      ...(isEdit ? {} : { programme: form.programme }),
      startDate: form.startDate,
      endDate: form.endDate,
      deliveryFormat: form.deliveryFormat,
      whatsappGroupLink: form.whatsappGroupLink.trim() || undefined,
      maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
      ...(isEdit ? { status: form.status, enrollmentOpen: form.enrollmentOpen } : {}),
    });
  };

  const programmeOptions = programmes.adminList.map((p) => ({ value: p.id, label: p.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Cohort Name" value={form.name} onChange={(v) => handleField('name', v)} error={errors.name} placeholder="e.g. June 2026 — Online" required />

      {!isEdit && (
        <FormField
          type="select"
          label="Programme"
          options={programmeOptions}
          value={form.programme}
          onChange={(v) => handleField('programme', v)}
          error={errors.programme}
          required
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField type="date" label="Start Date" value={form.startDate} onChange={(v) => handleField('startDate', v)} error={errors.startDate} placeholder="YYYY-MM-DD" required />
        <FormField type="date" label="End Date" value={form.endDate} onChange={(v) => handleField('endDate', v)} error={errors.endDate} placeholder="YYYY-MM-DD" required />
      </div>

      <FormField
        type="radio-group"
        label="Delivery Format"
        options={[{ value: DELIVERY_FORMATS.ONLINE, label: 'Online' }, { value: DELIVERY_FORMATS.IN_PERSON, label: 'In-Person' }]}
        value={form.deliveryFormat}
        onChange={(v) => handleField('deliveryFormat', v)}
        error={errors.deliveryFormat}
        required
      />

      <FormField label="WhatsApp Group Link" value={form.whatsappGroupLink} onChange={(v) => handleField('whatsappGroupLink', v)} hint="Set before first payment confirmation" />
      <FormField type="number" label="Max Capacity" value={form.maxCapacity} onChange={(v) => handleField('maxCapacity', v)} hint="Optional — leave blank for unlimited" />

      {isEdit && (
        <>
          <FormField
            type="select"
            label="Status"
            options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }]}
            value={form.status}
            onChange={(v) => handleField('status', v)}
          />
          <FormField type="checkbox" label="Enrollment Open" value={form.enrollmentOpen} onChange={(v) => handleField('enrollmentOpen', v)} />
        </>
      )}

      <Button type="submit" loading={submitting} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}

export default CohortForm;