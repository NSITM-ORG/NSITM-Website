/**
 * useCopyToClipboard — Reusable copy-to-clipboard utility (build
 * instruction #14). Uses the modern Clipboard API with a manual
 * document.execCommand fallback for older/insecure (non-HTTPS) contexts
 * where navigator.clipboard is unavailable.
 *
 * Returns a `copied` flag that auto-resets after `resetDelay` ms, handy
 * for driving a "Copied!" label/icon swap without extra component state.
 */

import { useCallback, useRef, useState } from 'react';

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const copy = useCallback(
    async (text) => {
      let success = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          success = true;
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          success = document.execCommand('copy');
          textarea.remove();
        }
      } catch {
        success = false;
      }

      if (success) {
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
      }
      return success;
    },
    [resetDelay]
  );

  return { copied, copy };
}

export default useCopyToClipboard;