/**
 * usePagination — Local page/limit state + derived helpers for any list
 * view backed by the backend's { total, page, limit, totalPages } shape.
 *
 * Deliberately does NOT fetch data itself — it hands back page/limit/
 * setPage so the CALLING component's own useEffect (or a domain-specific
 * fetch on mount) decides when to re-fetch. Keeps this hook reusable
 * across every paginated list in the app (Enrollments, Accounts,
 * Invitations, Join Requests, FAQs, Audit trails, Programme category
 * pages) without baking in any one domain's fetch thunk.
 */

import { useCallback, useMemo, useState } from 'react';

export function usePagination({ initialPage = 1, initialLimit = 25, serverPagination } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = serverPagination?.totalPages ?? 1;
  const total = serverPagination?.total ?? 0;

  const canGoNext = page < totalPages;
  const canGoPrevious = page > 1;

  const goToPage = useCallback(
    (target) => {
      const clamped = Math.max(1, Math.min(target, totalPages || 1));
      setPage(clamped);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => canGoNext && setPage((p) => p + 1), [canGoNext]);
  const previousPage = useCallback(() => canGoPrevious && setPage((p) => p - 1), [canGoPrevious]);
  const resetToFirstPage = useCallback(() => setPage(1), []);

  const pageNumbers = useMemo(() => {
    // Simple windowed page-number list (max 5 visible), for a numeric
    // pagination control rather than just Prev/Next.
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [page, totalPages]);

  return {
    page,
    limit,
    total,
    totalPages,
    canGoNext,
    canGoPrevious,
    pageNumbers,
    setLimit,
    goToPage,
    nextPage,
    previousPage,
    resetToFirstPage,
  };
}

export default usePagination;