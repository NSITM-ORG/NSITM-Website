/**
 * AccountSettingsPage — self-service account management (Issues 2 & 3),
 * identical for Admin and Super Admin. Three tabs:
 *
 *   Profile   — name/email/phone, always requires current password
 *   Password  — direct change, always requires current password,
 *               logs the current device out on success (server-enforced
 *               via passwordChangedAt invalidating the JWT — see
 *               selfAccount.controller.js)
 *   Sessions  — lists every active device, per-device or bulk revoke
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { Tabs } from '../../components/ui/Tabs';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { PasswordRequirementsChecklist } from '../../components/site/PasswordRequirementsChecklist';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/formatters';
import { validators, validateForm } from '../../utils/validation';
import { Monitor, ShieldCheck } from 'lucide-react';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'password', label: 'Password' },
  { value: 'sessions', label: 'Active Devices' },
];

export function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  useSEO({ title: 'My Account' });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">My Account</h1>
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-6 rounded-lg border border-border bg-surface-elevated p-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'sessions' && <SessionsTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, profileUpdating, updateOwnProfile } = useAuth();
  const { showSuccess } = useToast();
  const [form, setForm] = useState({
    name: user?.profile?.fullName || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    currentPassword: '',
  });
  const [errors, setErrors] = useState({});

  const schema = {
    currentPassword: [validators.required('Your current password is required to save changes.')],
    email: [validators.email()],
    phone: [validators.nigerianPhone()],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, schema);
    setErrors(validationErrors);
    if (!isValid) return;

    try {
      await updateOwnProfile(form);
      showSuccess('Profile updated successfully.');
      setForm((f) => ({ ...f, currentPassword: '' }));
    } catch {
      // error toast already shown centrally
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
      <FormField type="email" label="Email Address" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} error={errors.email} />
      <FormField type="tel" label="Phone Number" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} error={errors.phone} />

      <div className="border-t border-border pt-4">
        <FormField
          type="password"
          label="Current Password"
          value={form.currentPassword}
          onChange={(v) => setForm((f) => ({ ...f, currentPassword: v }))}
          error={errors.currentPassword}
          hint="Required to confirm any changes to your profile."
          required
        />
      </div>

      <Button type="submit" loading={profileUpdating} fullWidth>
        Save Changes
      </Button>
    </form>
  );
}

function PasswordTab() {
  const { changeOwnPassword, passwordChanging } = useAuth();
  const { showSuccess } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const schema = {
    currentPassword: [validators.required('Your current password is required.')],
    newPassword: [validators.required(), validators.passwordComplexity()],
    confirmPassword: [validators.required(), validators.matches(form.newPassword, 'Passwords do not match.')],
  };

  const handleValidateAndConfirm = (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, schema);
    setErrors(validationErrors);
    if (!isValid) return;
    setConfirmOpen(true);
  };

  const handleConfirmChange = async () => {
    try {
      await changeOwnPassword(form);
      setConfirmOpen(false);
      showSuccess('Password changed. Please log in again with your new password.');
      // The change already invalidated this session server-side — clear
      // client state and redirect proactively rather than waiting for
      // the next request to fail with a 401.
      window.dispatchEvent(new CustomEvent('nsitm:redirect-to-login'));
    } catch {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <form onSubmit={handleValidateAndConfirm} className="space-y-4">
        <FormField
          type="password"
          label="Current Password"
          value={form.currentPassword}
          onChange={(v) => setForm((f) => ({ ...f, currentPassword: v }))}
          error={errors.currentPassword}
          required
        />
        <div>
          <FormField
            type="password"
            label="New Password"
            value={form.newPassword}
            onChange={(v) => setForm((f) => ({ ...f, newPassword: v }))}
            error={errors.newPassword}
            required
          />
          <PasswordRequirementsChecklist password={form.newPassword} />
        </div>
        <FormField
          type="password"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" fullWidth>
          Change Password
        </Button>
      </form>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmChange}
        title="Change Password"
        message="You will be logged out of this device and need to log in again with your new password. Continue?"
        confirmLabel="Change Password"
        loading={passwordChanging}
      />
    </>
  );
}

function SessionsTab() {
  const { sessions, sessionsLoading, fetchSessions, revokeSession, revokeOtherSessions } = useAuth();
  const { showSuccess } = useToast();
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async () => {
    try {
      await revokeSession(revokeTarget);
      showSuccess('That device has been logged out.');
      setRevokeTarget(null);
    } catch {
      setRevokeTarget(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      const result = await revokeOtherSessions();
      showSuccess(`Logged out ${result?.revokedCount ?? 'other'} device(s).`);
      setRevokeAllOpen(false);
    } catch {
      setRevokeAllOpen(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div>
      <p className="mb-4 text-sm text-text-secondary">
        These are the devices currently signed in to your account. If you don't recognize a device, log it out immediately.
      </p>

      {sessionsLoading ? (
        <p className="text-sm text-text-secondary">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <EmptyState icon={Monitor} title="No active sessions found" />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
              <div className="flex items-center gap-3">
                <Monitor size={20} className="text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {s.deviceLabel} {s.isCurrent && <span className="ml-1 text-xs text-success">(This device)</span>}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Last active {formatRelativeTime(s.lastActiveAt)} · {s.ipAddress}
                  </p>
                </div>
              </div>
              {!s.isCurrent && (
                <button onClick={() => setRevokeTarget(s.id)} className="text-xs font-medium text-error hover:underline">
                  Log Out
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {otherSessionsCount > 0 && (
        <Button variant="outline" className="mt-4" onClick={() => setRevokeAllOpen(true)} icon={ShieldCheck}>
          Log Out All Other Devices ({otherSessionsCount})
        </Button>
      )}

      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Log Out Device"
        message="This device will be immediately signed out. Confirm?"
        confirmLabel="Log Out Device"
        variant="danger"
      />
      <ConfirmModal
        isOpen={revokeAllOpen}
        onClose={() => setRevokeAllOpen(false)}
        onConfirm={handleRevokeAll}
        title="Log Out All Other Devices"
        message={`This will immediately sign out ${otherSessionsCount} other device(s). Your current device stays logged in.`}
        confirmLabel="Log Out All"
        variant="danger"
      />
    </div>
  );
}

export default AccountSettingsPage;