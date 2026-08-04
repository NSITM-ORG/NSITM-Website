/**
 * SuperAdminLoginPage — /superadmin/login. Structurally identical to
 * AdminLoginPage but dispatches superAdminLogin and defaults to the
 * Super Admin-only /superadmin/programmes landing page (Super Admin
 * pages start at Programme Management rather than a shared Dashboard,
 * since the Dashboard route itself is access:'admin' and equally
 * reachable — /superadmin/programmes is used here simply as a
 * Super-Admin-specific first destination).
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { AuthCard } from '../../components/site/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { validators, validateForm } from '../../utils/validation';
import { useEffect } from 'react';

const SCHEMA = {
  email: [validators.required(), validators.email()],
  password: [validators.required()],
};

export function SuperAdminLoginPage() {
  const { superAdminLogin, submitting } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

  useSEO({ title: 'Super Admin Login' });

  useEffect(() => {
    if (location.state?.registered) showSuccess('Account created. Please log in.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setLoginError(null);
    try {
      await superAdminLogin(form);
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (err) {
      setLoginError(err?.message);
    }
  };

  return (
    <AuthCard title="Super Admin Login">
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
          <Link to="/superadmin/forgot-password" className="text-sm font-medium text-primary hover:underline">
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

export default SuperAdminLoginPage;