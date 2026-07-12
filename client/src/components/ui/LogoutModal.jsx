/**
 * LogoutModal — the ONE shared logout confirmation dialog (build
 * instruction #18). Mounted once at App root (Batch F5). Any component
 * calls useLogout().requestLogout() to open it; this component itself
 * owns the confirm/cancel wiring via the same hook.
 */

import { useLogout } from '../../hooks/useLogout.js';
import ConfirmModal from './ConfirmModal.jsx';

export function LogoutModal() {
  const { isLogoutModalOpen, confirmLogout, cancelLogout } = useLogout();

  return (
    <ConfirmModal
      isOpen={isLogoutModalOpen}
      onClose={cancelLogout}
      onConfirm={confirmLogout}
      title="Log out"
      message="Are you sure you want to log out of your account?"
      confirmLabel="Log Out"
      variant="danger"
    />
  );
}

export default LogoutModal;