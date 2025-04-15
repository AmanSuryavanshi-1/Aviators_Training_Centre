import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // Corrected icon import
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';

// --- Animation Variants (Define or import) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// Use a relevant background image from the project
const ctaBackgroundUrl = "/HomePage/Hero2.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

const CTASection: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  return (
    // Use motion.section with standard variants
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Adjusted viewport amount
      className="relative py-20 md:py-28 text-center text-white overflow-hidden rounded-lg border border-border/30 shadow-lg"
    >
      {/* Background Image */}
      <img
        src={ctaBackgroundUrl}
        alt="Aircraft taking off into the sunset"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={handleImageError}
        style={{ filter: 'brightness(0.5)' }} // Consistent brightness
        loading="lazy"
      />
      {/* Gradient Overlay */}
       <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.55)] to-[rgba(12,110,114,0.75)] z-10"></div>

      {/* Content Container */}
      <motion.div
         className="relative z-20 max-w-3xl mx-auto px-4"
         variants={itemVariants} // Animate content as a block
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-md">
          Ready to Start Your Aviation Journey?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-sm">
          Enroll in our expert-led ground school, prepare for your exams, and take the first step towards a rewarding career in the skies.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          {/* Primary CTA */}
          <Button
            asChild
            size="lg"
            className={cn(
              "min-h-[52px] text-lg px-8 transition duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg",
              aviationButtonBg,
              aviationButtonDarkBg,
              "text-white hover:shadow-xl"
            )}
          >
            <Link to="/courses">Explore Courses Now</Link>
          </Button>

          {/* Secondary CTA */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-[52px] text-lg px-8 border-white text-white hover:bg-white/10 hover:text-white transition duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg hover:shadow-xl"
          >
            <Link to="/contact">Contact Admissions <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>

        {/* Removed trust signals for cleaner CTA */}

      </motion.div>
    </motion.section>
  );
};

export default CTASection;
