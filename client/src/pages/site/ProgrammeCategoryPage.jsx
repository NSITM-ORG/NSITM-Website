/**
 * ProgrammeCategoryPage — Stack ii: full paginated listing for one
 * category, using GET /public/programmes/category/:category with the
 * responsive limit (4/6/8) from useResponsiveLimit(). Re-fetches when
 * either the page number OR the responsive limit changes (e.g. resizing
 * the browser mid-session recalculates the page size and refetches page 1
 * to avoid a mismatched partial page).
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { useResponsiveLimit } from '../../hooks/useResponsiveLimit';
import { usePagination } from '../../hooks/usePagination';
import { ProgrammeCard } from '../../components/site/ProgrammeCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { PROGRAMME_CATEGORY_LABELS } from '../../utils/constants';
import { BookOpen } from 'lucide-react';

export function ProgrammeCategoryPage() {
  const { category } = useParams();
  const { programmes, actions } = useManageState();
  const limit = useResponsiveLimit();
  const pagination = usePagination({ serverPagination: programmes.pagination, initialLimit: limit });

  const categoryLabel = PROGRAMME_CATEGORY_LABELS[category] || 'Programmes';

  useSEO({ title: categoryLabel, description: `All ${categoryLabel} programmes offered by Nextserve.` });

  useEffect(() => {
    actions.fetchProgrammesByCategory({ category, page: pagination.page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, pagination.page, limit]);

  useEffect(() => {
    // Limit changed (viewport resize) — snap back to page 1 to avoid a
    // stale page number that no longer makes sense at the new page size.
    pagination.resetToFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
      <Link to="/programmes" className="mb-6 flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary">
        <ChevronLeft size={16} /> All Programmes
      </Link>

      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">{categoryLabel} Programmes</h1>

      {programmes.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : programmes.adminList.length === 0 ? (
        <EmptyState icon={BookOpen} title="No programmes in this category yet" description="Please check back soon." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {programmes.adminList.map((programme) => (
              <ProgrammeCard key={programme.id} programme={programme} />
            ))}
          </div>
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
        </>
      )}
    </div>
  );
}

export default ProgrammeCategoryPage;