/**
 * Step 4 — Receipt Upload & Submission. Receipt field hidden until the
 * "I have completed my bank transfer" checkbox is checked, per FRD
 * FR-02.4. Submit is a FormData multipart POST to
 * /public/enrollment/complete, disabled until a valid file is selected,
 * and enters a loading state on click to prevent double submission.
 *
 * On success: navigates to /enroll/confirmation and clears the ephemeral
 * enrollment form context (Redux's partialEnrollmentId is deliberately
 * left in place until the confirmation page reads it once, then cleared
 * there — see EnrollmentConfirmationPage.jsx).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { useManageState } from '../../../hooks/useManageState';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatters';
import { PAYMENT_TYPES } from '../../../utils/constants';
import { useMemo } from 'react';
import GuidanceBanner from '../../../components/site/GuidanceBanner';

export function StepReceiptUpload() {
  const { state, previousStep, resetForm } = useEnrollmentForm();
  const { programmes, enrollments, actions } = useManageState();
  const navigate = useNavigate();
  const fileUpload = useFileUpload();
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedProgramme = useMemo(
    () => Object.values(programmes.list).flat().find((p) => p.id === state.programme),
    [programmes.list, state.programme]
  );

  const depositAmount = useMemo(() => {
    if (!selectedProgramme) return null;
    if (state.paymentType === PAYMENT_TYPES.FULL) return selectedProgramme.fees?.full;
    const breakdown = selectedProgramme.fees?.instalment?.breakdown;
    return breakdown?.[0]?.amount ?? Math.round((selectedProgramme.fees?.instalment?.total || 0) * 0.4);
  }, [selectedProgramme, state.paymentType]);

  const canSubmit = transferConfirmed && fileUpload.hasFile && !fileUpload.error;

  const handleSubmit = async () => {
    console.log(enrollments);
    if (!enrollments.partialEnrollmentId) {
      setSubmitError('Your enrollment session could not be found. Please contact us on WhatsApp.');
      return;
    }

    const formData = new FormData();
    formData.append('enrollmentId', enrollments.partialEnrollmentId);
    formData.append('paymentType', state.paymentType);
    formData.append('depositAmount', depositAmount);
    formData.append('receipt', fileUpload.file);

    setSubmitting(true);
    setSubmitError(null);
    try {
      await actions.completeEnrollment(formData);
      resetForm();
      navigate('/enroll/confirmation');
    } catch (err) {
      setSubmitError(
        err?.message || 'Something went wrong with your submission. Please contact us on WhatsApp to complete your enrollment.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Upload Payment Receipt</h2>
      <GuidanceBanner>
        Complete your bank transfer first, then check the box below to reveal the upload field. Accepted
        files: JPG, PNG, or PDF, up to 5MB. We typically confirm payments within 2–3 business days.
      </GuidanceBanner>

      <div className="rounded-md border border-border bg-surface p-4 text-sm">
        <p className="text-text-secondary">Amount to transfer</p>
        <p className="font-heading text-xl font-bold text-primary">{formatCurrency(depositAmount)}</p>
      </div>

      <FormField
        type="checkbox"
        label="I have completed my bank transfer"
        value={transferConfirmed}
        onChange={setTransferConfirmed}
      />

      {transferConfirmed && (
        <FormField type="file-dropzone" label="Payment Receipt" file={fileUpload} required />
      )}

      {submitError && (
        <p className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">{submitError}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={previousStep} disabled={submitting} fullWidth>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit} loading={submitting} fullWidth>
          Submit Enrollment
        </Button>
      </div>
    </div>
  );
}

export default StepReceiptUpload;