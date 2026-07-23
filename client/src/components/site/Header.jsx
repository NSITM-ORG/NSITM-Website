/**
 * src/components/site/Header.jsx (REPLACES the F5 version)
 *
 * Header — fuses our F5 nav (route-array-driven links, mobile drawer,
 * sticky-blur) with the reference `.site-navigation` structural pattern:
 * logo-mark + logo-name/logo-sub two-line lockup, dropdown-capable nav
 * items, and the TopContactBanner mounted directly above it.
 *
 * Renders TopContactBanner as a sibling above the nav row — the two
 * together form the full header block, matching the reference's
 * `.top_header_banner` (containing both `.logo-contact` and
 * `#navigation`) as one visual unit.
 */

import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { siteRoutes } from '../../routes/siteRoutes';
import { TopContactBanner } from './TopContactBanner';

const navLinks = siteRoutes.filter((r) => r.showInNav);

// Reference-pattern dropdown group — kept minimal since our route set
// doesn't need deep nesting, but structurally available for FAQ/Cohorts
// grouping if desired later.
const PAGES_DROPDOWN = [
  { label: 'Active Cohorts', to: '/cohorts' },
  { label: 'FAQs', to: '/faq' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <TopContactBanner />

      <div
        className={`
          transition-all duration-200
          ${scrolled ? 'border-b border-border bg-surface-elevated/90 backdrop-blur-md shadow-card' : 'bg-surface-elevated'}
        `}
      >
        <div className="mx-auto flex h-[var(--nav-height)] max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Logo lockup (reference: .site-logo / .logo-mark / .logo-text) ── */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/nsitm-logo.svg" alt="Nextserve" className="h-12 w-12 rounded-md object-contain" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-lg font-bold text-primary">Nextserve</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                School of IT &amp; Management
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────── */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.id}
                to={link.path}
                className={({ isActive }) =>
                  `link-underline text-[15px] font-semibold ${isActive ? 'text-primary' : 'text-text-primary'}`
                }
              >
                {link.navLabel || link.meta?.title}
              </NavLink>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setPagesOpen(true)}
              onMouseLeave={() => setPagesOpen(false)}
            >
              <button className="flex items-center gap-1 text-[15px] font-semibold text-text-primary">
                Pages <ChevronDown size={14} className={`transition-transform ${pagesOpen ? 'rotate-180' : ''}`} />
              </button>
              {pagesOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border border-border bg-surface-elevated py-2 shadow-elevated">
                  {PAGES_DROPDOWN.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/enroll"
              className="hidden rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98] sm:inline-flex"
            >
              Enroll Now
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-sm p-2 text-text-primary md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border bg-surface-elevated px-4 py-3 md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.id}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold text-text-primary"
              >
                {link.navLabel || link.meta?.title}
              </NavLink>
            ))}
            {PAGES_DROPDOWN.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-medium text-text-secondary"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/enroll"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Enroll Now
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;