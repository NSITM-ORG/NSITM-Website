/**
 * StudentTable — the shared enrollment-record list table used by
 * EnrollmentsPage, PendingReviewsPage, and (in a slightly different
 * column configuration) NotPaidPage.
 *
 * `variant="notPaid"` swaps in the phone/WhatsApp columns visible
 * directly in the list per FRD FR-04.4, instead of the standard
 * programme/cohort/payment-type columns.
 */

import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { SkeletonTableRow } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Users } from 'lucide-react';

export function StudentTable({ records, loading, variant = 'default' }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}
        </tbody>
      </table>
    );
  }

  if (!records || records.length === 0) {
    return <EmptyState icon={Users} title="No records found" description="Try adjusting your filters." />;
  }

  const isNotPaid = variant === 'notPaid';

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-surface text-left text-text-secondary">
          <tr>
            <th className="px-4 py-3">Student</th>
            {isNotPaid ? (
              <>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">WhatsApp</th>
              </>
            ) : (
              <>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Payment Type</th>
              </>
            )}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((r) => (
            <tr
              key={r.id}
              onClick={() => navigate(`/admin/enrollments/${r.id}`)}
              className="cursor-pointer transition-colors hover:bg-surface"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-text-primary">{r.profile?.fullName}</p>
                <p className="text-xs text-text-secondary">{r.profile?.email}</p>
              </td>
              {isNotPaid ? (
                <>
                  <td className="px-4 py-3">
                    <a href={`tel:${r.profile?.phone}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">
                      {r.profile?.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{r.profile?.whatsappNumber || '—'}</td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-text-secondary">{r.programme?.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.cohort?.name || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {r.paymentType ? (r.paymentType === 'full' ? 'Full Payment' : 'Instalment') : '—'}
                    {r.depositAmount ? ` · ${formatCurrency(r.depositAmount)}` : ''}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-text-secondary">{formatDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.paymentStatus} isPartialEnrollment={r.isPartialEnrollment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;