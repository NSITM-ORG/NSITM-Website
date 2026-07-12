/**
 * MyPaymentPage — /my-payment. Single email-entry form requesting a
 * one-time instalment access link. ALWAYS shows the same neutral
 * confirmation message regardless of whether a matching confirmed
 * instalment enrollment exists, per FRD FR-10.1 (prevents student
 * enumeration).
 */

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validators, validateForm } from '../../utils/validation.js';

const SCHEMA = { emailAddress: [validators.required(), validators.email()] };

export function MyPaymentPage() {
  const { actions } = useManageState();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useSEO({ title: 'Submit Instalment Payment' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm({ emailAddress: email }, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setSubmitting(true);
    try {
      const responseMessage = await actions.requestInstalmentAccessLink({ emailAddress: email });
      setMessage(responseMessage);
    } catch {
      // Even on rejection this endpoint should behave neutrally; toast
      // middleware will only fire for genuine network/validation errors.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-6 text-center">
        <Send size={40} className="mx-auto mb-3 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-text-primary">Submit Your Next Instalment Payment</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter the email address you used when you enrolled. We will send you a secure link to access your
          payment details.
        </p>
      </div>

      {message ? (
        <div className="rounded-md border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            type="email"
            label="Email Address"
            value={email}
            onChange={setEmail}
            error={errors.emailAddress}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" loading={submitting} fullWidth>
            Send Link
          </Button>
        </form>
      )}
    </div>
  );
}

export default MyPaymentPage;