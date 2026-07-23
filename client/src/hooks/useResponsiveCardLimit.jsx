/**
 * src/hooks/useResponsiveCardLimit.js
 *
 * useResponsiveCardLimit — implements the client's exact home-page grid
 * rule (distinct from the earlier F6 useResponsiveLimit, which serves
 * the /programmes pagination endpoint's 4/6/8 limit):
 *
 *   <640px         → 1 column,  max 3 cards
 *   640–1023px     → 2 columns, max 4 cards
 *   1024–1279px    → 3 columns, max 6 cards
 *   ≥1280px        → 4 columns, max 8 cards
 *
 * "Adjustable if odd numbers exist" is implemented as: if the available
 * item count is less than the cap, trim to the largest multiple of the
 * column count that fits, so no dangling half-filled final row appears
 * (e.g. 3 columns, 7 available → shows 6, not 7).
 */

import { useEffect, useState } from 'react';

const BREAKPOINTS = [
  { maxWidth: 640, columns: 1, cap: 3 },
  { maxWidth: 1024, columns: 2, cap: 4 },
  { maxWidth: 1280, columns: 3, cap: 6 },
  { maxWidth: Infinity, columns: 4, cap: 8 },
];

function resolveForWidth(width) {
  return BREAKPOINTS.find((bp) => width < bp.maxWidth) || BREAKPOINTS[BREAKPOINTS.length - 1];
}

export function useResponsiveCardLimit(availableCount) {
  const [config, setConfig] = useState(() => resolveForWidth(window.innerWidth));

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setConfig(resolveForWidth(window.innerWidth)), 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const rawCount = Math.min(availableCount, config.cap);
  // Trim to nearest full row (multiple of columns) unless that would
  // leave zero items, in which case show whatever's available.
  const trimmed = rawCount >= config.columns
    ? rawCount - (rawCount % config.columns) || config.columns
    : rawCount;

  return { columns: config.columns, limit: trimmed };
}

export default useResponsiveCardLimit;