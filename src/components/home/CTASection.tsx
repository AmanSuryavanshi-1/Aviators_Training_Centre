import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from "@/lib/utils";

// --- Animation Variants (Unchanged) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };

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
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative py-20 md:py-28 text-center text-white overflow-hidden rounded-lg border border-border/30 shadow-lg"
    >
      <img
        src={ctaBackgroundUrl}
        alt="Aircraft taking off into the sunset"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={handleImageError}
        style={{ filter: 'brightness(0.5)' }}
        loading="lazy"
      />
       <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.55)] to-[rgba(12,110,114,0.75)] z-10"></div>

      <motion.div
         className="relative z-20 max-w-3xl mx-auto px-4"
         variants={itemVariants}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-md">
          Ready to Start Your Aviation Journey?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-sm">
          Enroll in our expert-led ground school, prepare for your exams, and take the first step towards a rewarding career in the skies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          {/* Primary CTA (SolidButton) */}
          <SolidButton
            href="/courses"
            icon={ArrowRight}
            label="Explore Courses Now"
          />

          {/* Secondary CTA (TransparentButton) - Using new prop */}
          <TransparentButton
            href="/contact"
            icon={ArrowRight}
            label="Contact Admissions"
            textColorClassName="text-white" // <-- Use the new prop for white text
            // Optional: Still override border if needed, separate from text color
            className="border-white dark:border-white"
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CTASection;
