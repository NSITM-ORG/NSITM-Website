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

import { useState } from 'react';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import GuidanceBanner from '../../../components/site/GuidanceBanner';
import { Modal } from '../../../components/ui/Modal';
import { Info } from 'lucide-react';

const POLICIES = [
  {
    key: 'noRefundPolicy',
    slug: 'no-refund-policy',
    label: 'I have read and agree to the No-Refund Policy',
    text: 'Fees paid are non-refundable under any circumstances, including withdrawal, deferral, or failure to attend.',
    summary: 'By enrolling in this programme, you agree that your tuition and associated fees are strictly non-refundable. Nextserve immediately commits resources to your seat. If you cannot attend, you may request a deferral to a future cohort, but cash refunds are not issued under any circumstances.'
  },
  {
    key: 'attendancePolicy',
    slug: 'attendance-policy',
    label: 'I have read and agree to the Attendance Policy',
    text: 'Students are required to attend a minimum of 80% of scheduled sessions.',
    summary: 'Active participation is required for graduation. You must maintain at least 80% attendance in all scheduled classes. Falling below this threshold without prior documented excuse from the administration may result in academic probation or dismissal from the cohort.'
  },
  {
    key: 'codeOfConduct',
    slug: 'code-of-conduct',
    label: 'I have read and agree to the Code of Conduct',
    text: 'Students must conduct themselves respectfully toward instructors and peers in all online and in-person interactions.',
    summary: 'Nextserve enforces a strict zero-tolerance policy against harassment, bullying, and academic dishonesty. You are expected to treat all peers, instructors, and staff with respect. Plagiarism or cheating will lead to immediate expulsion from the academy.'
  },
  {
    key: 'paymentPlanTerms',
    slug: 'payment-plan-terms',
    label: 'I have read and agree to the Payment Plan Terms',
    text: 'Instalment payers must complete full payment within the agreed timeline. Failure to pay may result in suspension of access to sessions.',
    summary: 'If you choose an instalment plan, you are contractually bound to make payments by their designated due dates. Failure to settle outstanding dues within the grace period will result in immediate suspension of portal access until the balance is cleared.'
  },
];

export function StepPolicyAcknowledgment() {
  const { state, setPolicy, nextStep, previousStep, allPoliciesChecked } = useEnrollmentForm();
  const [activePolicy, setActivePolicy] = useState(null);

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Institutional Policies</h2>
      <GuidanceBanner>
        These four policies apply to every Nextserve student. Please read each one — you must check all
        four boxes before you can continue to the payment step.
      </GuidanceBanner>

      <div className="space-y-4">
        {POLICIES.map((policy) => (
          <div key={policy.key} className="relative rounded-md border border-border bg-surface p-4 pr-12">
            <button
              type="button"
              onClick={() => setActivePolicy(policy)}
              className="absolute right-4 top-4 text-primary hover:text-primary-focus transition-colors"
              title="View full policy"
            >
              <Info size={20} />
            </button>
            <p className="mb-2 text-sm text-text-secondary pr-6">{policy.text}</p>
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

      <Modal
        isOpen={!!activePolicy}
        onClose={() => setActivePolicy(null)}
        title={activePolicy?.label.replace('I have read and agree to the ', '')}
        size="lg"
      >
        <div className="mt-2 text-text-secondary leading-relaxed space-y-4">
          <p>{activePolicy?.summary}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setActivePolicy(null)}>Close</Button>
          {activePolicy?.slug && (
            <Button onClick={() => window.open(`/${activePolicy.slug}`, '_blank')}>
              Read Full Policy
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default StepPolicyAcknowledgment;