// Added "use client" because motion is used
"use client";

import React from 'react';
// Removed useLocation and useEffect imports
// Removed Header and Footer imports
import { Compass } from "lucide-react"; // Only Compass needed from lucide
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SolidButton } from '@/components/shared/SolidButton';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
// const aviationSecondary = 'text-teal-600 dark:text-teal-400'; // Unused
const graphicUrl = "/Plane2.webp"; // Confirm path is correct relative to public dir
const FALLBACK_IMAGE = "/placeholder.svg"; // Confirm path is correct relative to public dir

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const graphicVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] } // Custom ease
    }
};

const NotFound: React.FC = () => {

  // Removed useEffect/useLocation logic

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.endsWith(FALLBACK_IMAGE)) { // Check against the correct fallback path
            target.onerror = null;
            target.src = FALLBACK_IMAGE;
        }
    };

  // Removed surrounding div
  return (
    // This component will be rendered by Next.js layout when a 404 occurs
    <>
      {/* Centering the content within the main layout area */}
      <main className="flex-grow flex items-center justify-center py-20 md:py-24 bg-gradient-to-br from-sky-50 via-background to-teal-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-teal-900/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg mx-auto"
          >
            {/* Graphic */}
            <motion.div variants={graphicVariants} className="mb-8">
              {/* Consider Next/Image */}
              <img
                src={graphicUrl}
                alt="Lost plane graphic"
                className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain opacity-80 dark:opacity-70 mix-blend-multiply dark:mix-blend-luminosity"
                onError={handleImageError}
                loading="lazy"
              />
            </motion.div>

            {/* Error Code */}
            <motion.h1
              variants={itemVariants}
              className={cn(
                "text-7xl md:text-9xl font-extrabold tracking-tighter mb-2",
                aviationPrimary,
                "bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-sky-500 dark:from-teal-300 dark:to-sky-400"
              )}
              style={{ lineHeight: '1' }}
            >
              404
            </motion.h1>

            {/* Title */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-4xl font-semibold text-foreground mb-4"
            >
              Oops! Off the Radar.
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-foreground/70 mb-10"
            >
              It seems you have navigated to an uncharted territory. The page you are looking for could not be found.
            </motion.p>

            {/* Home Button */}
            <motion.div variants={itemVariants}>
               <SolidButton
                  href="/"
                  icon={Compass}
                  label="Back to Base"
                />
            </motion.div>

          </motion.div>
        </div>
      </main>
      {/* Footer rendered by layout.tsx */}
    </>
  );
};

export default NotFound;
