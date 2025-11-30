import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { type VariantProps, cva } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { CalendarCheck } from 'lucide-react';

const buttonVariants = cva(
  'bg-gradient-to-r from-[#075E68] to-[#219099] text-white rounded-full overflow-hidden hover:from-[#219099] hover:to-[#075E68] transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 border-0',
  {
    variants: {
      size: {
        default: 'px-6 py-3',
        sm: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

interface BookDemoButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  state?: { subject: string; courseName: string };
  mobileLabel?: string;
}

export const BookDemoButton: React.FC<BookDemoButtonProps> = ({ className, size, state, mobileLabel, ...props }) => {
  const defaultDemoMessage = `I would like to book a demo${state?.courseName ? ` for the ${state.courseName} course` : ''}. Please contact me to schedule a time.`;
  const href = `/contact${state ? `?subject=${encodeURIComponent(state.subject)}&courseName=${encodeURIComponent(state.courseName)}&message=${encodeURIComponent(defaultDemoMessage)}` : ''}#contact-form`;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      <Link href={href}>
        <Button size={size} className={cn(buttonVariants({ size, className }), "conversion-button")} data-conversion="true">
          <CalendarCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Book a Demo</span>
          <span className="sm:hidden">{mobileLabel || 'Demo'}</span>
        </Button>
      </Link>
    </motion.div>
  );
};
