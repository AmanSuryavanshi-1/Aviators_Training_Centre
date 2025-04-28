// Added "use client" for motion and error handler
"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from "@/lib/utils";

// --- Animation Variants (Keep existing) ---
const sectionVariants = { 
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const ctaBackgroundUrl = "/HomePage/Hero2.webp"; // Ensure path is correct in /public
const FALLBACK_IMAGE = "/HomePage/Hero5.webp"; // Ensure path is correct in /public

const CTASection: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
        const target = e.target as HTMLImageElement;
        // Correct fallback path handling
        const fallbackSrc = FALLBACK_IMAGE.startsWith('/public') ? FALLBACK_IMAGE.replace('/public','') : FALLBACK_IMAGE;
        if (!target.src.endsWith(fallbackSrc)) {
            target.onerror = null;
            target.src = fallbackSrc;
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
      {/* Consider Next/Image */}
      <img
        src={ctaBackgroundUrl.startsWith('/public') ? ctaBackgroundUrl.replace('/public','') : ctaBackgroundUrl}
        alt="Aircraft taking off into the sunset"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={handleImageError}
        style={{ filter: 'brightness(0.5)' }}
        loading="lazy"
      />
       <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.55)] to-[rgba(12,110,114,0.75)] z-10"></div>

      <motion.div
         className="relative z-20 max-w-3xl mx-auto px-4"
         variants={itemVariants} // Apply item variants to the content container
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-md">
          Ready to Start Your Aviation Journey?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-sm">
          Enroll in our expert-led ground school, prepare for your exams, and take the first step towards a rewarding career in the skies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
          {/* SolidButton uses next/link internally */}
          <SolidButton
            href="/courses"
            icon={ArrowRight}
            label="Explore Courses Now"
          />
          {/* TransparentButton uses next/link internally */}
          <TransparentButton
            href="/contact"
            icon={ArrowRight}
            label="Contact Admissions"
            textColorClassName="text-white"
            className="border-white hover:bg-white/10 dark:border-white"
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CTASection;
