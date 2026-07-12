/**
 * ConfirmModal — the one confirmation dialog used for every destructive
 * or consequential action in the app (delete, deactivate, confirm
 * payment, reverse payment, etc.). Optionally requires typed reason text
 * (used for rejection/reversal reasons, which the backend mandates).
 */

import { useState } from 'react';
import Modal from './Modal.jsx';
import { Button } from './Button.jsx';
import { FormField } from './FormField.jsx';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  variant = 'primary', // 'primary' | 'danger'
  requireReason = false,
  reasonLabel = 'Reason',
  loading = false,
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(null);

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setReasonError('Please provide a reason before continuing.');
      return;
    }
    onConfirm(requireReason ? reason.trim() : undefined);
  };

  const handleClose = () => {
    setReason('');
    setReasonError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="mb-4 flex gap-3">
        <AlertTriangle size={22} className={variant === 'danger' ? 'text-error' : 'text-warning'} />
        <p className="text-sm text-text-secondary">{message}</p>
      </div>

      {requireReason && (
        <FormField
          type="textarea"
          label={reasonLabel}
          value={reason}
          onChange={(v) => {
            setReason(v);
            setReasonError(null);
          }}
          error={reasonError}
          required
          rows={3}
          className="mb-4"
        />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;