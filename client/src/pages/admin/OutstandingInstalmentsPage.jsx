/**
 * OutstandingInstalmentsPage — /admin/instalments/outstanding. Per FRD
 * FR-10.4, overdue records are already sorted to the top by the backend
 * (getOutstandingInstalments controller); the frontend renders in the
 * order received without re-sorting.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { usePagination } from '../../hooks/usePagination';
import { StatusBadge } from '../../components/panel/StatusBadge';
import { SkeletonTableRow } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard } from 'lucide-react';

export function OutstandingInstalmentsPage() {
  const { instalments, actions } = useManageState();
  const navigate = useNavigate();
  const pagination = usePagination({ serverPagination: instalments.outstandingPagination });

  useSEO({ title: 'Outstanding Instalments' });

  useEffect(() => {
    actions.fetchOutstandingInstalments(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Outstanding Instalments</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Instalment students with at least one unconfirmed payment. Overdue records appear first.
        </p>
      </div>

      {instalments.loading ? (
        <table className="w-full text-sm">
          <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} columns={6} />)}</tbody>
        </table>
      ) : instalments.outstandingList.length === 0 ? (
        <EmptyState icon={CreditCard} title="No outstanding instalments" description="All instalment students are up to date." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Instalment #</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {instalments.outstandingList.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => navigate(`/admin/enrollments/${record.enrollment?.id}`)}
                  className={`cursor-pointer hover:bg-surface ${record.isOverdue ? 'bg-error/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{record.enrollment?.profile?.fullName}</p>
                    <p className="text-xs text-text-secondary">{record.enrollment?.profile?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{record.enrollment?.programme?.name}</td>
                  <td className="px-4 py-3">{record.instalmentNumber}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(record.expectedAmount)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(record.dueDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.status} isOverdue={record.isOverdue} kind="instalment" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageNumbers={pagination.pageNumbers}
        canGoNext={pagination.canGoNext}
        canGoPrevious={pagination.canGoPrevious}
        onGoToPage={pagination.goToPage}
        onNext={pagination.nextPage}
        onPrevious={pagination.previousPage}
      />
    </div>
  );
}

export default OutstandingInstalmentsPage;