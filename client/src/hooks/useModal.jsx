/**
 * useModal — Generic open/close control for the small set of GLOBAL
 * modals tracked in uiSlice (confirm, logout, programmeForm, cohortForm).
 *
 * For LOCAL, one-off modals scoped to a single page/component (e.g. a
 * receipt-preview lightbox that only ever appears on EnrollmentDetailPage),
 * plain useState is more appropriate and is used directly in that page
 * rather than being routed through global state — per the plan's
 * "useState for simple local state" tier.
 */

import { useCallback } from 'react';
import { useManageState } from './useManageState';

export function useModal(key) {
  const { ui, actions } = useManageState();

  const open = useCallback(() => actions.openModal(key), [actions, key]);
  const close = useCallback(() => actions.closeModal(key), [actions, key]);
  const toggle = useCallback(
    () => (ui.modals[key] ? close() : open()),
    [ui.modals, key, close, open]
  );

  return { isOpen: !!ui.modals[key], open, close, toggle };
}

export default useModal;