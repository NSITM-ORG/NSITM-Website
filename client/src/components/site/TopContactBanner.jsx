/**
 * src/components/site/TopContactBanner.jsx
 *
 * TopContactBanner — the slim contact-info strip above the main nav,
 * mirroring the reference template's `.top_header_banner` /
 * `.logo-contact` structure (icon + phone / icon + email / icon +
 * hours / icon + address, plus social icons on the far right).
 *
 * STRUCTURAL fidelity to the reference, RESKINNED into our fixed
 * primary/secondary palette instead of the reference's own colors.
 * Theme toggle is embedded here per client instruction ("add the theme
 * change button there too, if you can"), positioned alongside social
 * icons on desktop and collapsed into the row on mobile.
 *
 * Responsive: reference hides this entirely below 960px — we instead
 * collapse it to a single-row, icon-only, horizontally scrollable strip
 * on narrow viewports rather than removing it outright, since the
 * WhatsApp/phone/email contact points remain valuable on mobile.
 */

import { Phone, Mail, Clock, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { ThemeToggle } from '../ui/ThemeToggle';

export function TopContactBanner() {
  const { settings } = useManageState();
  const institution = settings.publicSettings?.institution;

  if (!institution) return null; // Renders nothing until settings load — avoids a flash of empty bar

  const items = [
    institution.phone && { icon: Phone, label: institution.phone, href: `tel:${institution.phone}` },
    institution.email && { icon: Mail, label: institution.email, href: `mailto:${institution.email}` },
    institution.officeHours && { icon: Clock, label: institution.officeHours },
    institution.address && { icon: MapPin, label: institution.address },
  ].filter(Boolean);

  return (
    <div className="border-b border-border bg-primary text-white">
      <div className="mx-auto flex max-w-content items-center gap-6 overflow-x-auto px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <Icon size={13} />
                {item.label}
              </span>
            );
            return item.href ? (
              <a key={i} href={item.href} className="opacity-90 transition-opacity hover:opacity-100">
                {content}
              </a>
            ) : (
              <span key={i} className="opacity-90">{content}</span>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {institution.instagram && (
            <a href={institution.instagram} target="_blank" rel="noreferrer" className="opacity-90 hover:opacity-100">
              <Instagram size={14} />
            </a>
          )}
          {institution.linkedin && (
            <a href={institution.linkedin} target="_blank" rel="noreferrer" className="opacity-90 hover:opacity-100">
              <Linkedin size={14} />
            </a>
          )}
          {institution.facebook && (
            <a href={institution.facebook} target="_blank" rel="noreferrer" className="opacity-90 hover:opacity-100">
              <Facebook size={14} />
            </a>
          )}
          <span className="[&_button]:text-white [&_button:hover]:bg-white/15">
            <ThemeToggle />
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopContactBanner;