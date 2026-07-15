/**
 * AdminRegisterPage — /admin/register?token=&code=&rt=
 *
 * FLOW:
 *   1. On mount, verifyInvitation({ token, code }) is called.
 *   2. CODE_EXPIRED → shows a "request new code" prompt (the underlying
 *      invitation/token stays alive — only the short verification code
 *      needs refreshing, per the auth overhaul's two-part credential
 *      design). Clicking Resend re-sends a code to the SAME email and
 *      instructs the admin to check their inbox for the NEW link (since
 *      the code changes, so does the full URL they need to click).
 *   3. LINK_ALREADY_USED / LINK_INVALIDATED / INVALID_LINK → static
 *      dead-end message, no resend option (a resend can't help a
 *      genuinely dead invitation).
 *   4. Success → shows the registration form (email pre-filled,
 *      read-only, from verifiedEmail) → completeRegistration().
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { AuthCard } from '../../components/site/AuthCard';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { PasswordRequirementsChecklist } from '../../components/site/PasswordRequirementsChecklist';
import { RouteFallback } from '../../components/ui/Preloader';
import { validators, validateForm } from '../../utils/validation';

export function AdminRegisterPage() {
  const [searchParams] = useSearchParams();
  const { invitations, actions } = useManageState();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading'); // loading | verified | error
  const [errorInfo, setErrorInfo] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useSEO({ title: 'Complete Registration' });

  const token = searchParams.get('token');
  const code = searchParams.get('code');

  useEffect(() => {
    if (!token || !code) {
      setPhase('error');
      setErrorInfo({ code: 'INVALID_LINK', message: 'This registration link is invalid.' });
      return;
    }
    actions
      .verifyInvitation({ token, code })
      .then(() => setPhase('verified'))
      .catch((err) => {
        setPhase('error');
        setErrorInfo(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await actions.requestNewInvitationCode(token);
      setResent(true);
    } catch {
      // toast already shown centrally
    } finally {
      setResending(false);
    }
  };

  if (phase === 'loading') return <RouteFallback />;

  if (phase === 'error') {
    const isCodeExpired = errorInfo?.code === 'CODE_EXPIRED';

    return (
      <AuthCard title="Registration Link">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <AlertTriangle size={36} className="text-error" />
          <p className="text-sm text-text-secondary">{errorInfo?.message}</p>

          {isCodeExpired && !resent && (
            <Button onClick={handleResend} loading={resending} className="mt-2">
              Request a New Code
            </Button>
          )}
          {resent && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 size={16} /> A new link has been sent. Check your email.
            </p>
          )}
          {!isCodeExpired && (
            <p className="mt-2 text-xs text-text-secondary">
              Ask your Super Admin to send a new invitation.
            </p>
          )}
        </div>
      </AuthCard>
    );
  }

  return <RegistrationForm token={token} code={code} email={invitations.verifiedEmail} navigate={navigate} />;
}

function RegistrationForm({ token, code, email, navigate }) {
 const { actions, invitations } = useManageState();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  // NOTE: completeRegistration lives on invitationSlice via useManageState,
  // not useAuth — resolved directly below instead.
  const { actions, invitations } = useManageState();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const schema = {
    name: [validators.required(), validators.fullName()],
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
      await actions.completeRegistration({ token, code, ...form });
      navigate('/admin/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setSubmitError(err?.message);
    }
  };

  return (
    <AuthCard title="Complete Your Registration" subtitle={`Registering as ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          error={errors.name}
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

        <Button type="submit" loading={invitations.submitting} fullWidth>
          Complete Registration
        </Button>
      </form>
    </AuthCard>
  );
}

export default AdminRegisterPage;