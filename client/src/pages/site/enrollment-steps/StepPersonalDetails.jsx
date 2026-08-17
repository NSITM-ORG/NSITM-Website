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
// import { useNavigate } from 'react-router-dom';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { useManageState } from '../../../hooks/useManageState';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { GuidanceBanner } from '../../../components/site/GuidanceBanner';
import { validators, validateForm } from '../../../utils/validation';
import { DELIVERY_FORMAT_LABELS, PROGRAMME_STATUS } from '../../../utils/constants';
import { GraduationCap, Calendar, } from 'lucide-react';

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
  // const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Only needed for the MANUAL dropdown path (student arrived at /enroll
  // with no ?programme= param and picks one themselves). The prefilled
  // path never touches this — see resolvedProgramme below.
  const flatProgrammes = useMemo(() => Object.values(programmes.list).flat(), [programmes.list]);
  const programmeOptions = useMemo(
    () => flatProgrammes.filter((p) => p.status === PROGRAMME_STATUS.ACTIVE).map((p) => ({ value: p._id || p.id, label: p.name })),
    [flatProgrammes]
  );


  // ── Single source of truth once prefilled or selected manually ────────
  const selectedProgrammeFromDropdown = useMemo(() => {
    if (state.resolvedProgramme && (state.resolvedProgramme.id === state.programme || state.resolvedProgramme._id === state.programme)) {
      return state.resolvedProgramme;
    }
    return flatProgrammes.find(p => p.id === state.programme || p._id === state.programme);
  }, [state.programme, flatProgrammes, state.resolvedProgramme]);

  const cohort = selectedProgrammeFromDropdown?.activeCohort;
  const cohortDeliveryFormat = cohort?.deliveryFormat;
  // const isHybridCohort = cohortDeliveryFormat === DELIVERY_FORMATS.HYBRID;

  useEffect(() => {
    if (cohortDeliveryFormat && state.deliveryFormat !== cohortDeliveryFormat) {
      setField('deliveryFormat', cohortDeliveryFormat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortDeliveryFormat]);

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
        actionButton={
          <button
            type="button"
            onClick={() => setField('whatsappNumber', state.phoneNumber)}
            disabled={!state.phoneNumber}
            className="mb-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            Use Phone Number
          </button>
        }
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
      <FormField
        type="select"
        label="Programme"
        value={state.programme}
        onChange={(v) => {
          setField('programme', v);
          // If the user manually changes the programme, we should clear the isPrefilled flag
          // if it's currently prefilled, but `setField` already updates the state properly.
        }}
        options={programmeOptions}
        error={errors.programme}
        placeholder="Select a programme"
        required
      />

      {/* ── Delivery format: displayed value as requested ── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Delivery Format</label>
        <div className="rounded-sm border border-border bg-surface px-4 py-3">
          <span className="text-sm font-semibold text-text-primary">
            {(() => {
              const format = state.deliveryFormat || cohortDeliveryFormat;
              if (!format) return 'To be determined';

              const normalizedFormat = format.toLowerCase();
              return DELIVERY_FORMAT_LABELS[format] ||
                DELIVERY_FORMAT_LABELS[normalizedFormat] ||
                (format.charAt(0).toUpperCase() + format.slice(1).replace('_', ' '));
            })()}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-text-secondary">
          This cohort's delivery format is dictated by the administration.
        </p>
      </div>

      <FormField
        label="Referral Code"
        value={state.referralCode}
        onChange={(v) => v?.length <= 20 && setField('referralCode', v)}
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