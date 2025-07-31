'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NotFound() {
  useEffect(() => {
    // Log the 404 error for analytics
    console.log('404 page not found');
  }, []);

  return (
    <div className="flex flex-col justify-center items-center px-4 py-16 min-h-screen text-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
        
        <p className="mb-8 text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/"
            className="inline-flex justify-center items-center px-6 py-3 text-base font-medium text-white rounded-md shadow-md bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Homepage
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
