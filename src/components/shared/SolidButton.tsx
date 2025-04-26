import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Changed from 'next/link'
import { LucideIcon } from 'lucide-react';
import React from 'react'; // Added React import

interface SolidButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}

export function SolidButton({
  href,
  icon: Icon,
  label,
  external
}: SolidButtonProps) {
  // Use standard anchor tag for external links, Link component for internal
  const ButtonWrapper = external ? motion.a : motion(Link);
  const commonProps = {
    whileHover: { scale: 1.05 }, // Simplified animation slightly
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 } // Adjusted spring
  };
  const linkProps = external ? {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    ...commonProps
  } : {
    to: href, // Use 'to' for react-router-dom Link
    ...commonProps
  };

  return (
    <Button
      asChild
      size="lg"
      // Adapted to teal theme, using existing button styles as base
      className="group relative rounded-full px-6 py-3 overflow-hidden bg-teal-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600"
    >
      <ButtonWrapper {...linkProps}>
         {/* Optional: Add subtle background animation if desired
         <motion.span
           className="absolute inset-0 bg-teal-700 dark:bg-teal-600"
           initial={{ y: "100%" }}
           animate={{ y: "100%" }} // Keep it hidden initially
           whileHover={{ y: 0 }}
           transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
         />
         */}
        <span className="relative z-10 flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          <span>{label}</span>
        </span>
      </ButtonWrapper>
    </Button>
  );
}
