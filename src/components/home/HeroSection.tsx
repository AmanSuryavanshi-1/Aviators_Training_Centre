// Added "use client" because it uses hooks, motion, and event handlers
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, CalendarCheck } from 'lucide-react'; // Removed Phone icon as it wasn't used
import { motion, AnimatePresence } from 'framer-motion';
// Removed Link import from react-router-dom
import { cn } from "@/lib/utils";
// Removed BookDemoButton import as TransparentButton is used instead
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '../shared/TransparentButton';

// --- Configuration ---
// Removed color constants

// --- Slides Data ---
const slides = [
  {
    id: 1,
    image: '/HomePage/Hero3.webp',
    title: 'Your Pilot Career Starts Here',
    subtitle: 'Master DGCA exams with expert-led online ground school.',
    buttonText: 'Explore Courses',
    buttonLink: '/courses'
  },
  {
    id: 2,
    image: '/HomePage/Hero2.webp',
    title: 'Learn from Airline Professionals',
    subtitle: 'Gain insights from experienced pilots.',
    buttonText: 'Meet Our Instructors',
    buttonLink: '/instructors'
  },
  {
    id: 3,
    image: '/HomePage/Hero1.webp',
    title: 'Flexible Online Ground School',
    subtitle: 'Study at your own pace with our comprehensive curriculum.',
    buttonText: 'View Course Structure',
    buttonLink: '/courses'
  },
  {
    id: 4,
    image: '/HomePage/Hero4.webp',
    title: 'Dedicated Support & Guidance',
    subtitle: 'Personalized attention and 24/7 doubt clearing.',
    buttonText: 'Contact Admissions',
    buttonLink: '/contact'
  }
];

const FALLBACK_IMAGE = "/placeholder.svg"; // Ensure this exists in /public

// --- Animation Variants ---
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.2, duration: 0.6, ease: "easeOut" } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Ensure path comparison is correct if /public prefix is inconsistent
    const fallbackSrc = FALLBACK_IMAGE.startsWith('/public') ? FALLBACK_IMAGE.replace('/public','') : FALLBACK_IMAGE;
    if (!target.src.endsWith(fallbackSrc)) {
        target.onerror = null;
        target.src = fallbackSrc;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []); // Removed slides.length dependency as it's constant

  const handleIndicatorClick = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.3 } }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Consider Next/Image */}
          <img
            src={slides[currentSlide].image.startsWith('/public') ? slides[currentSlide].image.replace('/public', '') : slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay and Content */}
      <div className="absolute inset-0 z-10 h-full flex items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4">
        <motion.div
          key={currentSlide + '-content'} // Ensure key changes for animation
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="hidden" // Add exit animation if needed
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-8 text-white/95 max-w-3xl mx-auto drop-shadow-md">
            {slides[currentSlide].subtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {/* Primary Action Button uses next/link internally */}
            <SolidButton
              href={slides[currentSlide].buttonLink}
              icon={ArrowRight}
              label={slides[currentSlide].buttonText}
            />
            {/* Book Demo Button uses next/link internally */}
            <TransparentButton
              href="/contact?demo=true&subject=Book%20a%20Demo" // Pass demo info via query params
              icon={CalendarCheck}
              label="Book a Demo"
              textColorClassName="text-white"
              className="border-white hover:bg-white/10 dark:border-white"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out ${ 
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
