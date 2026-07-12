/**
 * MyPaymentAccessPage — /my-payment/access?token=&email=
 *
 * Validates the one-time token on mount (consumes it server-side the
 * moment this succeeds — see backend instalment.controller.js). Renders
 * one of four states per FRD FR-10.2's token validation table:
 *   valid → enrollment summary + instalment progress table
 *   expired / used / invalid → distinct messages, each with a link back
 *   to /my-payment to request a fresh link
 *
 * Within the valid state, conditionally shows:
 *   - "Submit Next Instalment" button + inline receipt form, if an
 *     outstanding instalment exists
 *   - "Your last receipt is under review" message, if the most recent
 *     submission is Pending
 *   - "All payments complete" message, if fully paid
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, Landmark } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { useFileUpload } from '../../hooks/useFileUpload.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { RouteFallback } from '../../components/ui/Preloader.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { INSTALMENT_STATUS } from '../../utils/constants.js';

const STATUS_BADGE = {
  not_submitted: { color: 'grey', label: 'Outstanding' },
  pending: { color: 'yellow', label: 'Pending Review' },
  confirmed: { color: 'green', label: 'Confirmed' },
  rejected: { color: 'red', label: 'Rejected' },
};

export function MyPaymentAccessPage() {
  const [searchParams] = useSearchParams();
  const { instalments, actions } = useManageState();
  const [validationState, setValidationState] = useState('loading'); // loading | valid | error
  const [errorInfo, setErrorInfo] = useState(null);

  useSEO({ title: 'Your Payment Details' });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setValidationState('error');
      setErrorInfo({ code: 'INVALID_LINK', message: 'This link is invalid. Please request a new one.' });
      return;
    }

    actions
      .validateInstalmentToken({ token, email })
      .then(() => setValidationState('valid'))
      .catch((err) => {
        setValidationState('error');
        setErrorInfo(err);
      });

    return () => actions.clearAccessSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (validationState === 'loading') return <RouteFallback />;

  if (validationState === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <AlertTriangle size={48} className="mb-4 text-error" />
        <h1 className="mb-2 font-heading text-xl font-semibold text-text-primary">
          {errorInfo?.message || 'This link is invalid.'}
        </h1>
        <Link to="/my-payment" className="mt-4 text-sm font-medium text-primary underline">
          Request a New Link
        </Link>
      </div>
    );
  }

  return <ValidSummaryView summary={instalments.accessSummary} />;
}

function ValidSummaryView({ summary }) {
  const { enrollment, instalment, bankDetails } = summary || {};
  const [submitForm, setSubmitForm] = useState(false);

  if (!enrollment) return <RouteFallback />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 rounded-lg border border-border bg-surface-elevated p-6">
        <h1 className="mb-1 font-heading text-xl font-bold text-text-primary">{enrollment.fullName}</h1>
        <p className="text-sm text-text-secondary">
          {enrollment.programmeName} — {enrollment.cohortName}
        </p>
      </div>

      <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Instalment Progress</h2>
      <div className="mb-8 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-text-secondary">
            <tr>
              <th className="px-4 py-2.5">Instalment</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {instalment?.records?.map((record) => {
              const badge = STATUS_BADGE[record.status] || STATUS_BADGE.not_submitted;
              return (
                <tr key={record.instalmentNumber} className={record.isOverdue ? 'bg-error/5' : ''}>
                  <td className="px-4 py-3">#{record.instalmentNumber}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(record.expectedAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge color={record.isOverdue ? 'red' : badge.color}>
                      {record.isOverdue ? 'Overdue' : badge.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {record.dueDate ? formatDate(record.dueDate) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {instalment?.isFullyPaid ? (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 size={20} /> All payments complete. Your enrollment is fully paid.
        </div>
      ) : instalment?.completionState === 'pending_completion' ? (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <Clock size={20} /> Your last payment receipt is under review. You will receive an email when it is confirmed.
        </div>
      ) : !submitForm ? (
        <Button onClick={() => setSubmitForm(true)} fullWidth>
          Submit Next Instalment
        </Button>
      ) : (
        <SubmitInstalmentForm
          enrollmentId={enrollment.id}
          nextInstalment={instalment.nextOutstanding}
          bankDetails={bankDetails}
        />
      )}
    </div>
  );
}

function SubmitInstalmentForm({ enrollmentId, nextInstalment, bankDetails }) {
  const { actions } = useManageState();
  const fileUpload = useFileUpload();
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const ordinal = { 2: 'Second', 3: 'Third' }[nextInstalment?.instalmentNumber] || 'Next';

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('enrollmentId', enrollmentId);
    formData.append('instalmentNumber', nextInstalment.instalmentNumber);
    formData.append('receipt', fileUpload.file);

    setSubmitting(true);
    setSubmitError(null);
    try {
      await actions.submitInstalmentReceipt(formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please contact us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
        <CheckCircle2 size={20} /> Your receipt has been submitted. We will confirm your payment within 2 to 3 business days.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface-elevated p-6">
      <h3 className="font-heading text-lg font-semibold text-text-primary">
        Submit Your {ordinal} Payment Receipt
      </h3>

      <div className="rounded-md border border-border bg-surface p-4 text-sm">
        <p className="mb-2 flex items-center gap-2 font-medium text-text-primary">
          <Landmark size={16} /> {formatCurrency(nextInstalment?.expectedAmount)}
        </p>
        <p className="text-text-secondary">
          {bankDetails?.bankName} — {bankDetails?.accountName} — {bankDetails?.accountNumber}
        </p>
      </div>

      <FormField
        type="checkbox"
        label="I have completed this transfer"
        value={transferConfirmed}
        onChange={setTransferConfirmed}
      />

      {transferConfirmed && <FormField type="file-dropzone" label="Payment Receipt" file={fileUpload} required />}

      {submitError && <p className="text-sm text-error">{submitError}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!transferConfirmed || !fileUpload.hasFile || !!fileUpload.error}
        loading={submitting}
        fullWidth
      >
        Submit
      </Button>
    </div>
  );
}

export default MyPaymentAccessPage;