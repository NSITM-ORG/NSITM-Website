/**
 * SiteLayout — Header → page content → Footer, plus the WhatsApp FAB and
 * Back-to-Top button. Footer is conditionally hidden per-route via
 * route.footer === false (used by the Enrollment page-group... though
 * those actually use SinglePageLayout instead, this flag remains
 * available for any future SiteLayout page that needs it).
 */

import { Outlet, useMatches } from 'react-router-dom';
import { Header } from '../components/site/Header.jsx';
import { Footer } from '../components/site/Footer.jsx';
import { WhatsAppFAB } from '../components/site/WhatsAppFAB.jsx';
import { BackToTop } from '../components/ui/BackToTop.jsx';

export function SiteLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1]?.handle;
  const showFooter = currentRoute?.footer !== false;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
      <WhatsAppFAB />
      <BackToTop />
    </div>
  );
}

export default SiteLayout;