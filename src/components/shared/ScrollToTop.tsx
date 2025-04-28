// Added "use client" because this component uses hooks and browser APIs
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Changed from useLocation

const ScrollToTop = () => {
  const pathname = usePathname(); // Use usePathname hook

  useEffect(() => {
    // Scroll to the top of the window on route change
    try {
      // Check if window is defined (it should be in useEffect, but good practice)
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth' // Optional: Add smooth scrolling
        });
      }
    } catch (error) {
      console.error("ScrollToTop error:", error);
      // Fallback for older browsers or environments where scrollTo might fail
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // For older browsers
    }
  }, [pathname]); // Dependency array ensures this runs only when the pathname changes

  return null; // This component does not render any UI
};

export default ScrollToTop;
