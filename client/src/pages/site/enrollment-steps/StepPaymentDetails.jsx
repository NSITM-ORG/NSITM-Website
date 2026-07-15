/**
 * Step 3 — Payment Details. Payment type selection (Full / Instalment)
 * shown BEFORE bank details, per FRD FR-02.3 (avoids showing bank
 * details before the student knows what to transfer). Amount updates
 * dynamically on selection change — no page reload, pure derived state
 * from the already-loaded programme fee data.
 *
 * Bank details come from settingsSlice.publicSettings — fetched once at
 * the SinglePageLayout level, already in Redux by the time this step
 * mounts in the normal flow.
 */

import { useMemo } from 'react';
import { useEnrollmentForm } from '../../../hooks/useEnrollmentForm';
import { useManageState } from '../../../hooks/useManageState';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatters';
import { PAYMENT_TYPES } from '../../../utils/constants';
import { Landmark, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';

export function StepPaymentDetails() {
  const { state, setField, nextStep, previousStep } = useEnrollmentForm();
  const { programmes, settings } = useManageState();
  const { copied, copy } = useCopyToClipboard();

  const selectedProgramme = useMemo(
    () => Object.values(programmes.list).flat().find((p) => p.id === state.programme),
    [programmes.list, state.programme]
  );

  const bankDetails = settings.publicSettings?.bankDetails;

  const amountDue = useMemo(() => {
    if (!selectedProgramme) return null;
    if (state.paymentType === PAYMENT_TYPES.FULL) return selectedProgramme.fees?.full;
    if (state.paymentType === PAYMENT_TYPES.INSTALMENT) {
      const breakdown = selectedProgramme.fees?.instalment?.breakdown;
      return breakdown?.[0]?.amount ?? Math.round((selectedProgramme.fees?.instalment?.total || 0) * 0.4);
    }
    return null;
  }, [selectedProgramme, state.paymentType]);

  const canContinue = !!state.paymentType;

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Payment Details</h2>

      <FormField
        type="radio-group"
        label="Payment Type"
        value={state.paymentType}
        onChange={(v) => setField('paymentType', v)}
        options={[
          {
            value: PAYMENT_TYPES.FULL,
            label: `Full Payment — ${selectedProgramme ? formatCurrency(selectedProgramme.fees?.full) : '—'}`,
          },
          ...(selectedProgramme?.fees?.instalment?.total
            ? [
                {
                  value: PAYMENT_TYPES.INSTALMENT,
                  label: `Instalment — ${formatCurrency(
                    selectedProgramme.fees.instalment.breakdown?.[0]?.amount ??
                      Math.round(selectedProgramme.fees.instalment.total * 0.4)
                  )} first payment`,
                },
              ]
            : []),
        ]}
      />

      {state.paymentType && bankDetails && (
        <div className="rounded-md border border-border bg-surface p-5">
          <p className="mb-3 flex items-center gap-2 font-medium text-text-primary">
            <Landmark size={18} /> Bank Transfer Details
          </p>
          <dl className="space-y-2 text-sm">
            <Row label="Bank Name" value={bankDetails.bankName} />
            <Row label="Account Name" value={bankDetails.accountName} />
            <Row
              label="Account Number"
              value={bankDetails.accountNumber}
              onCopy={() => copy(bankDetails.accountNumber)}
              copied={copied}
            />
            <Row label="Amount to Transfer" value={formatCurrency(amountDue)} highlight />
          </dl>
          <p className="mt-3 text-xs text-text-secondary">
            Use your full name and programme name as the transfer description.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={previousStep} fullWidth>
          Back
        </Button>
        <Button type="button" onClick={nextStep} disabled={!canContinue} fullWidth>
          Continue to Upload Receipt
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className={`flex items-center gap-2 font-medium ${highlight ? 'text-primary' : 'text-text-primary'}`}>
        {value}
        {onCopy && (
          <button type="button" onClick={onCopy} className="text-text-secondary hover:text-primary" aria-label="Copy">
            <Copy size={14} />
            {copied && <span className="ml-1 text-xs text-success">Copied</span>}
          </button>
        )}
      </dd>
    </div>
  );
}

export default StepPaymentDetails;