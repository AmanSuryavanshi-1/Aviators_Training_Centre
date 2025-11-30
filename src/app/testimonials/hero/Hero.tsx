"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { easingFunctions } from '@/lib/animations/easing';

interface HeroProps {
  variant?: 'standard' | 'compact';
}

export default function Hero({
  variant = 'standard'
}: HeroProps) {
  const heightClass = variant === 'standard'
    ? 'h-[50vh] md:h-[60vh]'
    : 'h-[40vh] md:h-[50vh]';

  return (
    <motion.section
      className={cn(
        "relative flex items-center justify-center text-center text-white overflow-hidden",
        heightClass
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: easingFunctions.easeOut }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Blogs/Blog_Header.webp')`
          }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-teal-900/60 to-slate-800/70" />

        {/* Additional overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <motion.div
        className={cn("relative z-20 max-w-4xl container px-4 sm:px-6", "space-y-8 md:space-y-12")}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {/* Main heading with enhanced SEO structure */}
        <div className="space-y-6">
          <motion.h1
            className={cn(
              "font-extrabold leading-tight tracking-tight drop-shadow-md",
              variant === 'standard'
                ? "text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl"
                : "text-2xl sm:text-3xl md:text-4xl"
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Success Stories That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300">
              Inspire Dreams
            </span>
          </motion.h1>
          <motion.p
            className={cn(
              "mx-auto drop-shadow-md text-white/90 leading-relaxed",
              variant === 'standard'
                ? "max-w-4xl text-xs sm:text-sm md:text-lg lg:text-xl"
                : "max-w-xl text-base md:text-lg"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <span className="block">Discover real testimonials from successful DGCA CPL graduates who transformed</span>
            <span className="block">their aviation dreams into reality through India's premier ground school training program</span>
          </motion.p>
        </div>




      </motion.div>
    </motion.section>
  );
}