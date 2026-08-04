/**
 * src/components/panel/ProgrammeForm.jsx (REPLACES the F10 version)
 * Adds: subDescription textarea, bulletPoints add/remove list (capped
 * at 15, live counter), and replaces the free-text duration field with
 * a number + unit select pair, range-validated per unit client-side.
 */

import { useState, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Plus, X } from 'lucide-react';
import { PROGRAMME_CATEGORIES, PROGRAMME_CATEGORY_LABELS, PROGRAMME_STATUS, DURATION_UNIT_LABELS, DURATION_UNIT_MAX } from '../../utils/constants';
import { parseDurationString, isValidDurationValue } from '../../utils/durationFormat';

const CATEGORY_OPTIONS = Object.entries(PROGRAMME_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
  { value: PROGRAMME_STATUS.COMING_SOON, label: 'Coming Soon' },
  { value: PROGRAMME_STATUS.ACTIVE, label: 'Active' },
];
const DURATION_UNIT_OPTIONS = Object.entries(DURATION_UNIT_LABELS).map(([value, label]) => ({ value, label }));
const MAX_BULLET_POINTS = 15;

const emptyForm = {
  name: '', category: '', subCategory: '', description: '', subDescription: '',
  prerequisites: '', status: PROGRAMME_STATUS.COMING_SOON,
  durationValue: '', durationUnit: 'month',
  full: '', instalmentTotal: '', instalment1: '', instalment2: '', instalment3: '',
  bulletPoints: [],
};

export function ProgrammeForm({ initialData, onSubmit, submitting, submitLabel = 'Save Programme' }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [bulletDraft, setBulletDraft] = useState('');

  useEffect(() => {
    if (!initialData) return;
    const breakdown = initialData.fees?.instalment?.breakdown || [];
    const parsedDuration = parseDurationString(initialData.duration);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: initialData.name || '',
      category: initialData.category || '',
      subCategory: initialData.subCategory || '',
      description: initialData.description || '',
      subDescription: initialData.subDescription || '',
      prerequisites: initialData.prerequisites || '',
      status: initialData.status || PROGRAMME_STATUS.COMING_SOON,
      durationValue: parsedDuration.value,
      durationUnit: parsedDuration.unit || 'month',
      full: initialData.fees?.full ?? '',
      instalmentTotal: initialData.fees?.instalment?.total ?? '',
      instalment1: breakdown.find((b) => b.instalmentNumber === 1)?.amount ?? '',
      instalment2: breakdown.find((b) => b.instalmentNumber === 2)?.amount ?? '',
      instalment3: breakdown.find((b) => b.instalmentNumber === 3)?.amount ?? '',
      bulletPoints: initialData.bulletPoints || [],
    });
  }, [initialData]);

  useEffect(() => {
    if (!form.instalmentTotal || form.instalment1) return;
    const total = Number(form.instalmentTotal);
    const first = Math.round(total * 0.4);
    const second = Math.round(total * 0.3);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({ ...f, instalment1: first, instalment2: second, instalment3: total - first - second }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.instalmentTotal]);

  const handleField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addBulletPoint = () => {
    const trimmed = bulletDraft.trim();
    if (!trimmed || form.bulletPoints.length >= MAX_BULLET_POINTS) return;
    setForm((f) => ({ ...f, bulletPoints: [...f.bulletPoints, trimmed] }));
    setBulletDraft('');
  };
  const removeBulletPoint = (index) => setForm((f) => ({ ...f, bulletPoints: f.bulletPoints.filter((_, i) => i !== index) }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Programme name is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.description || form.description.length < 20) errs.description = 'Description must be at least 20 characters.';
    if (!form.durationValue) errs.durationValue = 'Duration value is required.';
    else if (!isValidDurationValue(form.durationValue, form.durationUnit)) {
      errs.durationValue = `For ${DURATION_UNIT_LABELS[form.durationUnit]}, value must be between 1 and ${DURATION_UNIT_MAX[form.durationUnit]}.`;
    }
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
      subDescription: form.subDescription.trim() || undefined,
      prerequisites: form.prerequisites.trim() || undefined,
      status: form.status,
      durationValue: Number(form.durationValue),
      durationUnit: form.durationUnit,
      bulletPoints: form.bulletPoints,
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
        <FormField type="select" label="Category" options={CATEGORY_OPTIONS} value={form.category} onChange={(v) => handleField('category', v)} error={errors.category} required />
      </div>

      {form.category === PROGRAMME_CATEGORIES.SHORT_TERM && (
        <FormField label="Sub-Category" value={form.subCategory} onChange={(v) => handleField('subCategory', v)} hint="e.g. Microsoft Office Suites, Image/Video Editing" />
      )}

      <FormField type="textarea" label="Description" value={form.description} onChange={(v) => handleField('description', v)} error={errors.description} rows={4} required />

      <FormField
        type="textarea"
        label="Sub-Description"
        value={form.subDescription}
        onChange={(v) => handleField('subDescription', v)}
        rows={3}
        hint="Optional — a secondary block shown beneath the main description on the programme's public detail page."
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">What Students Will Learn (Bullet Points)</label>
        <div className="mb-2 flex gap-2">
          <input
            value={bulletDraft}
            onChange={(e) => setBulletDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBulletPoint(); } }}
            placeholder="Type a point and press Enter or click Add"
            disabled={form.bulletPoints.length >= MAX_BULLET_POINTS}
            className="flex-1 rounded-sm border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <Button type="button" variant="outline" icon={Plus} onClick={addBulletPoint} disabled={form.bulletPoints.length >= MAX_BULLET_POINTS}>
            Add
          </Button>
        </div>
        <p className="mb-2 text-xs text-text-secondary">{form.bulletPoints.length}/{MAX_BULLET_POINTS} points added</p>
        {form.bulletPoints.length > 0 && (
          <ul className="space-y-1.5">
            {form.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary">
                {point}
                <button type="button" onClick={() => removeBulletPoint(i)} className="text-text-secondary hover:text-error"><X size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          <FormField type="number" label="Duration" value={form.durationValue} onChange={(v) => handleField('durationValue', v)} error={errors.durationValue} placeholder="e.g. 6" required />
          <FormField type="select" label="Unit" options={DURATION_UNIT_OPTIONS} value={form.durationUnit} onChange={(v) => handleField('durationUnit', v)} />
        </div>
        <FormField type="select" label="Cohort Status" options={STATUS_OPTIONS} value={form.status} onChange={(v) => handleField('status', v)} />
      </div>

      <FormField label="Prerequisites" value={form.prerequisites} onChange={(v) => handleField('prerequisites', v)} hint="Optional" />

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

      <Button type="submit" loading={submitting} fullWidth>{submitLabel}</Button>
    </form>
  );
}

export default ProgrammeForm;