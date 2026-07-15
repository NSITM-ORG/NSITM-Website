/**
 * SettingsPage — /superadmin/settings. Three tabbed sections (Bank
 * Details / WhatsApp / Institution), each saved independently via
 * PUT /superadmin/settings (backend accepts partial nested updates).
 */

import { useEffect, useState } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useToast } from '../../hooks/useToast';
import { Tabs } from '../../components/ui/Tabs';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { RouteFallback } from '../../components/ui/Preloader';

const TABS = [
  { value: 'bank', label: 'Bank Details' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'institution', label: 'Institution' },
];

export function SettingsPage() {
  const { settings, actions } = useManageState();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('bank');

  useSEO({ title: 'Settings' });

  useEffect(() => {
    actions.fetchFullSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!settings.settings) return <RouteFallback />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Settings</h1>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6 rounded-lg border border-border bg-surface-elevated p-6">
        {activeTab === 'bank' && <BankDetailsForm settings={settings} actions={actions} showSuccess={showSuccess} />}
        {activeTab === 'whatsapp' && <WhatsAppForm settings={settings} actions={actions} showSuccess={showSuccess} />}
        {activeTab === 'institution' && <InstitutionForm settings={settings} actions={actions} showSuccess={showSuccess} />}
      </div>
    </div>
  );
}

function BankDetailsForm({ settings, actions, showSuccess }) {
  const [form, setForm] = useState(settings.settings.bankDetails || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actions.updateSettings({ bankDetails: form });
      showSuccess('Bank details saved.');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Bank Name" value={form.bankName || ''} onChange={(v) => setForm((f) => ({ ...f, bankName: v }))} />
      <FormField label="Account Number" value={form.accountNumber || ''} onChange={(v) => setForm((f) => ({ ...f, accountNumber: v }))} maxLength={10} />
      <FormField label="Account Name" value={form.accountName || ''} onChange={(v) => setForm((f) => ({ ...f, accountName: v }))} />
      <FormField label="Bank Code" value={form.bankCode || ''} onChange={(v) => setForm((f) => ({ ...f, bankCode: v }))} hint="Optional — NIBSS code" />
      <Button type="submit" loading={settings.saving} fullWidth>Save Bank Details</Button>
    </form>
  );
}

function WhatsAppForm({ settings, actions, showSuccess }) {
  const [form, setForm] = useState(settings.settings.whatsapp || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actions.updateSettings({ whatsapp: form });
      showSuccess('WhatsApp settings saved.');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="WhatsApp Number" value={form.number || ''} onChange={(v) => setForm((f) => ({ ...f, number: v }))} placeholder="+2348012345678" />
      <FormField label="WhatsApp Link" value={form.link || ''} onChange={(v) => setForm((f) => ({ ...f, link: v }))} placeholder="https://wa.me/2348012345678" />
      <FormField type="textarea" label="Pre-filled Message" value={form.prefilledMessage || ''} onChange={(v) => setForm((f) => ({ ...f, prefilledMessage: v }))} hint="Optional" rows={2} />
      <Button type="submit" loading={settings.saving} fullWidth>Save WhatsApp Settings</Button>
    </form>
  );
}

function InstitutionForm({ settings, actions, showSuccess }) {
  const [form, setForm] = useState(settings.settings.institution || {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actions.updateSettings({ institution: form });
      showSuccess('Institution info saved.');
    } catch {
      // toast already shown centrally
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Institution Name" value={form.name || ''} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
      <FormField label="Address" value={form.address || ''} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
      <FormField label="Phone" value={form.phone || ''} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
      <FormField type="email" label="Email" value={form.email || ''} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
      <FormField label="Website" value={form.website || ''} onChange={(v) => setForm((f) => ({ ...f, website: v }))} />
      <FormField label="Instagram" value={form.instagram || ''} onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} />
      <FormField label="LinkedIn" value={form.linkedin || ''} onChange={(v) => setForm((f) => ({ ...f, linkedin: v }))} />
      <FormField label="Facebook" value={form.facebook || ''} onChange={(v) => setForm((f) => ({ ...f, facebook: v }))} />
      <Button type="submit" loading={settings.saving} fullWidth>Save Institution Info</Button>
    </form>
  );
}

export default SettingsPage;