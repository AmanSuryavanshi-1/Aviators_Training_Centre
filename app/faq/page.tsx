// Added "use client" directive as motion and FAQ component likely need it
"use client";

import React from 'react';
// Removed Header and Footer imports
import { motion } from 'framer-motion';
import FAQ from '@/components/shared/FAQ'; // Existing shared FAQ component
import { cn } from "@/lib/utils";
// Removed unused Card, Button, Link, PhoneForwarded imports

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
// const aviationSecondary = 'text-teal-600 dark:text-teal-400'; // Unused
const faqHeaderUrl = "/FAQ.jpg";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

// --- Animation Variants (Keep your existing variants) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };
// const cardHoverEffect = { /* ... */ }; // Unused

const FAQPage: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  // Removed surrounding div
  return (
    <>
      {/* Page Header */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Consider Next/Image */}
        <img
          src={faqHeaderUrl}
          alt="ATC aircraft wing detail"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }}
          loading="lazy"
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
            Your questions about Aviators Training Centre, answered.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* FAQ Section */} 
        <motion.section
           // Add variants
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
           className="max-w-4xl mx-auto"
        >
            <motion.h2
                // Add variants
                className={cn("text-3xl md:text-4xl font-bold text-center mb-12", aviationPrimary)} // Added mb-12
            >
                Find Your Answers
            </motion.h2>

            <motion.div /* Add variants */>
               {/* Ensure FAQ component itself adds "use client" if it uses hooks */}
               <FAQ showAll={true} showHeader={false} />
            </motion.div>
        </motion.section>

      </main>
      {/* Footer is rendered by layout.tsx */}
    </>
  );
};

export default FAQPage;
