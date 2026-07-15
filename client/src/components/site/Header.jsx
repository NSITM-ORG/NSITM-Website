/**
 * Header — Public site navigation. Sticky with backdrop-blur on scroll
 * (per micro-interaction spec: "background blur, bottom border shift on
 * scroll"). Collapses to a hamburger drawer under the md breakpoint.
 *
 * Nav links are pulled directly from siteRoutes.js (filtered to
 * access:'allow' + a `showInNav: true` flag) rather than hardcoded here —
 * adding/removing a public page from the header nav is a route-array
 * edit, not a component edit.
 */

import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { siteRoutes } from '../../routes/siteRoutes';
import { ThemeToggle } from '../ui/ThemeToggle';

const navLinks = siteRoutes.filter((r) => r.showInNav);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-40 transition-all duration-200
        ${scrolled ? 'border-b border-border bg-surface-elevated/80 backdrop-blur-md shadow-card' : 'bg-transparent'}
      `}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/nsitm-logo.svg" alt="Nextserve" className="h-9 w-9" />
          <span className="font-heading text-lg font-bold text-primary">Nextserve</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                `link-underline text-sm font-medium ${isActive ? 'text-primary' : 'text-text-primary'}`
              }
            >
              {link.navLabel || link.meta?.title}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/enroll"
            className="hidden rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-90 active:scale-[0.98] sm:inline-flex"
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
              className="block py-2.5 text-sm font-medium text-text-primary"
            >
              {link.navLabel || link.meta?.title}
            </NavLink>
          ))}
          <Link
            to="/enroll"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Enroll Now
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;