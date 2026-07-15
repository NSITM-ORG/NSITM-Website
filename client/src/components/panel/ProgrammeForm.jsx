/**
 * ProgrammeForm — shared form body for ProgrammeCreatePage and
 * ProgrammeEditPage. Handles the fee structure's nested shape (full
 * payment + optional instalment total/breakdown) with a live-calculated
 * 40/30/30 split suggestion that Super Admin can override per instalment.
 */

import { useState, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { PROGRAMME_CATEGORIES, PROGRAMME_CATEGORY_LABELS, PROGRAMME_STATUS } from '../../utils/constants';

const CATEGORY_OPTIONS = Object.entries(PROGRAMME_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
  { value: PROGRAMME_STATUS.COMING_SOON, label: 'Coming Soon' },
  { value: PROGRAMME_STATUS.ACTIVE, label: 'Active' },
];

const emptyForm = {
  name: '',
  category: '',
  subCategory: '',
  description: '',
  duration: '',
  prerequisites: '',
  status: PROGRAMME_STATUS.COMING_SOON,
  full: '',
  instalmentTotal: '',
  instalment1: '',
  instalment2: '',
  instalment3: '',
};

export function ProgrammeForm({ initialData, onSubmit, submitting, submitLabel = 'Save Programme' }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialData) return;
    const breakdown = initialData.fees?.instalment?.breakdown || [];
    setForm({
      name: initialData.name || '',
      category: initialData.category || '',
      subCategory: initialData.subCategory || '',
      description: initialData.description || '',
      duration: initialData.duration || '',
      prerequisites: initialData.prerequisites || '',
      status: initialData.status || PROGRAMME_STATUS.COMING_SOON,
      full: initialData.fees?.full ?? '',
      instalmentTotal: initialData.fees?.instalment?.total ?? '',
      instalment1: breakdown.find((b) => b.instalmentNumber === 1)?.amount ?? '',
      instalment2: breakdown.find((b) => b.instalmentNumber === 2)?.amount ?? '',
      instalment3: breakdown.find((b) => b.instalmentNumber === 3)?.amount ?? '',
    });
  }, [initialData]);

  // Auto-suggest a 40/30/30 split whenever instalmentTotal changes and
  // the individual instalment fields are still empty (doesn't overwrite
  // manual edits).
  useEffect(() => {
    if (!form.instalmentTotal || form.instalment1) return;
    const total = Number(form.instalmentTotal);
    const first = Math.round(total * 0.4);
    const second = Math.round(total * 0.3);
    const third = total - first - second;
    setForm((f) => ({ ...f, instalment1: first, instalment2: second, instalment3: third }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.instalmentTotal]);

  const handleField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Programme name is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.description || form.description.length < 20) errs.description = 'Description must be at least 20 characters.';
    if (!form.duration.trim()) errs.duration = 'Duration is required.';
    if (!form.full) errs.full = 'Full payment fee is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const hasInstalment = !!form.instalmentTotal;
    onSubmit({
      name: form.name.trim(),
      category: form.category,
      subCategory: form.category === PROGRAMME_CATEGORIES.SHORT_TERM ? form.subCategory.trim() || undefined : undefined,
      description: form.description.trim(),
      duration: form.duration.trim(),
      prerequisites: form.prerequisites.trim() || undefined,
      status: form.status,
      fees: {
        full: Number(form.full),
        instalment: hasInstalment
          ? {
              total: Number(form.instalmentTotal),
              breakdown: [
                { instalmentNumber: 1, amount: Number(form.instalment1), dueDayOffset: 0 },
                { instalmentNumber: 2, amount: Number(form.instalment2), dueDayOffset: 30 },
                { instalmentNumber: 3, amount: Number(form.instalment3), dueDayOffset: 60 },
              ],
            }
          : { total: null, breakdown: [] },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Programme Name" value={form.name} onChange={(v) => handleField('name', v)} error={errors.name} required />
        <FormField
          type="select"
          label="Category"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(v) => handleField('category', v)}
          error={errors.category}
          required
        />
      </div>

      {form.category === PROGRAMME_CATEGORIES.SHORT_TERM && (
        <FormField
          label="Sub-Category"
          value={form.subCategory}
          onChange={(v) => handleField('subCategory', v)}
          hint="e.g. Microsoft Office Suites, Image/Video Editing"
        />
      )}

      <FormField
        type="textarea"
        label="Description"
        value={form.description}
        onChange={(v) => handleField('description', v)}
        error={errors.description}
        rows={4}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Duration" value={form.duration} onChange={(v) => handleField('duration', v)} error={errors.duration} placeholder="e.g. 6 months" required />
        <FormField
          type="select"
          label="Cohort Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(v) => handleField('status', v)}
        />
      </div>

      <FormField
        label="Prerequisites"
        value={form.prerequisites}
        onChange={(v) => handleField('prerequisites', v)}
        hint="Optional"
      />

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium text-text-primary">Fees</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField type="number" label="Full Payment (₦)" value={form.full} onChange={(v) => handleField('full', v)} error={errors.full} required />
          <FormField type="number" label="Instalment Total (₦)" value={form.instalmentTotal} onChange={(v) => handleField('instalmentTotal', v)} hint="Leave blank to disable instalment option" />
        </div>
        {form.instalmentTotal && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField type="number" label="Instalment 1 (₦)" value={form.instalment1} onChange={(v) => handleField('instalment1', v)} />
            <FormField type="number" label="Instalment 2 (₦)" value={form.instalment2} onChange={(v) => handleField('instalment2', v)} />
            <FormField type="number" label="Instalment 3 (₦)" value={form.instalment3} onChange={(v) => handleField('instalment3', v)} />
          </div>
        )}
      </fieldset>

      <Button type="submit" loading={submitting} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}

export default ProgrammeForm;