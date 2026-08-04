/**
 * AdminForgotPasswordPage — /admin/forgot-password. Always shows the
 * same neutral confirmation message on submit regardless of whether the
 * account exists, per FRD FR-04.1.1 (prevents account enumeration).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { AuthCard } from '../../components/site/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { validators, validateForm } from '../../utils/validation';
import { CheckCircle2 } from 'lucide-react';

const SCHEMA = { email: [validators.required(), validators.email()] };

export function AdminForgotPasswordPage() {
  const { adminForgotPassword, submitting } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  useSEO({ title: 'Reset Password' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm({ email }, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    try {
      const responseMessage = await adminForgotPassword({ email });
      setMessage(responseMessage);
    } catch {
      // Neutral response is still expected even on network hiccups; the
      // toast middleware handles genuinely unexpected errors separately.
    }
  };

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle="Enter your registered email and we'll send you a reset link."
      footer={
        <Link to="/admin/login" className="font-medium text-primary hover:underline">
          Back to Login
        </Link>
      }
    >
      {message ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 size={36} className="text-success" />
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            type="email"
            label="Email Address"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
          />
          <Button type="submit" loading={submitting} fullWidth>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default AdminForgotPasswordPage;