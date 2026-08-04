/**
 * CohortCarousel — responsive, auto-advancing carousel showing PAGES of
 * cohort cards (not one card at a time). Prev/Next arrows, dot
 * pagination representing pages with proximity-scaled sizing/opacity
 * for large page counts, autoplay with hover/touch pause, and
 * touch-swipe support — same interaction language as TestimonialsCarousel.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CohortCard } from './CohortCard';
import { useCarouselItemsPerView } from '../../hooks/useCarouselItemsPerView';

export function CohortCarousel({ cohorts, autoPlayInterval = 6000 }) {
  const itemsPerView = useCarouselItemsPerView();
  const pageCount = Math.max(1, Math.ceil(cohorts.length / itemsPerView));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(0), [itemsPerView, cohorts.length]);

  useEffect(() => {
    if (paused || pageCount <= 1) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pageCount), autoPlayInterval);
    return () => clearInterval(t);
  }, [paused, pageCount, autoPlayInterval]);

  const goTo = (p) => setPage(((p % pageCount) + pageCount) % pageCount);
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    if (delta < -50) next();
    touchStartX.current = null;
  };

  if (cohorts.length === 0) return null;

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${page * 100}%)` }}>
          {Array.from({ length: pageCount }).map((_, pageIdx) => (
            <div key={pageIdx} className="grid w-full shrink-0 gap-4 px-1" style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}>
              {cohorts.slice(pageIdx * itemsPerView, pageIdx * itemsPerView + itemsPerView).map((c) => <CohortCard key={c.id} cohort={c} />)}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <>
          <button onClick={prev} aria-label="Previous" className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 hidden h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-text-primary shadow-card hover:bg-surface sm:flex">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} aria-label="Next" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-text-primary shadow-card hover:bg-surface sm:flex">
            <ChevronRight size={18} />
          </button>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => {
              const distance = Math.min(Math.abs(i - page), 3);
              const scale = 1 - distance * 0.2;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className="h-2.5 rounded-full bg-primary transition-all duration-300"
                  style={{ width: i === page ? 22 : 10 * scale, opacity: Math.max(1 - distance * 0.25, 0.25) }}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default CohortCarousel;