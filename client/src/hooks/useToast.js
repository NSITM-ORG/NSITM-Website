/**
 * useToast — Thin convenience wrapper over uiSlice's toast actions
 * (accessed via useManageState, never directly). Most error toasts fire
 * automatically via toastMiddleware (Batch F2) — this hook exists for
 * SUCCESS toasts and any manual override a component wants.
 *
 * Position handling (bottom-right desktop / top-center mobile) is a
 * CSS/layout concern implemented in the <ToastContainer/> component
 * itself (Batch F4), not here — this hook only dispatches the data.
 */

import { useCallback } from 'react';
import { useManageState } from './useManageState.js';

export function useToast() {
  const { ui, actions } = useManageState();

  const showSuccess = useCallback(
    (message, duration) => actions.addToast({ type: 'success', message, duration }),
    [actions]
  );
  const showError = useCallback(
    (message, duration) => actions.addToast({ type: 'error', message, duration }),
    [actions]
  );
  const showInfo = useCallback(
    (message, duration) => actions.addToast({ type: 'info', message, duration }),
    [actions]
  );
  const dismiss = useCallback((id) => actions.removeToast(id), [actions]);

  return { toasts: ui.toasts, showSuccess, showError, showInfo, dismiss };
}

export default useToast;