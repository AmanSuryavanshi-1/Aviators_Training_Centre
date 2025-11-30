// Using "use client" because motion(Link) involves client-side interaction
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Changed import to next/link
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface SolidButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  mobileLabel?: string; // Optional shorter label for mobile
  external?: boolean;
  className?: string; // Added className prop
}

export function SolidButton({
  href,
  icon: Icon,
  label,
  mobileLabel,
  external,
  className = "", // Default to empty string
}: SolidButtonProps) {
  // Use standard anchor tag for external links, Link component for internal
  const ButtonWrapper = external ? motion.a : motion.create(Link);
  const commonProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };
  const linkProps = external ? {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    ...commonProps
  } : {
    href: href, // Use 'href' for Next.js Link
    ...commonProps
  };

  return (
    <Button
      asChild
      size="lg"
      // Combine base classes with incoming className
      className={`group relative rounded-full px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 overflow-hidden bg-teal-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600 w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base ${className}`}
    >
      <ButtonWrapper {...linkProps}>
        <span className="relative z-10 flex items-center justify-center"> {/* Added justify-center */}
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {mobileLabel ? (
            <>
              <span className="sm:hidden">{mobileLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </span>
      </ButtonWrapper>
    </Button>
  );
}
