/**
 * AdminResetPasswordPage — /admin/reset-password/:token. No time-based
 * expiry check here (per the auth overhaul — tokens live until used or
 * superseded), so this page only distinguishes INVALID_TOKEN /
 * TOKEN_ALREADY_USED / TOKEN_INVALIDATED once the backend actually
 * rejects the submission — there's no separate "validate token" call
 * before showing the form, matching how the backend endpoint itself
 * works (single POST that either succeeds or returns one of those codes).
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useSEO } from '../../hooks/useSEO.jsx';
import { useToast } from '../../hooks/useToast';
import { AuthCard } from '../../components/site/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { PasswordRequirementsChecklist } from '../../components/site/PasswordRequirementsChecklist';
import { validators, validateForm } from '../../utils/validation';

export function AdminResetPasswordPage() {
  const { token } = useParams();
  const { adminResetPassword, submitting } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useSEO({ title: 'Set New Password' });

  const schema = {
    password: [validators.required(), validators.passwordComplexity()],
    confirmPassword: [validators.required(), validators.matches(form.password, 'Passwords do not match.')],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, schema);
    setErrors(validationErrors);
    if (!isValid) return;

    setSubmitError(null);
    try {
      const message = await adminResetPassword({ token, ...form });
      showSuccess(message);
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setSubmitError(err?.message);
    }
  };

  return (
    <AuthCard title="Set a New Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormField
            type="password"
            label="New Password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            error={errors.password}
            required
          />
          <PasswordRequirementsChecklist password={form.password} />
        </div>
        <FormField
          type="password"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
          error={errors.confirmPassword}
          required
        />

        {submitError && (
          <div className="rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">
            {submitError}{' '}
            <Link to="/admin/forgot-password" className="font-medium underline">
              Request a new one
            </Link>
          </div>
        )}

        <Button type="submit" loading={submitting} fullWidth>
          Set New Password
        </Button>
      </form>
    </AuthCard>
  );
}

export default AdminResetPasswordPage;