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
}

export const BookDemoButton: React.FC<BookDemoButtonProps> = ({ className, size, state }) => {
  const href = `/contact${state ? `?subject=${encodeURIComponent(state.subject)}&courseName=${encodeURIComponent(state.courseName)}` : ''}#contact-form` ;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      <Link href={href}>
        <Button size={size} className={cn(buttonVariants({ size, className }))}>
          <CalendarCheck className="mr-2 h-5 w-5" />
          {state ? 'Book a Demo' : 'Book a Demo'}
        </Button>
      </Link>
    </motion.div>
  );
};
