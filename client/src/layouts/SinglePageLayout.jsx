/**
 * SinglePageLayout — minimal bar (logo + back button + WhatsApp) with no
 * full nav and no footer. Exclusively houses the Enrollment page-group:
 * EnrollmentPage, EnrollmentConfirmationPage, MyPaymentPage,
 * MyPaymentAccessPage.
 *
 * Back button uses navigate(-1) with a same-origin history guard — if
 * there's no prior in-app history entry (e.g. a student opened the
 * /my-payment/access link straight from their email client), it falls
 * back to the homepage instead of leaving the browser's back button as
 * the only escape route.
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useManageState } from '../hooks/useManageState.js';

export function SinglePageLayout() {
  const navigate = useNavigate();
  const { settings, actions } = useManageState();

  useEffect(() => {
    if (!settings.publicSettings) actions.fetchPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const whatsappLink = settings.publicSettings?.whatsapp?.link;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3 sm:px-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <img src="/nsitm-logo.svg" alt="Nextserve" className="h-8 w-8" />
        {whatsappLink ? (
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-secondary hover:brightness-90">
            <MessageCircle size={22} />
          </a>
        ) : (
          <span className="w-[22px]" />
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default SinglePageLayout;