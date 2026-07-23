/**
 * src/hooks/useImageFallback.js
 *
 * useImageFallback — since no Programme/institutional image-upload
 * system exists in current scope, this hook provides a graceful,
 * three-tier fallback chain for any image reference used across
 * AboutPage/ProgrammeDetailPage:
 *
 *   1. A real src (if one is ever supplied — e.g. a future CDN URL)
 *   2. A local /public asset path (if one exists at build time)
 *   3. null — caller renders a solid-color/gradient placeholder block
 *      instead of an <img> tag entirely, avoiding a broken-image icon
 *
 * This is intentionally NOT an <img onError> handler (which still
 * flashes a broken-image icon before falling back) — the check happens
 * BEFORE render via a HEAD-less Image() preload probe, so the fallback
 * decision is made silently.
 */

import { useEffect, useState } from 'react';

export function useImageFallback(candidateSrc) {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!candidateSrc) {
      setResolvedSrc(null);
      setChecked(true);
      return;
    }

    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) {
        setResolvedSrc(candidateSrc);
        setChecked(true);
      }
    };
    probe.onerror = () => {
      if (!cancelled) {
        setResolvedSrc(null);
        setChecked(true);
      }
    };
    probe.src = candidateSrc;

    return () => {
      cancelled = true;
    };
  }, [candidateSrc]);

  return { resolvedSrc, hasImage: !!resolvedSrc, checked };
}

export default useImageFallback;