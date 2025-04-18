import React from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Compass } from "lucide-react"; // Using Compass icon
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';
const graphicUrl = "/public/Plane2.webp"; // Example graphic
const FALLBACK_IMAGE = "/placeholder.svg"; // Fallback for graphic

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
  const location = useLocation();

  useEffect(() => {
    // Keep the console error for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_IMAGE) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-background to-teal-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-teal-900/20">
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg mx-auto"
          >
            {/* Graphic */}
            <motion.div variants={graphicVariants} className="mb-8">
              <img
                src={graphicUrl}
                alt="Lost plane graphic"
                className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain opacity-80 dark:opacity-70 mix-blend-multiply dark:mix-blend-luminosity"
                onError={handleImageError}
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
              style={{ lineHeight: '1' }} // Adjust line height for large text
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
              <Button
                size="lg"
                className={cn(
                  "min-h-[52px] text-lg px-8 transition duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg hover:shadow-xl",
                  aviationButtonBg,
                  aviationButtonDarkBg,
                  "text-white"
                )}
                asChild
              >
                <Link to="/" className="inline-flex items-center">
                  <Compass className="mr-2 h-5 w-5" /> Back to Base
                </Link>
              </Button>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
