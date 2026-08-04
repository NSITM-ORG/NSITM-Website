/**
 * src/components/site/WhatsAppFAB.jsx (REPLACES the F5 version)
 *
 * Upgraded from icon-only circular FAB to the reference's pill shape
 * with visible "Chat with us" label — same fixed bottom-left position,
 * same lift-on-hover interaction, reskinned to secondary green
 * (--color-secondary) instead of the reference's WhatsApp-brand green,
 * since our design system uses secondary for this exact affordance already.
 */

import { useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState';
import { WhatsappIcon } from '../icons/Whatsapp';

export function WhatsAppFAB() {
  const { settings, actions } = useManageState();

  useEffect(() => {
    if (!settings.publicSettings) actions.fetchPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const link = settings.publicSettings?.whatsapp?.link;
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="wa-pill fixed bottom-16 left-6 z-40 flex items-center gap-2.5 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:brightness-110 active:scale-95"
    >
      <WhatsappIcon color='#fff' />
      <span className='hidden sm:inline font-semibold tracking-wide'>Chat with us</span>
    </a>
  );
}

export default WhatsAppFAB;