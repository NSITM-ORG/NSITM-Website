/**
 * src/pages/site/enrollment-steps/StepPersonalDetails.jsx (REPLACES F7 version)
 *
 * Changes per client instruction:
 *   1. Programme + cohort name displayed PROMINENTLY at the top of the
 *      step (a highlighted summary card), not just silently pre-filled
 *      into a dropdown the student might not even notice.
 *   2. Programme select becomes a DISABLED, read-only display when
 *      arrived via ?programme=slug (state.isPrefilled) — the student
 *      cannot second-guess or accidentally change it from a card click;
 *      they'd need to go back to Programmes and pick a different card.
 *   3. Delivery format: for a HYBRID cohort, the student still chooses
 *      Online or In-Person themselves. For a pure Online or pure
 *      In-Person cohort, the format is shown read-only (no student
 *      choice) since there's nothing to choose between.
 *   4. First-timer guidance banner at the top of the step.
 */

import { useMemo } from 'react';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { useManageState } from '../../../hooks/useManageState';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { GuidanceBanner } from '../../../components/site/GuidanceBanner';
import { validators, validateForm } from '../../../utils/validation';
import { DELIVERY_FORMATS, DELIVERY_FORMAT_LABELS, PROGRAMME_STATUS } from '../../../utils/constants';
import { useState } from 'react';
import { GraduationCap, Calendar } from 'lucide-react';

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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const flatProgrammes = useMemo(() => Object.values(programmes.list).flat(), [programmes.list]);

  const programmeOptions = useMemo(
    () => flatProgrammes.filter((p) => p.status === PROGRAMME_STATUS.ACTIVE).map((p) => ({ value: p.id, label: p.name })),
    [flatProgrammes]
  );

  const selectedProgramme = useMemo(
    () => flatProgrammes.find((p) => p.id === state.programme),
    [flatProgrammes, state.programme]
  );

  const cohort = selectedProgramme?.activeCohort;
  const cohortDeliveryFormat = cohort?.deliveryFormat;
  const isHybridCohort = cohortDeliveryFormat === DELIVERY_FORMATS.HYBRID;

  // Auto-set the read-only delivery format for non-hybrid cohorts, once
  // a programme with a known cohort format is resolved.
  useMemo(() => {
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
      // FRD FR-08.1: failure must not block advancement.
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
      {state.isPrefilled && selectedProgramme && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <GraduationCap size={14} /> Enrolling In
          </p>
          <p className="font-heading text-lg font-bold text-text-primary">{selectedProgramme.name}</p>
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

      {/* ── Programme select — disabled/read-only when prefilled ── */}
      <FormField
        type="select"
        label="Programme"
        value={state.programme}
        onChange={(v) => setField('programme', v)}
        options={programmeOptions}
        error={errors.programme}
        placeholder="Select a programme"
        disabled={state.isPrefilled}
        hint={state.isPrefilled ? 'Pre-selected from the programme you chose. Go back to Programmes to pick a different one.' : undefined}
        required
      />

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
      ) : (
        <FormField
          type="select"
          label="Delivery Format"
          value={state.deliveryFormat}
          onChange={() => {}}
          options={[{ value: state.deliveryFormat || DELIVERY_FORMATS.ONLINE, label: DELIVERY_FORMAT_LABELS[state.deliveryFormat] || 'Online' }]}
          disabled
          hint="This cohort's delivery format is fixed by the administration."
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