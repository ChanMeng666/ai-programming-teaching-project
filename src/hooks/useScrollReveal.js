import { useEffect } from 'react';

/**
 * useScrollReveal — reveals `.mm-reveal` / `.mm-reveal-stagger` elements as they
 * scroll into view by toggling the `is-visible` class (styled in animations.css).
 *
 * Contract (consumed verbatim by the homepage, message board, capstone & feeds):
 *   - SSR-safe: no-ops when `window` is undefined.
 *   - Re-runs when `deps` change (e.g. async content mounting new reveal nodes).
 *   - Reduced-motion: immediately marks every reveal element visible, no observer.
 *   - Otherwise: IntersectionObserver(threshold 0.15, rootMargin '0px 0px -10% 0px')
 *     over reveal elements lacking `is-visible`; reveals + unobserves on intersect;
 *     disconnects on cleanup.
 *
 * @param {ReadonlyArray<unknown>} [deps] dependency list forwarded to useEffect
 */
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const selector = '.mm-reveal, .mm-reveal-stagger';

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document
        .querySelectorAll(selector)
        .forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const elements = Array.from(document.querySelectorAll(selector)).filter(
      (el) => !el.classList.contains('is-visible')
    );

    if (elements.length === 0) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
