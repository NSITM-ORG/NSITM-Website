/**
 * EnrollmentPage — the 4-step enrollment form container.
 *
 * PROGRAMME AUTO-FILL (per build instruction): reads ?programme=SLUG
 * from the URL on mount, resolves it against the loaded programme list,
 * and pre-fills state.programme with that programme's Mongo _id via
 * prefillFromQuery. If the slug doesn't match any active programme, the
 * field is simply left empty — no error shown, matching FRD FR-02.1's
 * "invalid identifier → field defaults to empty" rule.
 *
 * MID-FORM PROGRAMME CHANGE: if the student is on Step 1 and changes
 * the programme dropdown AFTER already having a partialEnrollmentId
 * (i.e. they clicked Next once, went back, and picked a different
 * programme), StepPersonalDetails' onChange still just calls setField —
 * the actual PATCH to the backend happens the next time Next is pressed,
 * which re-runs createPartialRecord's duplicate-detection logic
 * server-side (finds the existing not_paid record for this profile and
 * updates its programme field). This mirrors the original EnrollPage.jsx
 * behaviour and keeps the client-side logic simple.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnrollmentFormProvider, useEnrollmentForm } from '../../hooks/useEnrollmentForm.js';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { EnrollmentStepper } from '../../components/site/EnrollmentStepper.jsx';
import { StepPersonalDetails } from './enrollment-steps/StepPersonalDetails.jsx';
import { StepPolicyAcknowledgment } from './enrollment-steps/StepPolicyAcknowledgment.jsx';
import { StepPaymentDetails } from './enrollment-steps/StepPaymentDetails.jsx';
import { StepReceiptUpload } from './enrollment-steps/StepReceiptUpload.jsx';

function EnrollmentFormBody() {
  const [searchParams] = useSearchParams();
  const { state, STEP, prefillFromQuery } = useEnrollmentForm();
  const { programmes, actions } = useManageState();

  useEffect(() => {
    if (Object.values(programmes.list).flat().length === 0) actions.fetchAllProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const slug = searchParams.get('programme');
    if (!slug) return;
    const flat = Object.values(programmes.list).flat();
    const match = flat.find((p) => p.slug === slug);
    if (match) prefillFromQuery(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, programmes.list]);

  const STEPS = {
    [STEP.PERSONAL]: <StepPersonalDetails />,
    [STEP.POLICY]: <StepPolicyAcknowledgment />,
    [STEP.PAYMENT]: <StepPaymentDetails />,
    [STEP.RECEIPT]: <StepReceiptUpload />,
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <EnrollmentStepper />
      <div className="rounded-lg border border-border bg-surface-elevated p-6 shadow-card sm:p-8">
        {STEPS[state.step]}
      </div>
    </div>
  );
}

export function EnrollmentPage() {
  useSEO({ title: 'Enroll Now', description: 'Complete your Nextserve enrollment in four simple steps.' });

  return (
    <EnrollmentFormProvider>
      <EnrollmentFormBody />
    </EnrollmentFormProvider>
  );
}

export default EnrollmentPage;