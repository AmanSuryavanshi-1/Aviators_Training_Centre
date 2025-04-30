import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the window on route change
    try {
      window.scrollTo(0, 0);
    } catch (error) {
      // Fallback for environments where scrollTo might not be available smoothly
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]); // Dependency array ensures this runs only when the pathname changes

  return null; // This component does not render any UI
};

export default ScrollToTop;
