import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils'; // Import cn

interface TransparentButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
  download?: boolean;
  textColorClassName?: string; // <-- Added prop for text color override
  className?: string; // <-- Keep className for general overrides
}

export function TransparentButton({
  href,
  icon: Icon,
  label,
  external,
  download,
  textColorClassName, // <-- Destructure the new prop
  className // <-- Destructure className
}: TransparentButtonProps) {
  const ButtonWrapper = external ? motion.a : motion(Link);
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
        to: href,
        ...commonProps
    };
    const defaultTextColors = "text-teal-600 dark:text-teal-400"; // Define default colors

  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      // Integrate className and conditionally apply text color
      className={cn(
        "group relative rounded-full px-6 py-3 overflow-hidden border-2 border-teal-500 bg-transparent shadow-sm transition-all duration-300 ease-out hover:bg-teal-500 hover:text-white hover:shadow-md dark:border-teal-400 dark:hover:bg-teal-500 dark:hover:text-white", // Base styles (hover text color remains white)
        textColorClassName ? textColorClassName : defaultTextColors, // Apply override or default text color
        className // Apply any other passed classNames
      )}
    >
       <ButtonWrapper {...linkProps}>
        <span className="relative z-10 flex items-center">
           <Icon className="w-5 h-5 mr-2" />
          <span>{label}</span>
        </span>
      </ButtonWrapper>
    </Button>
  );
}
