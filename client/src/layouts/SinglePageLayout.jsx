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
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useManageState } from '../hooks/useManageState';
import SiteLogo from '../components/assets/SiteLogo';
import { WhatsappIcon } from '../components/icons/Whatsapp';

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
      <header className="flex items-center justify-between bg-surface-elevated px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between w-full max-w-content mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-base md:text-xl font-medium cursor-pointer hover:text-primary"
          >
            <ArrowLeft size={30} /> Back
          </button>
          <SiteLogo />
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-secondary hover:brightness-90">
              <WhatsappIcon size={40} />
            </a>
          ) : (
            <span className="w-5.5" />
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default SinglePageLayout;