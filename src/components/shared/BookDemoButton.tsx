// Needs "use client" because it uses motion and generates URLs client-side
"use client";

import React from 'react';
import Link from 'next/link'; // Use Next.js Link
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarCheck } from 'lucide-react';
// Removed incorrect import: import { URLSearchParams } from 'url'; 
// Browser's native URLSearchParams will be used automatically.

// Define the structure for the query parameters
interface DemoQueryParams {
  isDemoBooking?: boolean;
  subject?: string;
  courseName?: string;
  // Add other potential fields if needed (name, email etc. could be pre-filled)
}

interface BookDemoButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null;
  queryParams?: DemoQueryParams; // Use queryParams instead of state
}

export const BookDemoButton: React.FC<BookDemoButtonProps> = ({ className, size = 'lg', queryParams = {} }) => {

  // Construct the query string using browser's native URLSearchParams
  const buildQueryString = () => {
    const params = new URLSearchParams(); // Uses native browser API
    params.set('demo', 'true'); // Always set demo=true
    if (queryParams.subject) params.set('subject', queryParams.subject);
    if (queryParams.courseName) params.set('courseName', queryParams.courseName);
    // Add other params if they exist in queryParams
    return params.toString();
  };

  const queryString = buildQueryString();
  const contactUrl = `/contact?${queryString}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Use Next.js Link with the constructed href */}
      <Link href={contactUrl}>
        <Button
          size={size}
          className={cn(
            'bg-gradient-to-r from-[#075E68] to-[#219099] text-white rounded-full px-6 py-3 overflow-hidden hover:from-[#219099] hover:to-[#075E68] transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
            'border-0',
            'flex items-center justify-center', // Ensure content centers
            className
          )}
        >
           <CalendarCheck className="mr-2 h-5 w-5" />
          Book a Demo
        </Button>
      </Link>
    </motion.div>
  );
};
