// Using "use client" because motion(Link) involves client-side interaction
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Changed import to next/link
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/utils';

interface TransparentButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  mobileLabel?: string; // Optional shorter label for mobile
  external?: boolean;
  download?: boolean;
  textColorClassName?: string;
  className?: string;
}

export function TransparentButton({
  href,
  icon: Icon,
  label,
  mobileLabel,
  external,
  download,
  textColorClassName,
  className = "", // Default to empty string
}: TransparentButtonProps) {
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
    download: download,
    ...commonProps
  } : {
    href: href, // Use 'href' for Next.js Link
    ...commonProps
  };
  const defaultTextColors = "text-teal-600 dark:text-teal-400";

  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      // Integrate className and conditionally apply text color
      className={cn(
        "group relative rounded-full px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 overflow-hidden border-2 border-teal-500 bg-transparent shadow-sm transition-all duration-300 ease-out hover:bg-teal-500 hover:text-white hover:shadow-md dark:border-teal-400 dark:hover:bg-teal-500 dark:hover:text-white conversion-button min-h-[44px] sm:min-h-[48px] text-sm sm:text-base", // Base styles
        textColorClassName ? textColorClassName : defaultTextColors,
        className // Apply any other passed classNames
      )}
      data-conversion="true"
    >
      <ButtonWrapper {...linkProps}>
        {/* Added justify-center to center content when button takes full width */}
        <span className="relative z-10 flex items-center justify-center">
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
