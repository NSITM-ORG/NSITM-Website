/**
 * SuperAdminRegisterPage — /superadmin/register. Guarded by a setup key
 * (a deployment secret, not a personal password — kept as plain text
 * type rather than routed through FormField's password type, since
 * masking it provides no real security benefit and only adds friction
 * when copy-pasting it from wherever it was shared).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useSEO } from '../../hooks/useSEO.js';
import { AuthCard } from '../../components/site/AuthCard.jsx';
import { FormField } from '../../components/ui/FormField.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PasswordRequirementsChecklist } from '../../components/site/PasswordRequirementsChecklist.jsx';
import { validators, validateForm } from '../../utils/validation.js';

export function SuperAdminRegisterPage() {
  const { superAdminRegister, submitting } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    setupKey: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useSEO({ title: 'Super Admin Setup' });

  const schema = {
    setupKey: [validators.required('Setup key is required.')],
    name: [validators.required(), validators.fullName()],
    email: [validators.required(), validators.email()],
    phone: [validators.required(), validators.nigerianPhone()],
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
      await superAdminRegister(form);
      navigate('/superadmin/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setSubmitError(err?.message);
    }
  };

  return (
    <AuthCard
      title="Super Admin Setup"
      subtitle="This is a one-time setup, guarded by a deployment secret."
      footer={
        <Link to="/superadmin/login" className="font-medium text-primary hover:underline">
          Already have an account? Log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Setup Key"
          value={form.setupKey}
          onChange={(v) => setForm((f) => ({ ...f, setupKey: v }))}
          error={errors.setupKey}
          required
        />
        <FormField
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          error={errors.name}
          required
        />
        <FormField
          type="email"
          label="Email Address"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          error={errors.email}
          required
        />
        <FormField
          type="tel"
          label="Phone Number"
          value={form.phone}
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          error={errors.phone}
          required
        />
        <div>
          <FormField
            type="password"
            label="Password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            error={errors.password}
            required
          />
          <PasswordRequirementsChecklist password={form.password} />
        </div>
        <FormField
          type="password"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
          error={errors.confirmPassword}
          required
        />

        {submitError && <p className="text-sm text-error">{submitError}</p>}

        <Button type="submit" loading={submitting} fullWidth>
          Create Super Admin Account
        </Button>
      </form>
    </AuthCard>
  );
}

export default SuperAdminRegisterPage;