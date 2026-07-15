/**
 * useResponsiveLimit — Returns the correct programme-listing page size
 * for the current viewport width, per the confirmed decision:
 *   mobile (<640px): 4 · tablet (640–1023px): 6 · desktop (≥1024px): 8
 *
 * Used by ProgrammesPage and ProgrammeCategoryPage to pass the right
 * `limit` query param to the paginated backend endpoint. Re-evaluates on
 * window resize (debounced via a simple timeout) so rotating a tablet or
 * resizing a browser window updates the page size live.
 */

import { useEffect, useState } from 'react';
import { PROGRAMME_PAGE_SIZE } from '../utils/constants';

function getLimitForWidth(width) {
  if (width < 640) return PROGRAMME_PAGE_SIZE.mobile;
  if (width < 1024) return PROGRAMME_PAGE_SIZE.tablet;
  return PROGRAMME_PAGE_SIZE.desktop;
}

export function useResponsiveLimit() {
  const [limit, setLimit] = useState(() => getLimitForWidth(window.innerWidth));

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setLimit(getLimitForWidth(window.innerWidth)), 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return limit;
}

export default useResponsiveLimit;