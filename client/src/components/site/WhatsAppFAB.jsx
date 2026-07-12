/**
 * WhatsAppFAB — persistent floating WhatsApp contact button, visible on
 * every public page (per FR-01.6). Fetches public settings if not
 * already loaded (Footer may already have triggered this — shared state).
 */

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState.js';

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
      className="
        fixed bottom-6 left-4 z-40 flex h-14 w-14 items-center justify-center
        rounded-full bg-secondary text-white shadow-elevated
        transition-all duration-200 hover:brightness-90 active:scale-95
      "
    >
      <MessageCircle size={26} />
    </a>
  );
}

export default WhatsAppFAB;