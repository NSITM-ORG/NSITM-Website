/**
 * Footer — absorbs ALL content from the removed public Contact page
 * (address, phone, email, WhatsApp, social links) plus the plain
 * "Send Us a Message" form (name/email/message → POST /public/contact-messages),
 * per the confirmed decisions.
 *
 * Settings (address/phone/email/social/WhatsApp) come from
 * settingsSlice.publicSettings — fetched once if not already loaded
 * (WhatsAppFAB may have already triggered this fetch; either component
 * mounting first satisfies it, since Redux state is shared).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useToast } from '../../hooks/useToast';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { validators, validateForm } from '../../utils/validation';
import { InstagramIcon, } from '../icons/Instagram';
import { LinkedinIcon } from '../icons/LinkedIn';
import { FacebookIcon } from '../icons/FacebookIcon';

const CONTACT_SCHEMA = {
  name: [validators.required(), validators.minLength(2)],
  email: [validators.required(), validators.email()],
  message: [validators.required(), validators.minLength(10), validators.maxLength(2000)],
};

export function Footer() {
  const { settings, actions } = useManageState();
  const { showSuccess } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!settings.publicSettings) actions.fetchPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const institution = settings.publicSettings?.institution;
  const whatsapp = settings.publicSettings?.whatsapp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, CONTACT_SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setSubmitting(true);
    try {
      const message = await actions.createContactMessage(form);
      showSuccess(message);
      setForm({ name: '', email: '', message: '' });
    } catch {
      // Error toast already shown by the centralized toast middleware.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="mt-20 border-t border-border bg-surface-elevated">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* ── Institution Info ─────────────────────────────────── */}
        <div>
          <h3 className="mb-3 font-heading text-lg font-bold text-primary">Nextserve</h3>
          <p className="mb-4 text-sm text-text-secondary">
            School of Information Technology and Management — hands-on, cohort-based training since 2012.
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            {institution?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" /> {institution.address}
              </li>
            )}
            {institution?.phone && (
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <a href={`tel:${institution.phone}`} className="hover:text-primary">
                  {institution.phone}
                </a>
              </li>
            )}
            {institution?.email && (
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <a href={`mailto:${institution.email}`} className="hover:text-primary">
                  {institution.email}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-3">
            {institution?.instagram && (
              <a href={institution.instagram} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-primary">
                <InstagramIcon size={20} />
              </a>
            )}
            {institution?.linkedin && (
              <a href={institution.linkedin} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-primary">
                <LinkedinIcon size={20} />
              </a>
            )}
            {institution?.facebook && (
              <a href={institution.facebook} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-primary">
                <FacebookIcon size={20} />
              </a>
            )}
            {whatsapp?.link && (
              <a href={whatsapp.link} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-secondary">
                <Send size={20} />
              </a>
            )}
          </div>
        </div>

        {/* ── Quick Links ──────────────────────────────────────── */}
        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold text-text-primary">Quick Links</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><Link to="/programmes" className="hover:text-primary">Programmes</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
            <li><Link to="/my-payment" className="hover:text-primary">Submit Instalment Payment</Link></li>
          </ul>
        </div>

        {/* ── Send Us a Message (replaces the removed Contact page) ── */}
        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold text-text-primary">Send Us a Message</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              error={errors.name}
            />
            <FormField
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              error={errors.email}
            />
            <FormField
              type="textarea"
              placeholder="Your message"
              rows={3}
              value={form.message}
              onChange={(v) => setForm((f) => ({ ...f, message: v }))}
              error={errors.message}
            />
            <Button type="submit" size="sm" loading={submitting} fullWidth>
              Send Message
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} Nextserve School of Information Technology and Management. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;