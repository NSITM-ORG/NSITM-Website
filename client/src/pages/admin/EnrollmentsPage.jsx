/**
 * EnrollmentsPage — /admin/enrollments. Full filterable, paginated
 * student record list (FRD FR-04.3). Reads an initial ?status= query
 * param (set by DashboardPage metric card links) to pre-apply a filter
 * on first load.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { usePagination } from '../../hooks/usePagination';
import { EnrollmentFilterBar } from '../../components/panel/EnrollmentFilterBar';
import { StudentTable } from '../../components/panel/StudentTable';
import { Pagination } from '../../components/ui/Pagination';

const EMPTY_FILTERS = { status: '', programme: '', cohort: '', fromDate: '', toDate: '', search: '' };

export function EnrollmentsPage() {
  const [searchParams] = useSearchParams();
  const { enrollments, actions } = useManageState();
  const pagination = usePagination({ serverPagination: enrollments.pagination });

  useSEO({ title: 'All Enrollments' });

  useEffect(() => {
    const initialStatus = searchParams.get('status');
    if (initialStatus) actions.setEnrollmentFilters({ status: initialStatus });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    actions.fetchAllEnrollments({ ...enrollments.filters, page: pagination.page, limit: 25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments.filters, pagination.page]);

  const handleFilterChange = (patch) => {
    actions.setEnrollmentFilters(patch);
    pagination.resetToFirstPage();
  };

  const handleClear = () => {
    actions.setEnrollmentFilters(EMPTY_FILTERS);
    pagination.resetToFirstPage();
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">All Enrollments</h1>

      <EnrollmentFilterBar filters={enrollments.filters} onChange={handleFilterChange} onClear={handleClear} />

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

export default EnrollmentsPage;