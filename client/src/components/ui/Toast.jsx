/**
 * Toast + ToastContainer — the app-wide notification system.
 *
 * Position per the design spec: bottom-right on desktop, top-center on
 * mobile — handled with pure Tailwind responsive classes (fixed
 * positioning that flips at the `sm` breakpoint), no separate mobile
 * component needed.
 *
 * Mounted once at App root (Batch F5), reading directly from
 * useManageState (via useToast) — no props needed from the parent.
 */

import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast.js';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLOR_CLASSES = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-info/30 bg-info/10 text-info',
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`
        flex items-center gap-3 rounded-md border px-4 py-3 shadow-elevated
        bg-surface-elevated animate-[fadeIn_200ms_ease-out]
        ${COLOR_CLASSES[toast.type] || COLOR_CLASSES.info}
      `}
    >
      <Icon size={20} className="shrink-0" />
      <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-text-secondary hover:text-text-primary">
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="
        fixed z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm
        top-4 left-1/2 -translate-x-1/2
        sm:top-auto sm:left-auto sm:translate-x-0 sm:bottom-4 sm:right-4
      "
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;