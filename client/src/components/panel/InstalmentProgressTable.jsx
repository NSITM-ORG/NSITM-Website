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
    <div className="rounded-2xl border border-border/80 bg-surface-elevated/90 p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-xl font-bold text-text-primary">Instalment Progress</h3>
        {instalmentSummary.isFullyPaid && (
          <span className="rounded-full bg-success/15 px-3.5 py-1 text-xs font-bold text-success border border-success/30">Fully Paid</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface/80 border-b border-border/70 text-left text-xs uppercase tracking-wider font-extrabold text-text-secondary">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Confirmed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {instalmentSummary.records.map((record) => (
              <>
                <tr key={record.instalmentNumber} className={`transition-colors ${record.isOverdue ? 'bg-error/5' : 'hover:bg-surface/50'}`}>
                  <td className="px-4 py-3 font-semibold text-text-secondary">{record.instalmentNumber}</td>
                  <td className="px-4 py-3 font-bold text-text-primary">{formatCurrency(record.expectedAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} isOverdue={record.isOverdue} kind="instalment" />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-text-secondary">{record.dueDate ? formatDate(record.dueDate) : '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium text-text-secondary">
                    {record.confirmedAt ? formatDate(record.confirmedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {record.status === 'pending' ? (
                      <div className="flex gap-2 items-center">
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
                            className="text-xs font-semibold text-primary underline hover:brightness-110 ml-1"
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
                    <td colSpan={6} className="bg-surface/60 p-4">
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