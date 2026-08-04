/**
 * Pagination — numeric page control driven by usePagination()'s output.
 * Used for data-heavy dashboard lists per the "pagination for dashboards"
 * spec (infinite scroll is reserved for content/media, not used anywhere
 * in this admin-heavy application).
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, pageNumbers, canGoPrevious, canGoNext, onGoToPage, onNext, onPrevious }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="rounded-sm p-2 text-text-secondary hover:bg-surface disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {pageNumbers[0] > 1 && (
        <>
          <PageButton number={1} active={page === 1} onClick={() => onGoToPage(1)} />
          {pageNumbers[0] > 2 && <span className="px-1 text-text-secondary">…</span>}
        </>
      )}

      {pageNumbers.map((n) => (
        <PageButton key={n} number={n} active={n === page} onClick={() => onGoToPage(n)} />
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-1 text-text-secondary">…</span>
          )}
          <PageButton number={totalPages} active={page === totalPages} onClick={() => onGoToPage(totalPages)} />
        </>
      )}

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-sm p-2 text-text-secondary hover:bg-surface disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

function PageButton({ number, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        h-8 w-8 rounded-sm text-sm font-medium transition-colors
        ${active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}
      `}
    >
      {number}
    </button>
  );
}

export default Pagination;