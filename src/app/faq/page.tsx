"use client"
import React from 'react';
import faqSchema from './schema.json';

// Note: Metadata must be in a separate metadata.ts file for client components
import { motion } from 'framer-motion';
import FAQ from '@/components/shared/FAQ'; // Existing shared FAQ component
import { cn } from "@/components/ui/utils";

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
// Using a relevant image from the project
const faqHeaderUrl = "/FAQ.webp";
const FALLBACK_IMAGE = "/HomePage/Hero4.webp"; // Consistent fallback

// --- Animation Variants (Matching other pages) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

const FAQPage: React.FC = () => {

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  // Create JSON-LD for FAQ schema
  const faqJsonLd = {
    __html: JSON.stringify(faqSchema)
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Add JSON-LD structured data for FAQs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={faqJsonLd}
      />

      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden" // Matched height
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={faqHeaderUrl}
          alt="ATC aircraft wing detail" // More relevant alt text
          className="absolute inset-0 z-0 w-full h-full"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }} // Adjusted brightness
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div> {/* Added gradient overlay */}
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10" // Matched padding
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:text-5xl md:text-6xl"> {/* Matched text styles */}
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl mx-auto text-lg drop-shadow-md md:text-xl text-white/90"> {/* Matched text styles */}
            Your questions about Aviators Training Centre, answered.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Adjusted container padding/spacing */}
      <main className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">

        {/* FAQ Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
           className="max-w-4xl mx-auto" // Center the FAQ component
        >
            {/* Added consistent section heading */}
            <motion.h2
                variants={itemVariants}
                className={cn("text-3xl font-bold text-center md:text-4xl", aviationPrimary)}
            >
                Find Your Answers
            </motion.h2>

            {/* Render the existing shared FAQ component */}
            <motion.div variants={itemVariants}>
               {/* Assuming FAQ component's Accordion styling is acceptable or handled within the component */}
               <FAQ showAll={true} showHeader={false} />
            </motion.div>
        </motion.section>

      </main>
    </div>
  );
};

export default FAQPage;
