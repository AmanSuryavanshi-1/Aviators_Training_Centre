"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight, CalendarCheck, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from "@/components/ui/utils";
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';
// import OptimizedImage from '@/components/shared/OptimizedImage'; // Removed to reduce bundle size for LCP
import { PerformanceImageProvider, useImagePerformanceMetrics } from '@/lib/image-optimization';
import HeroImagePerformanceMonitor from './HeroImagePerformanceMonitor';
import { easingFunctions } from '@/lib/animations/easing';

// --- Configuration ---
// Removed aviationButtonBg and aviationButtonDarkBg as styling is now in SolidButton

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
    buttonLink: '/contact#contact-form'
  }
];

const FALLBACK_IMAGE = "/placeholder.svg";

// --- Animation Variants (unchanged) ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: direction === 0 ? 1 : 0
  }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.2, duration: 0.6, ease: easingFunctions.easeOut } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easingFunctions.easeOut } }
};

// Inner component that uses the performance hooks
const HeroSectionInner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    averageLoadTime: number;
    lcpCandidate: boolean;
    recommendations: string[];
  } | null>(null);
  const SWIPE_THRESHOLD_PX = 50;

  // Performance metrics for hero images (now inside provider context)
  const { preloadImage } = useImagePerformanceMetrics();

  // Handle image load success
  const handleImageLoad = useCallback((slideIndex: number) => {
    setImagesLoaded(prev => new Set(prev).add(slideIndex));
  }, []);

  // Handle image load error with fallback
  const handleImageError = useCallback((slideIndex: number) => {
    console.warn(`Hero image ${slideIndex} failed to load, using fallback`);
    // The OptimizedImage component will handle fallback automatically
  }, []);

  // Handle performance metrics updates
  const handlePerformanceUpdate = useCallback((metrics: {
    averageLoadTime: number;
    lcpCandidate: boolean;
    recommendations: string[];
  }) => {
    setPerformanceMetrics(metrics);

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development' && metrics.recommendations.length > 0) {
      console.warn('Hero Image Performance Recommendations:', metrics.recommendations);
    }
  }, []);

  // Manual preload link injection removed as next/image with priority handles this better


  // Preload all hero images on component mount for instant transitions
  useEffect(() => {
    const preloadAllImages = async () => {
      try {
        // Preload current image with critical priority
        await preloadImage(slides[currentSlide].image, 'critical');

        // Preload next images with high priority
        const nextIndex = (currentSlide + 1) % slides.length;
        await preloadImage(slides[nextIndex].image, 'high');

        // Preload remaining images with medium priority (connection-aware)
        const remainingSlides = slides.filter((_, index) =>
          index !== currentSlide && index !== nextIndex
        );

        // Stagger preloading to avoid overwhelming slow connections
        for (const slide of remainingSlides) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
          await preloadImage(slide.image, 'medium');
        }
      } catch (error) {
        console.warn('Some hero images failed to preload:', error);
      }
    };

    preloadAllImages();
  }, [currentSlide, preloadImage]);

  // Auto-advance slides with connection-aware timing
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    const nextIndex = (currentSlide + 1) % slides.length;
    setCurrentSlide(nextIndex);

    // Preload the image after next for smooth transitions
    const afterNextIndex = (nextIndex + 1) % slides.length;
    preloadImage(slides[afterNextIndex].image, 'high');
  }, [currentSlide, preloadImage]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    setCurrentSlide(prevIndex);

    // Preload the image before previous for smooth transitions
    const beforePrevIndex = prevIndex === 0 ? slides.length - 1 : prevIndex - 1;
    preloadImage(slides[beforePrevIndex].image, 'high');
  }, [currentSlide, preloadImage]);

  const handleIndicatorClick = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);

    // Preload adjacent images when user navigates
    const nextIndex = (index + 1) % slides.length;
    const prevIndex = index === 0 ? slides.length - 1 : index - 1;
    preloadImage(slides[nextIndex].image, 'high');
    preloadImage(slides[prevIndex].image, 'high');
  }, [currentSlide, preloadImage]);

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
          className="absolute inset-0 w-full h-full opacity-100"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority={true}
            quality={85}
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            placeholder={currentSlide === 0 ? undefined : "blur"}
            blurDataURL={currentSlide === 0 ? undefined : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCKSAA//9k="}
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="flex relative z-10 justify-center items-center p-4 h-full bg-black/30 sm:p-8 touch-pan-y sm:touch-auto cursor-grab active:cursor-grabbing sm:cursor-auto"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          if (info.offset.x <= -SWIPE_THRESHOLD_PX) {
            goToNext();
          } else if (info.offset.x >= SWIPE_THRESHOLD_PX) {
            goToPrev();
          }
        }}
      >
        <motion.div
          key={currentSlide + '-content'}
          variants={contentVariants}
          initial={currentSlide === 0 ? "visible" : "hidden"}
          animate="visible"
          exit="hidden"
          className="mx-auto max-w-4xl text-center text-white"
        >
          <motion.h1 variants={itemVariants} className="mb-4 text-2xl font-bold tracking-tight drop-shadow-lg sm:text-3xl md:text-5xl lg:text-6xl">
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p variants={itemVariants} className="mx-auto mb-8 max-w-3xl text-sm drop-shadow-md sm:text-base md:text-xl text-white/95">
            {slides[currentSlide].subtitle}
          </motion.p>

          {/* --- Action Buttons --- */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 w-full max-w-md mx-auto">
            {/* Primary Action Button (Replaced with SolidButton) */}
            <SolidButton
              href={slides[currentSlide].buttonLink}
              icon={ArrowRight}
              label={slides[currentSlide].buttonText}
              mobileLabel={slides[currentSlide].buttonText === "Explore Courses" ? "Courses" :
                slides[currentSlide].buttonText === "Meet Our Instructors" ? "Instructors" :
                  slides[currentSlide].buttonText === "View Course Structure" ? "Structure" :
                    slides[currentSlide].buttonText === "Contact Admissions" ? "Contact" : undefined}
              className="flex-1 w-auto min-w-[140px]"
            />

            {/* Book a Demo Button (Assuming it might use new buttons internally or has its own style) */}
            {/* Pass props if needed, but base component likely handles styling */}
            {/* <BookDemoButton /> */}
            <TransparentButton
              href="/contact#contact-form"
              icon={CalendarCheck}
              label="Book a Demo"
              mobileLabel="Demo"
              textColorClassName="text-white" // <-- Use the new prop for white text
              // Optional: Still override border if needed, separate from text color
              className="border-white bg-transparent/30 dark:border-white flex-1 w-auto min-w-[140px]"
            />
            {/* Optional Secondary/Contact Button (Using TransparentButton if uncommented) */}
            {/*
             <TransparentButton
                href="/contact"
                icon={Phone} // Example: Using Phone icon
                label="Contact Us"
                // Removed custom classes, relying on component's styling
             />
             */}
          </motion.div>
          {/* --- End Action Buttons --- */}

        </motion.div>
      </motion.div>

      {/* Slide Indicators (unchanged) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Performance Monitor - Dev Only */}
      {process.env.NODE_ENV === 'development' && (
        <HeroImagePerformanceMonitor
          slideCount={slides.length}
          currentSlide={currentSlide}
          onPerformanceUpdate={handlePerformanceUpdate}
        />
      )}

      {/* Performance Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-30">
          <div>Avg Load: {performanceMetrics.averageLoadTime.toFixed(0)}ms</div>
          <div>LCP: {performanceMetrics.lcpCandidate ? '✓' : '✗'}</div>
          {performanceMetrics.recommendations.length > 0 && (
            <div className="text-yellow-300 mt-1">
              ⚠ {performanceMetrics.recommendations.length} issues
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroSectionInner;
