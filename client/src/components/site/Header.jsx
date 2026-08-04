/**
 * src/components/site/Header.jsx — removes the redundant Pages dropdown
 * (FAQs was duplicated — already a flat nav link via siteRoutes.js).
 * Adds a conditional "Cohorts" link, visible only when at least one
 * Active or Completed cohort exists anywhere in the system.
 */

import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { siteRoutes } from '../../routes/siteRoutes';
import { TopContactBanner } from './TopContactBanner';
import { useManageState } from '../../hooks/useManageState';
import SiteLogo from '../assets/SiteLogo';

const navLinks = siteRoutes.filter((r) => r.showInNav);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cohorts, actions } = useManageState();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!cohorts.cohortsExistChecked) actions.checkCohortsExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <TopContactBanner />

      <div className={`transition-all duration-300 ${scrolled ? 'glass-header shadow-elevated py-3' : 'bg-surface-elevated/95 backdrop-blur-md py-4'}`}>
        <div className="mx-auto flex max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <SiteLogo />

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.id} to={link.path} className={({ isActive }) => `link-underline text-[15px] font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-primary hover:text-primary'}`}>
                {link.navLabel || link.meta?.title}
              </NavLink>
            ))}
            {cohorts.cohortsExist && (
              <NavLink to="/cohorts" className={({ isActive }) => `link-underline text-[15px] font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-primary hover:text-primary'}`}>
                Cohorts
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/enroll" className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.97] sm:inline-flex items-center justify-center">
              Enroll Now
            </Link>
            <button onClick={() => setMobileOpen((o) => !o)} className="rounded-lg p-2 text-text-primary hover:bg-surface transition-colors lg:hidden" aria-label="Toggle menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border/60 bg-surface-elevated/98 backdrop-blur-lg px-6 py-4 lg:hidden animate-in fade-in duration-200">
            {navLinks.map((link) => (
              <NavLink key={link.id} to={link.path} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold text-text-primary hover:text-primary transition-colors">
                {link.navLabel || link.meta?.title}
              </NavLink>
            ))}
            {cohorts.cohortsExist && (
              <NavLink to="/cohorts" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-semibold text-text-primary hover:text-primary transition-colors">
                Cohorts
              </NavLink>
            )}
            <Link to="/enroll" onClick={() => setMobileOpen(false)} className="mt-3 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-md hover:brightness-110">
              Enroll Now
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;