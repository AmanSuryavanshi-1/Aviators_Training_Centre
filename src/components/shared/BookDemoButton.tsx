import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarCheck } from 'lucide-react'; // Optional: Add an icon

export const BookDemoButton: React.FC<{ className?: string; size?: 'default' | 'sm' | 'lg' | 'icon' | null }> = ({ className, size = 'lg' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Link
        to="/contact"
        state={{ isDemoBooking: true, subject: 'Book a Demo' }} // Pass state to contact page
      >
        <Button
          size={size}
          className={cn(
            'bg-gradient-to-r from-[#075E68] to-[#219099] text-white rounded-full px-6 py-3 overflow-hidden  hover:from-[#219099] hover:to-[#075E68] transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
            'border-0', // Override default border if any
            className
          )}
        >
           {/* Optional Icon */}
           <CalendarCheck className="mr-2 h-5 w-5" />
          Book a Demo
        </Button>
      </Link>
    </motion.div>
  );
};
