/**
 * InstalmentProgressTable — Admin-facing instalment breakdown shown on
 * EnrollmentDetailPage for instalment students, per FRD FR-10.4.
 * Confirm/Reject actions appear inline only on Pending rows.
 */

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ReceiptViewer } from './ReceiptViewer';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useManageState } from '../../hooks/useManageState';
import { useToast } from '../../hooks/useToast';

export function InstalmentProgressTable({ instalmentSummary, onUpdated }) {
  const { actions, instalments } = useManageState();
  const { showSuccess } = useToast();
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, action: 'confirmed'|'rejected' }
  const [expandedReceiptId, setExpandedReceiptId] = useState(null);

  if (!instalmentSummary?.records?.length) return null;

  const handleAction = async (reason) => {
    try {
      await actions.updateInstalmentStatus({
        id: confirmTarget.id,
        status: confirmTarget.action,
        rejectionReason: reason,
      });
      showSuccess(`Instalment ${confirmTarget.action} successfully.`);
      setConfirmTarget(null);
      onUpdated?.();
    } catch {
      // error toast already shown centrally
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Instalment Progress</h3>
        {instalmentSummary.isFullyPaid && (
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">Fully Paid</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-text-secondary">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Due Date</th>
              <th className="px-4 py-2.5">Confirmed</th>
              <th className="px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {instalmentSummary.records.map((record) => (
              <>
                <tr key={record.instalmentNumber} className={record.isOverdue ? 'bg-error/5' : ''}>
                  <td className="px-4 py-3">{record.instalmentNumber}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(record.expectedAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} isOverdue={record.isOverdue} kind="instalment" />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{record.dueDate ? formatDate(record.dueDate) : '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {record.confirmedAt ? formatDate(record.confirmedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {record.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setConfirmTarget({ id: record.id, action: 'confirmed' })}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmTarget({ id: record.id, action: 'rejected' })}
                        >
                          Reject
                        </Button>
                        {record.receipt && (
                          <button
                            className="text-xs text-primary underline"
                            onClick={() => setExpandedReceiptId(expandedReceiptId === record.id ? null : record.id)}
                          >
                            {expandedReceiptId === record.id ? 'Hide' : 'View'} Receipt
                          </button>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
                {expandedReceiptId === record.id && (
                  <tr>
                    <td colSpan={6} className="bg-surface p-4">
                      <ReceiptViewer receipt={record.receipt} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleAction}
        title={confirmTarget?.action === 'confirmed' ? 'Confirm Instalment' : 'Reject Instalment'}
        message={
          confirmTarget?.action === 'confirmed'
            ? 'This will confirm the instalment payment and notify the student by email.'
            : 'Please provide a reason. The student will be notified by email with this reason.'
        }
        confirmLabel={confirmTarget?.action === 'confirmed' ? 'Confirm' : 'Reject'}
        variant={confirmTarget?.action === 'rejected' ? 'danger' : 'primary'}
        requireReason={confirmTarget?.action === 'rejected'}
        reasonLabel="Rejection Reason"
        loading={instalments.updating}
      />
    </div>
  );
}

export default InstalmentProgressTable;