/**
 * EnrollmentStepper — visual progress indicator for the 4-step
 * enrollment form. Shows completed / current / upcoming states.
 * Purely presentational — reads step state from useEnrollmentForm,
 * does not drive navigation itself (clicking a step does nothing;
 * back-navigation only happens via the explicit Back button per step,
 * matching the original EnrollPage.jsx behaviour you supplied).
 */

import { Check } from 'lucide-react';
import { useEnrollmentForm } from '../../hooks/useEnrollmentForm.js';

const STEP_LABELS = ['Personal Details', 'Policies', 'Payment', 'Receipt'];

export function EnrollmentStepper() {
  const { state } = useEnrollmentForm();

  return (
    <div className="mx-auto mb-8 flex max-w-xl items-center justify-between px-4">
      {STEP_LABELS.map((label, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = state.step > stepNumber;
        const isCurrent = state.step === stepNumber;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                  ${isCompleted ? 'bg-secondary text-white' : isCurrent ? 'bg-primary text-white' : 'bg-surface text-text-secondary'}
                `}
              >
                {isCompleted ? <Check size={16} /> : stepNumber}
              </div>
              <span
                className={`hidden text-center text-xs sm:block ${isCurrent ? 'font-medium text-text-primary' : 'text-text-secondary'}`}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEP_LABELS.length && (
              <div className={`mx-2 h-0.5 flex-1 transition-colors ${isCompleted ? 'bg-secondary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default EnrollmentStepper;