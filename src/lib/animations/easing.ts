/**
 * Framer Motion easing functions and animation utilities
 * Provides consistent easing across the application
 */

// Import easing functions from Framer Motion
import { 
  easeIn, 
  easeOut, 
  easeInOut, 
  circOut,
  backOut,
  anticipate
} from "framer-motion";

// Linear easing is a simple function
const linear = (t: number) => t;

// Export commonly used easing functions
export const easingFunctions = {
  easeIn,
  easeOut,
  easeInOut,
  linear,
  circOut,
  backOut,
  anticipate
} as const;

// Common animation variants with proper easing
export const commonVariants = {
  // Section animations
  sectionVariants: {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: easeOut, 
        staggerChildren: 0.1 
      } 
    }
  },

  // Item animations
  itemVariants: {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: easeOut 
      } 
    }
  },

  // Card hover effects
  cardHoverEffect: {
    rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
    hover: { 
      y: -5, 
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", 
      transition: { 
        duration: 0.3, 
        ease: circOut 
      } 
    }
  },

  // Fade animations
  fadeVariants: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        ease: easeOut 
      } 
    }
  },

  // Slide animations
  slideUpVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: easeInOut 
      } 
    }
  }
};

// Common transition configurations
export const commonTransitions = {
  default: { duration: 0.6, ease: easeOut },
  fast: { duration: 0.3, ease: easeOut },
  slow: { duration: 1.2, ease: easeOut },
  spring: { type: "spring", stiffness: 100, damping: 15 },
  bounce: { type: "spring", stiffness: 400, damping: 10 },
  smooth: { duration: 0.4, ease: easeInOut },
  linear: { duration: 1, ease: linear },
  infinite: { duration: 2, repeat: Infinity, ease: easeInOut }
};