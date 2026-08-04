/**
 * src/components/site/TestimonialsCarousel.jsx
 *
 * TestimonialsCarousel — lightweight custom carousel (no owl-carousel /
 * jQuery), built with plain React state + CSS transform. Mirrors the
 * reference's .testi_home_area / .testimonial rounded-card pattern.
 *
 * Auto-advances every 6s, pausable on hover, with dot navigation,
 * prev/next buttons, and touch-swipe support via simple pointer-event
 * delta tracking (no external swipe library).
 *
 * Content is static placeholder testimonial data — no backend model
 * exists for testimonials in current scope; structured as a typed array
 * so wiring to a future backend-driven testimonials endpoint is a
 * single data-source swap, not a component rewrite.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Chidinma Eze',
    role: 'Fullstack Web Development, 2025 Cohort',
    quote: 'I came in knowing almost nothing about code. The small cohort size meant my instructor actually knew where I was struggling — I left with a portfolio I was genuinely proud of.',
  },
  {
    name: 'Tunde Bakare',
    role: 'Digital Marketing, 2024 Cohort',
    quote: 'The practical, project-based approach is what set Nextserve apart for me. I wasn\'t just learning theory — by the third month I was running real campaigns.',
  },
  {
    name: 'Amara Nwosu',
    role: 'UI/UX Design, 2025 Cohort',
    quote: 'Fourteen years of experience really shows in how the curriculum is structured. Every module built on the last — nothing felt random or filler.',
  },
  {
    name: 'Ibrahim Yusuf',
    role: 'Cyber Security, Online Cohort',
    quote: 'Enrolling online from outside Lagos was seamless. The instructors made sure the online cohort got the exact same attention as the in-person classes.',
  },
];

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const goPrev = () =>
    setActive((a) => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const goNext = () =>
    setActive((a) => (a + 1) % TESTIMONIALS.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) goPrev();
    if (delta < -50) goNext();
    touchStartX.current = null;
  };

  return (
    <section className="bg-surface/50 py-10 sm:py-12">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-secondary bg-secondary/10 px-4 py-1.5 rounded-full inline-block">
            Student Success Stories
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mt-2">
            What Our Students Are Saying
          </h2>
        </header>

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Prev button */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 sm:-translate-x-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-surface-elevated text-primary shadow-card-lift transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 sm:translate-x-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-surface-elevated text-primary shadow-card-lift transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          <div className="overflow-hidden p-2">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-2">
                  <div className="relative rounded-3xl border border-primary/30 bg-surface-elevated p-8 shadow-card-lift sm:p-10 overflow-hidden">
                    <div className="absolute top-4 right-6 text-7xl font-serif text-primary/10 select-none">
                      “
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary border border-secondary/20">
                        Verified Alumni
                      </span>
                    </div>
                    <p className="mb-8 text-base sm:text-lg leading-relaxed text-text-primary font-medium">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4 border-t border-primary/30 pt-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-heading font-extrabold text-lg shadow-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary text-base">
                          {t.name}
                        </p>
                        <p className="text-xs font-semibold text-text-secondary">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-2.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-3 rounded-full transition-all duration-300 ${
                  active === i
                    ? 'w-8 bg-primary shadow-sm'
                    : 'w-3 bg-border hover:bg-primary/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;