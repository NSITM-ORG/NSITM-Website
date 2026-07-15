/**
 * AdminLoginPage — /admin/login. Not linked from any public page, per
 * FRD FR-04.1. On success, redirects to the originally-requested path
 * (preserved by ProtectedRoute via location.state.from) or defaults to
 * the dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { AuthCard } from '../../components/site/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { validators, validateForm } from '../../utils/validation';

const SCHEMA = {
  email: [validators.required(), validators.email()],
  password: [validators.required()],
};

export function AdminLoginPage() {
  const { adminLogin, submitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

  useSEO({ title: 'Admin Login' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setLoginError(null);
    try {
      await adminLogin(form);
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (err) {
      setLoginError(err?.message);
    }
  };

  return (
    <AuthCard title="Admin Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          type="email"
          label="Email Address"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          error={errors.email}
          required
        />
        <FormField
          type="password"
          label="Password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          error={errors.password}
          required
        />

        {loginError && <p className="text-sm text-error">{loginError}</p>}

        <div className="flex justify-end">
          <Link to="/admin/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" loading={submitting} fullWidth>
          Log In
        </Button>
      </form>
    </AuthCard>
  );
}

export default AdminLoginPage;