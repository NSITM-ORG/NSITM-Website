/**
 * Step 1 — Personal Details.
 *
 * On Next: validates locally, then calls createPartialRecord() (Step 1
 * backend trigger). Per FRD FR-08.1, a backend failure here must NOT
 * block the form — the catch block swallows the error (already toasted
 * centrally) and advances anyway.
 *
 * Programme dropdown is built from programmeSlice.list (flattened,
 * active-only). If ?programme=slug was present on page load, the parent
 * EnrollmentPage already resolved it into state.programme before this
 * step renders — see prefillFromQuery usage in EnrollmentPage.jsx.
 */

import { useMemo } from 'react';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm.js';
import { useManageState } from '../../../hooks/useManageState.js';
import { FormField } from '../../../components/ui/FormField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { validators, validateForm } from '../../../utils/validation.js';
import { DELIVERY_FORMATS, PROGRAMME_STATUS } from '../../../utils/constants.js';
import { useState } from 'react';

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

  const programmeOptions = useMemo(() => {
    const flat = Object.values(programmes.list).flat();
    return flat
      .filter((p) => p.status === PROGRAMME_STATUS.ACTIVE)
      .map((p) => ({ value: p.id, label: p.name }));
  }, [programmes.list]);

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