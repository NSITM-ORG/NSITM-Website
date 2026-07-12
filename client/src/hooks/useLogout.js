/**
 * useLogout — "Decentralized trigger, centralized modal" (build
 * instruction #18).
 *
 * ANY component, anywhere in the panel (Sidebar, TopNav, a session-
 * timeout prompt, etc.) can call requestLogout() to open the ONE shared
 * <LogoutModal/> (mounted once at App root — Batch F5). The modal itself
 * owns the actual confirm/cancel UI and calls confirmLogout() on confirm.
 * This means the confirmation UX is defined exactly once, but is
 * reachable from an unlimited number of trigger points without prop-
 * drilling a callback down to each one.
 */

import { useCallback } from 'react';
import { useManageState } from './useManageState.js';
import { useModal } from './useModal.js';

export function useLogout() {
  const { actions } = useManageState();
  const { isOpen, open, close } = useModal('logout');

  const requestLogout = useCallback(() => open(), [open]);

  const confirmLogout = useCallback(async () => {
    try {
      await actions.logout();
    } finally {
      close();
      window.dispatchEvent(new CustomEvent('nsitm:redirect-to-login'));
    }
  }, [actions, close]);

  return { isLogoutModalOpen: isOpen, requestLogout, confirmLogout, cancelLogout: close };
}

export default useLogout;