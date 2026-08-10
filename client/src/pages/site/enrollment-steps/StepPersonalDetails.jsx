/**
 * src/pages/site/enrollment-steps/StepPersonalDetails.jsx
 *
 * BUG FIXES APPLIED:
 *   1. "Enrolling In" now always shows the CORRECT programme — sourced
 *      from state.resolvedProgramme (the canonical single-fetch result),
 *      never re-derived from the shared bulk list cache.
 *   2. The disabled/greyed-out Programme <select> is REPLACED with a
 *      proper read-only confirmation card, matching the "Enrolling In"
 *      banner — the student can now clearly SEE their programme name at
 *      all times, plus a "Change Programme" link back to /programmes,
 *      rather than staring at a dead dropdown with no visible value.
 *   3. Delivery format resolution now reads from resolvedProgramme too
 *      — automatically correct once the above is fixed, since it was
 *      never a separate bug.
 *   4. The delivery-format auto-set side effect was previously stuffed
 *      into useMemo (an anti-pattern — useMemo must be pure and must
 *      never cause side effects during render). Converted to a proper
 *      useEffect.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { useManageState } from '../../../hooks/useManageState';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { GuidanceBanner } from '../../../components/site/GuidanceBanner';
import { validators, validateForm } from '../../../utils/validation';
import { DELIVERY_FORMATS, DELIVERY_FORMAT_LABELS, PROGRAMME_STATUS } from '../../../utils/constants';
import { GraduationCap, Calendar, PencilLine } from 'lucide-react';

const SCHEMA = {
  fullName: [validators.required(), validators.fullName()],
  phoneNumber: [validators.required(), validators.nigerianPhone()],
  emailAddress: [validators.required(), validators.email()],
  programme: [validators.required('Please select a programme.')],
  deliveryFormat: [validators.required('Please select a delivery format.')],
};

export function StepPersonalDetails() {
  const { state, setField, nextStep } = useEnrollmentForm();
  const { programmes, actions } = useManageState();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Only needed for the MANUAL dropdown path (student arrived at /enroll
  // with no ?programme= param and picks one themselves). The prefilled
  // path never touches this — see resolvedProgramme below.
  const flatProgrammes = useMemo(() => Object.values(programmes.list).flat(), [programmes.list]);
  const programmeOptions = useMemo(
    () => flatProgrammes.filter((p) => p.status === PROGRAMME_STATUS.ACTIVE).map((p) => ({ value: p.id, label: p.name })),
    [flatProgrammes]
  );

  // ── Single source of truth once prefilled — no re-derivation, no
  // dependency on any other component's cache state. ──────────────────
  const cohort = state.resolvedProgramme?.activeCohort;
  const cohortDeliveryFormat = cohort?.deliveryFormat;
  const isHybridCohort = cohortDeliveryFormat === DELIVERY_FORMATS.HYBRID;

  useEffect(() => {
    if (cohortDeliveryFormat && !isHybridCohort && state.deliveryFormat !== cohortDeliveryFormat) {
      setField('deliveryFormat', cohortDeliveryFormat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortDeliveryFormat, isHybridCohort]);

  const handleNext = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(state, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setSubmitting(true);
    try {
      await actions.createPartialRecord({
        fullName: state.fullName,
        phoneNumber: state.phoneNumber,
        whatsappNumber: state.whatsappNumber,
        emailAddress: state.emailAddress,
        programme: state.programme,
        deliveryFormat: state.deliveryFormat,
        referralCode: state.referralCode || undefined,
      });
    } catch {
      // FRD FR-08.1: failure must not block advancement. Toast already shown centrally.
    } finally {
      setSubmitting(false);
      nextStep();
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Your Details</h2>

      <GuidanceBanner>
        New here? This form has four short steps — your details, a few policies to acknowledge, payment
        instructions, and finally uploading your payment receipt. You can go back at any point before submitting.
      </GuidanceBanner>

      {/* ── Prominent Programme + Cohort Summary (when prefilled) ── */}
      {state.isPrefilled && state.resolvedProgramme && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <GraduationCap size={14} /> Enrolling In
          </p>
          <p className="font-heading text-lg font-bold text-text-primary">{state.resolvedProgramme.name}</p>
          {cohort && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
              <Calendar size={14} /> {cohort.name}
            </p>
          )}
        </div>
      )}

      <FormField
        label="Full Name"
        value={state.fullName}
        onChange={(v) => setField('fullName', v)}
        error={errors.fullName}
        placeholder="e.g. Tunde Bakare"
        required
      />
      <FormField
        type="tel"
        label="Phone Number"
        value={state.phoneNumber}
        onChange={(v) => setField('phoneNumber', v)}
        error={errors.phoneNumber}
        placeholder="08012345678"
        required
      />
      <FormField
        type="tel"
        label="WhatsApp Number"
        value={state.whatsappNumber}
        onChange={(v) => setField('whatsappNumber', v)}
        hint="Leave blank if same as your phone number."
      />
      <FormField
        type="email"
        label="Email Address"
        value={state.emailAddress}
        onChange={(v) => setField('emailAddress', v)}
        error={errors.emailAddress}
        placeholder="you@example.com"
        required
      />

      {/* ── Programme: read-only confirmation card when prefilled,
           functional dropdown otherwise — no more disabled-select with
           an invisible value. ────────────────────────────────────── */}
      {state.isPrefilled ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Programme</label>
          <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-surface px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">
              {state.resolvedProgramme?.name || 'Loading…'}
            </span>
            <button
              type="button"
              onClick={() => navigate('/programmes')}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <PencilLine size={13} /> Change
            </button>
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">
            Pre-selected from the programme you chose. Click "Change" to pick a different one.
          </p>
        </div>
      ) : (
        <FormField
          type="select"
          label="Programme"
          value={state.programme}
          onChange={(v) => setField('programme', v)}
          options={programmeOptions}
          error={errors.programme}
          placeholder="Select a programme"
          required
        />
      )}

      {/* ── Delivery format: choice for Hybrid, read-only otherwise ── */}
      {isHybridCohort ? (
        <FormField
          type="radio-group"
          label="Delivery Format"
          value={state.deliveryFormat}
          onChange={(v) => setField('deliveryFormat', v)}
          options={[
            { value: DELIVERY_FORMATS.ONLINE, label: 'Online' },
            { value: DELIVERY_FORMATS.IN_PERSON, label: 'In-Person' },
          ]}
          error={errors.deliveryFormat}
          hint="This cohort supports both formats — choose whichever works for you."
          required
        />
      ) : state.isPrefilled ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Delivery Format</label>
          <div className="rounded-sm border border-border bg-surface px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">
              {DELIVERY_FORMAT_LABELS[state.deliveryFormat] || 'Online'}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">
            This cohort's delivery format is set by the administration.
          </p>
        </div>
      ) : (
        <FormField
          type="radio-group"
          label="Delivery Format"
          value={state.deliveryFormat}
          onChange={(v) => setField('deliveryFormat', v)}
          options={[
            { value: DELIVERY_FORMATS.ONLINE, label: 'Online' },
            { value: DELIVERY_FORMATS.IN_PERSON, label: 'In-Person' },
          ]}
          error={errors.deliveryFormat}
          required
        />
      )}

      <FormField
        label="Referral Code"
        value={state.referralCode}
        onChange={(v) => v.length <= 20 && setField('referralCode', v)}
        placeholder="Enter referral code if you have one"
        maxLength={20}
        showCounter
        hint="Optional"
      />

      <Button type="submit" loading={submitting} fullWidth size="lg">
        Next
      </Button>
    </form>
  );
}

export default StepPersonalDetails;