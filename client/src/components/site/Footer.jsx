/**
 * src/components/site/Footer.jsx (REPLACES the F5 version)
 *
 * Footer — fuses index.html's footer_section-padding structure (4-column:
 * brand+social / programs list / quick links / contact info, plus the
 * .fc copyright bar) with footer.html's structural treatment (circular
 * social icon buttons, icon-prefixed contact rows, accent-underline
 * section headings) — reskinned into our fixed primary/secondary palette.
 *
 * REMOVED per client instruction: the "Send Us a Message" form and its
 * entire submission flow (backend removal tracked separately in F18 —
 * this component simply no longer renders or imports it).
 *
 * Programme list column now pulls the top-N most popular ACTIVE
 * programmes live from programmeSlice (consistent with the new
 * popularity-driven ordering from F13), instead of a static hardcoded
 * list — "Programs" footer column stays accurate without manual upkeep.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Send, ArrowRight } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';

export function Footer() {
  const { settings, programmes, actions } = useManageState();

  useEffect(() => {
    if (!settings.publicSettings) actions.fetchPublicSettings();
    if (Object.keys(programmes.list).length === 0) actions.fetchAllProgrammes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const institution = settings.publicSettings?.institution;
  const whatsapp = settings.publicSettings?.whatsapp;

  // Top 6 most-popular active programmes across all categories, for the
  // "Programs" footer column — already popularity-sorted server-side.
  const popularProgrammes = Object.values(programmes.list)
    .flat()
    .filter((p) => p.status === 'active')
    .slice(0, 6);

  return (
    <footer className="mt-20 border-t border-border bg-surface-elevated">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* ── Brand + Social ───────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Link to="/" className="mb-4 flex items-center gap-2">
            <img src="/nsitm-logo.svg" alt="Nextserve" className="h-10 w-10 rounded-md" />
            <span className="font-heading text-lg font-bold text-primary">Nextserve</span>
          </Link>
          <p className="mb-5 text-sm leading-relaxed text-text-secondary">
            Nextserve is more than a school. It is a community of practitioners, alumni, instructors, and
            supporters who believe in what technology education can do for Nigeria's workforce and for
            individual lives.
          </p>
          <div className="flex gap-2">
            <SocialCircle href={institution?.instagram} icon={Instagram} />
            <SocialCircle href={institution?.linkedin} icon={Linkedin} />
            <SocialCircle href={institution?.facebook} icon={Facebook} />
            <SocialCircle href={whatsapp?.link} icon={Send} />
          </div>
        </div>

        {/* ── Programs ─────────────────────────────────────────── */}
        <FooterColumn title="Programs">
          {popularProgrammes.length > 0 ? (
            popularProgrammes.map((p) => (
              <li key={p.id}>
                <Link to={`/programmes/${p.slug}`} className="footer-link">
                  {p.name}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-text-secondary">Loading programmes…</li>
          )}
          <li className="pt-2">
            <Link to="/programmes" className="flex items-center gap-1 text-sm font-semibold text-primary">
              All Programmes <ArrowRight size={14} />
            </Link>
          </li>
        </FooterColumn>

        {/* ── Quick Links ──────────────────────────────────────── */}
        <FooterColumn title="Quick Links">
          <li><Link to="/" className="footer-link">Home</Link></li>
          <li><Link to="/about" className="footer-link">About Us</Link></li>
          <li><Link to="/programmes" className="footer-link">Programmes</Link></li>
          <li><Link to="/cohorts" className="footer-link">Active Cohorts</Link></li>
          <li><Link to="/faq" className="footer-link">FAQs</Link></li>
          <li><Link to="/my-payment" className="footer-link">Submit Instalment Payment</Link></li>
        </FooterColumn>

        {/* ── Contact Info ─────────────────────────────────────── */}
        <FooterColumn title="Contact Info">
          <ContactRow icon={Phone} title="Phone" value={institution?.phone} href={`tel:${institution?.phone}`} />
          <ContactRow icon={Mail} title="Email" value={institution?.email} href={`mailto:${institution?.email}`} />
          <ContactRow icon={MapPin} title="Office Address" value={institution?.address} />
        </FooterColumn>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {institution?.name || 'Nextserve School of Information Technology and Management'}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="relative mb-5 pb-3 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
        {title}
        <span className="absolute bottom-0 left-0 h-[3px] w-9 rounded-full bg-secondary" />
      </h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function SocialCircle({ href, icon: Icon }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-secondary shadow-card transition-colors hover:bg-primary hover:text-white"
    >
      <Icon size={15} />
    </a>
  );
}

function ContactRow({ icon: Icon, title, value, href }) {
  if (!value) return null;
  return (
    <li className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold text-text-primary">{title}</p>
        {href ? (
          <a href={href} className="text-sm text-text-secondary hover:text-primary">{value}</a>
        ) : (
          <p className="text-sm text-text-secondary">{value}</p>
        )}
      </div>
    </li>
  );
}

export default Footer;