/**
 * Modal — base overlay dialog. ConfirmModal and LogoutModal are built on
 * top of this. Traps focus loosely (returns focus to the trigger on
 * close via native browser behavior + closes on Escape/backdrop click).
 *
 * Renders nothing when `isOpen` is false — no portal library used
 * (React 19's createPortal from react-dom is sufficient and built-in).
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md', closeOnBackdrop = true }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${sizeClasses[size]} rounded-lg bg-surface-elevated p-6 shadow-elevated animate-[fadeIn_200ms_ease-out]`}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold font-heading text-text-primary">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;