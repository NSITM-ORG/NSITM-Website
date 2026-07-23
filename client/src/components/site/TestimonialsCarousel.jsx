/**
 * src/components/site/TestimonialsCarousel.jsx
 *
 * TestimonialsCarousel — lightweight custom carousel (no owl-carousel /
 * jQuery), built with plain React state + CSS transform. Mirrors the
 * reference's .testi_home_area / .testimonial rounded-card pattern.
 *
 * Auto-advances every 6s, pausable on hover, with dot navigation and
 * touch-swipe support via simple pointer-event delta tracking (no
 * external swipe library).
 *
 * Content is static placeholder testimonial data — no backend model
 * exists for testimonials in current scope; structured as a typed array
 * so wiring to a future backend-driven testimonials endpoint is a
 * single data-source swap, not a component rewrite.
 */

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

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

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) setActive((a) => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    if (delta < -50) setActive((a) => (a + 1) % TESTIMONIALS.length);
    touchStartX.current = null;
  };

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Testimonial</p>
          <h2 className="font-heading text-3xl font-bold text-text-primary">What Our Students Are Saying</h2>
        </header>

        <div
          className="relative mx-auto max-w-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-2">
                  <div className="rounded-lg border border-border bg-surface-elevated p-8 shadow-card sm:p-10">
                    <div className="mb-4 flex items-center gap-1 text-warning">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="mb-6 text-lg leading-relaxed text-text-primary">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading font-bold text-primary">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{t.name}</p>
                        <p className="text-xs text-text-secondary">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${active === i ? 'w-6 bg-primary' : 'w-2.5 bg-border'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;