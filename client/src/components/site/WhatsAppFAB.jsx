/**
 * WhatsAppFAB — persistent floating WhatsApp contact button, visible on
 * every public page (per FR-01.6). Fetches public settings if not
 * already loaded (Footer may already have triggered this — shared state).
 */

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';

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
      className="wa-pill fixed bottom-6 left-4 z-40 bg-secondary text-white"
    >
      <MessageCircle size={18} />
      <span>How can I help you</span>
    </a>
  );
}

export default WhatsAppFAB;