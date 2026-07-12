/**
 * BackToTop — fades in after 400px scroll, per the design spec.
 * Only relevant on SiteLayout pages (long-scrolling public content) —
 * not mounted in PanelLayout, where content areas are typically list/
 * table-scrolled within a fixed viewport instead.
 */

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="
        fixed bottom-20 right-4 z-40 rounded-full bg-primary p-3 text-white shadow-elevated
        transition-all duration-200 hover:brightness-90 active:scale-95
        sm:bottom-6 sm:right-6
      "
    >
      <ArrowUp size={20} />
    </button>
  );
}

export default BackToTop;