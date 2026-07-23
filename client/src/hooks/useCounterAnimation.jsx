/**
 * src/hooks/useCounterAnimation.js
 *
 * useCounterAnimation — simple requestAnimationFrame count-up from 0 to
 * a target number, triggered once the element scrolls into view (via
 * IntersectionObserver). Powers the Counter section's animated numbers
 * without pulling in a counter/animation library.
 */

import { useEffect, useRef, useState } from 'react';

export function useCounterAnimation(targetValue, { duration = 1500 } = {}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const startTime = performance.now();

          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplayValue(Math.round(eased * targetValue));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [targetValue, duration, hasAnimated]);

  return { displayValue, elementRef };
}

export default useCounterAnimation;