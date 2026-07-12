/**
 * PendingReviewsPage — /admin/enrollments/pending. Pre-filtered to
 * Pending, oldest-first, matching the payment review workflow priority.
 */

import { useEffect } from 'react';
import { useManageState } from '../../hooks/useManageState.js';
import { useSEO } from '../../hooks/useSEO.js';
import { usePagination } from '../../hooks/usePagination.js';
import { StudentTable } from '../../components/panel/StudentTable.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';

export function PendingReviewsPage() {
  const { enrollments, actions } = useManageState();
  const pagination = usePagination({ serverPagination: enrollments.pagination });

  useSEO({ title: 'Pending Reviews' });

  useEffect(() => {
    actions.fetchAllEnrollments({ status: 'pending', page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Pending Reviews</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enrollment receipts awaiting confirmation. Sorted oldest first.
        </p>
      </div>

      <StudentTable records={enrollments.list} loading={enrollments.loading} />

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

export default PendingReviewsPage;