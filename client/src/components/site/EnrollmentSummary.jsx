import { useMemo } from 'react';
import { useEnrollmentForm } from '../../hooks/useEnrollmentForm';
import { useManageState } from '../../hooks/useManageState';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_TYPES, DELIVERY_FORMAT_LABELS } from '../../utils/constants';
import { GraduationCap, Calendar, CreditCard, ChevronRight } from 'lucide-react';

export function EnrollmentSummary() {
  const { state, goToStep, STEP } = useEnrollmentForm();
  const { programmes } = useManageState();

  const selectedProgramme = useMemo(() => {
    if (state.resolvedProgramme && (state.resolvedProgramme.id === state.programme || state.resolvedProgramme._id === state.programme)) {
      return state.resolvedProgramme;
    }
    return Object.values(programmes.list).flat().find((p) => p.id === state.programme || p._id === state.programme);
  }, [programmes.list, state.programme, state.resolvedProgramme]);

  if (!selectedProgramme) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-surface-elevated p-5 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-3">Summary</h3>
        <p className="text-sm text-text-secondary">Select a programme to see your enrollment summary.</p>
      </div>
    );
  }

  const cohort = state.resolvedProgramme?.activeCohort || selectedProgramme?.activeCohort;
  const isInstalment = state.paymentType === PAYMENT_TYPES.INSTALMENT;

  return (
    <div className="rounded-2xl border border-primary/15 bg-surface-elevated shadow-sm sticky top-24 overflow-hidden">
      <div className="bg-primary/5 p-5 border-b border-primary/10">
        <h3 className="font-heading text-lg font-semibold text-text-primary flex items-center gap-2">
          Enrollment Summary
        </h3>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Programme</p>
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
              <GraduationCap size={16} />
            </div>
            <div>
              <p className="font-medium text-text-primary">{selectedProgramme.name}</p>
              {cohort && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                  <Calendar size={14} /> {cohort.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Step Data */}
        {state.step > STEP.PERSONAL && (
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Your Details</p>
              <button
                onClick={() => goToStep(STEP.PERSONAL)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="space-y-1.5 text-sm text-text-secondary">
              <p><span className="font-medium text-text-primary">Name:</span> {state.fullName}</p>
              <p><span className="font-medium text-text-primary">Email:</span> {state.emailAddress}</p>
              <p><span className="font-medium text-text-primary">WhatsApp:</span> {state.whatsappNumber}</p>
              {state.deliveryFormat && (
                <p>
                  <span className="font-medium text-text-primary">Format:</span>{' '}
                  {(() => {
                    const format = state.deliveryFormat;
                    const normalized = format.toLowerCase();
                    return DELIVERY_FORMAT_LABELS[format] ||
                      DELIVERY_FORMAT_LABELS[normalized] ||
                      (format.charAt(0).toUpperCase() + format.slice(1).replace('_', ' '));
                  })()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Payment Details</p>
            {state.step > STEP.PAYMENT && (
              <button
                onClick={() => goToStep(STEP.PAYMENT)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Full Fee</span>
              <span className="font-medium text-text-primary">{formatCurrency(selectedProgramme.fees?.full)}</span>
            </div>

            {isInstalment && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Instalment Plan Total</span>
                  <span className="font-medium text-text-primary">{formatCurrency(selectedProgramme.fees?.instalment?.total)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-text-secondary">Due Today (Deposit)</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(
                      selectedProgramme.fees?.instalment?.breakdown?.[0]?.amount ??
                      Math.round(selectedProgramme.fees?.instalment?.total * 0.4)
                    )}
                  </span>
                </div>
              </>
            )}

            {!isInstalment && state.paymentType === PAYMENT_TYPES.FULL && (
              <div className="flex justify-between text-sm items-center pt-2">
                <span className="font-medium text-text-primary">Due Today</span>
                <span className="font-bold text-primary text-base">
                  {formatCurrency(selectedProgramme.fees?.full)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
