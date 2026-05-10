// ScrollToTop.jsx — Reset scroll position on every route change
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, key, state } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useLayoutEffect(() => {
    // If navigation provided an explicit scrollTarget, don't override it here —
    // let the destination component handle scrolling after it mounts.
    if (state?.scrollTarget) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, key, state]);

  return null;
}
