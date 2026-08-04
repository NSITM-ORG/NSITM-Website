/**
 * SiteLayout — Header → page content → Footer, plus the WhatsApp FAB and
 * Back-to-Top button. Footer is conditionally hidden per-route via
 * route.footer === false (used by the Enrollment page-group... though
 * those actually use SinglePageLayout instead, this flag remains
 * available for any future SiteLayout page that needs it).
 */

import { Outlet, useMatches } from 'react-router-dom';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';
import { WhatsAppFAB } from '../components/site/WhatsAppFAB';
import { BackToTop } from '../components/ui/BackToTop';
import { FloatingThemeToggle } from '../components/ui/ThemeToggle';

export function SiteLayout() {
  const matches = useMatches();
  const currentRoute = matches[matches.length - 1]?.handle;
  const showFooter = currentRoute?.footer !== false;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 surface-noise relative z-0">
        <Outlet />
      </main>
      {showFooter && <Footer />}
      <WhatsAppFAB />
      <BackToTop />
      <FloatingThemeToggle />
    </div>
  );
}

export default SiteLayout;