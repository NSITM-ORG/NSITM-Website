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
import { Landmark, Copy, AlertCircle, Calendar } from 'lucide-react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import GuidanceBanner from '../../../components/site/GuidanceBanner';

export function StepPaymentDetails() {
  const { state, setField, nextStep, previousStep } = useEnrollmentForm();
  const { programmes, settings } = useManageState();
  const { copied, copy } = useCopyToClipboard();

  const selectedProgramme = useMemo(() => {
    if (state.resolvedProgramme && (state.resolvedProgramme.id === state.programme || state.resolvedProgramme._id === state.programme)) {
      return state.resolvedProgramme;
    }
    return Object.values(programmes.list).flat().find((p) => p.id === state.programme || p._id === state.programme);
  }, [programmes.list, state.programme, state.resolvedProgramme]);

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

  const instalmentBreakdown = useMemo(() => {
    if (state.paymentType !== PAYMENT_TYPES.INSTALMENT || !selectedProgramme?.fees?.instalment?.total) return null;
    return selectedProgramme.fees.instalment.breakdown || [
      { instalmentNumber: 1, amount: Math.round(selectedProgramme.fees.instalment.total * 0.4), dueDayOffset: 0 },
      { instalmentNumber: 2, amount: Math.round(selectedProgramme.fees.instalment.total * 0.3), dueDayOffset: 30 },
      { instalmentNumber: 3, amount: selectedProgramme.fees.instalment.total - Math.round(selectedProgramme.fees.instalment.total * 0.4) - Math.round(selectedProgramme.fees.instalment.total * 0.3), dueDayOffset: 60 }
    ];
  }, [selectedProgramme, state.paymentType]);

  const canContinue = !!state.paymentType;

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Payment Details</h2>
      <GuidanceBanner>
        Choose Full Payment or Instalment below. If you select Instalment, you'll see the complete
        3-payment breakdown before continuing — no surprises later. Bank transfer is our only payment
        method; you'll upload proof of transfer on the next step.
      </GuidanceBanner>

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

      {instalmentBreakdown && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 animate-[fadeIn_200ms_ease-out]">
          <h3 className="mb-4 font-semibold text-text-primary flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Instalment Schedule
          </h3>
          <div className="space-y-3">
            {instalmentBreakdown.map((item) => (
              <div key={item.instalmentNumber} className="flex items-center justify-between rounded bg-surface p-3 border border-border">
                <div>
                  <span className="block text-sm font-medium text-text-primary">Payment {item.instalmentNumber}</span>
                  <span className="text-xs text-text-secondary">
                    {item.dueDayOffset === 0 ? 'Due now' : `Due in ${item.dueDayOffset} days`}
                  </span>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-text-secondary flex items-start gap-1.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>Failure to meet the payment schedule may result in suspension from the programme.</span>
          </p>
        </div>
      )}

      {state.paymentType && bankDetails && (
        <div className="rounded-xl border-2 border-primary/20 bg-surface-elevated p-6 shadow-sm ring-1 ring-primary/5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Landmark size={20} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-text-primary">Bank Transfer</p>
              <p className="text-sm text-text-secondary">Please transfer the amount below to this account.</p>
            </div>
          </div>
          
          <dl className="space-y-3 rounded-lg bg-surface p-4 border border-border">
            <Row label="Bank Name" value={bankDetails.bankName} />
            <Row label="Account Name" value={bankDetails.accountName} />
            <Row
              label="Account Number"
              value={bankDetails.accountNumber}
              onCopy={() => copy(bankDetails.accountNumber)}
              copied={copied}
              isLarge
            />
            <div className="my-2 border-t border-border" />
            <Row label="Amount to Transfer" value={formatCurrency(amountDue)} highlight />
          </dl>
          
          <div className="mt-4 flex items-start gap-2 rounded-md bg-accent-amber/10 p-3 text-sm text-accent-amber">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>
              <strong>Important:</strong> Use your full name and programme name as the transfer description so we can verify your payment quickly.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
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

function Row({ label, value, highlight, onCopy, copied, isLarge }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-text-secondary">{label}</dt>
      <dd className={`flex items-center gap-2 ${isLarge ? 'text-lg font-bold' : 'font-medium'} ${highlight ? 'text-primary text-lg font-bold' : 'text-text-primary'}`}>
        {value}
        {onCopy && (
          <button type="button" onClick={onCopy} className="rounded p-1.5 text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors" aria-label="Copy">
            <Copy size={16} />
            {copied && <span className="absolute -translate-y-8 translate-x-4 rounded bg-surface-elevated px-2 py-1 text-xs font-semibold text-success shadow-lg ring-1 ring-border">Copied!</span>}
          </button>
        )}
      </dd>
    </div>
  );
}

export default StepPaymentDetails;