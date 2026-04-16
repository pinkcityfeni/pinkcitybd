import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top on PUSH (new navigation), not on POP (back/forward)
    if (navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}
