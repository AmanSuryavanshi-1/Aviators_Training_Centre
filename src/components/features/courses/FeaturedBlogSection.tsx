"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Plane, Star, Clock, Target } from 'lucide-react';
import { cn } from "@/components/ui/utils";
import { commonVariants } from '@/lib/animations/easing';
import { SolidButton } from '@/components/shared/SolidButton';

const { sectionVariants, itemVariants } = commonVariants;

// Design system colors matching the website
const aviationPrimary = 'text-teal-700 dark:text-teal-300';

export default function FeaturedBlogSection() {
  return (
    <motion.section 
      className=""
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >


      {/* Main CTA Section - Enhanced design */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-teal-50/80 via-sky-50/60 to-blue-50/40 dark:from-teal-900/30 dark:via-sky-900/20 dark:to-blue-900/10 rounded-3xl border border-teal-200/50 dark:border-teal-800/30"
        variants={itemVariants}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4">
            <Plane className="w-16 h-16 text-teal-600 transform rotate-12" />
          </div>
          <div className="absolute bottom-4 right-4">
            <BookOpen className="w-12 h-12 text-teal-500 transform -rotate-12" />
          </div>
        </div>
        
        <div className="relative z-10 text-center p-8 md:p-12">
          {/* Icon with enhanced styling */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          
          <h3 className={cn("text-2xl md:text-3xl font-bold mb-4", aviationPrimary)}>
            Unlock Your Aviation Potential
          </h3>
          
          <p className="text-base md:text-lg text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Access our comprehensive library of aviation resources. From DGCA exam strategies to pilot career insights, 
            get the knowledge you need to soar in your aviation journey.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full">
              <Target className="w-4 h-4 text-teal-600" />
              <span className="font-medium">50+ Expert Articles</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="font-medium">Updated Weekly</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full">
              <Star className="w-4 h-4 text-teal-600" />
              <span className="font-medium">Industry Experts</span>
            </div>
          </div>

          {/* Enhanced CTA button */}
          <SolidButton
            href="/blog"
            icon={ArrowRight}
            label="Explore Aviation Library"
            className="conversion-button shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transform hover:scale-105 transition-all duration-300"
          />
          
          {/* Additional context */}
          <p className="mt-4 text-sm text-foreground/60">
            Written by airline pilots • Trusted by 1000+ students • Free access
          </p>
        </div>
      </motion.div>

      {/* SEO Content - Enhanced */}
      <div className="sr-only" aria-hidden="true">
        <h3>Aviation Training Blog Topics</h3>
        <p>DGCA CPL exam preparation guides, pilot salary insights India 2024, aviation career planning resources, airline hiring trends analysis, commercial pilot training tips, RTR(A) exam strategies, type rating preparation guides.</p>
      </div>
    </motion.section>
  );
}