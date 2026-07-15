/**
 * useTextEllipsis — Truncate-with-tooltip utility (build instruction #14).
 *
 * Rather than relying purely on CSS text-overflow (which can't easily
 * offer a "hover to see full text" affordance without extra markup every
 * time), this hook returns a ready-to-spread props object:
 *
 *   const { displayText, isTruncated, titleProps } = useTextEllipsis(longString, 40);
 *   <span {...titleProps}>{displayText}</span>
 *
 * `titleProps` includes a native `title` attribute (browser-native
 * tooltip, zero extra JS) only when truncation actually occurred —
 * avoids a redundant tooltip on text that already fits.
 */

import { useMemo } from 'react';

export function useTextEllipsis(text = '', maxLength = 50) {
  return useMemo(() => {
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? `${text.slice(0, maxLength).trimEnd()}…` : text;
    return {
      displayText,
      isTruncated,
      titleProps: isTruncated ? { title: text } : {},
    };
  }, [text, maxLength]);
}

export default useTextEllipsis;