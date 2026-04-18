import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Scroll to top on every navigation EXCEPT browser back/forward (POP).
    // POP keeps the previous scroll position so users return where they left off.
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, navigationType]);

  return null;
}
