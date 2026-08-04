/**
 * Step 2 — Policy Acknowledgment. Four required checkboxes with full
 * inline policy text (per FRD: not hidden behind a modal). Continue
 * button is disabled — no error message needed — until all four are
 * checked, matching the FRD's stated UX exactly.
 *
 * Note: policy text below is placeholder copy pending founder approval
 * per the FRD's Section 15.2 sign-off requirement — structurally
 * complete and ready to be swapped for final legal text without any
 * component changes.
 */

import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import GuidanceBanner from '../../../components/site/GuidanceBanner';

const POLICIES = [
  {
    key: 'noRefundPolicy',
    label: 'I have read and agree to the No-Refund Policy',
    text: 'Fees paid are non-refundable under any circumstances, including withdrawal, deferral, or failure to attend.',
  },
  {
    key: 'attendancePolicy',
    label: 'I have read and agree to the Attendance Policy',
    text: 'Students are required to attend a minimum of 80% of scheduled sessions.',
  },
  {
    key: 'codeOfConduct',
    label: 'I have read and agree to the Code of Conduct',
    text: 'Students must conduct themselves respectfully toward instructors and peers in all online and in-person interactions.',
  },
  {
    key: 'paymentPlanTerms',
    label: 'I have read and agree to the Payment Plan Terms',
    text: 'Instalment payers must complete full payment within the agreed timeline. Failure to pay may result in suspension of access to sessions.',
  },
];

export function StepPolicyAcknowledgment() {
  const { state, setPolicy, nextStep, previousStep, allPoliciesChecked } = useEnrollmentForm();

  return (
    <div className="space-y-5">
    <h2 className="font-heading text-xl font-semibold text-text-primary">Institutional Policies</h2>
    <GuidanceBanner>
      These four policies apply to every Nextserve student. Please read each one — you must check all
      four boxes before you can continue to the payment step.
    </GuidanceBanner>

      <div className="space-y-4">
        {POLICIES.map((policy) => (
          <div key={policy.key} className="rounded-md border border-border bg-surface p-4">
            <p className="mb-2 text-sm text-text-secondary">{policy.text}</p>
            <FormField
              type="checkbox"
              label={policy.label}
              value={state.policies[policy.key]}
              onChange={(v) => setPolicy(policy.key, v)}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={previousStep} fullWidth>
          Back
        </Button>
        <Button type="button" onClick={nextStep} disabled={!allPoliciesChecked} fullWidth>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}

export default StepPolicyAcknowledgment;