import React, { useState, useEffect } from 'react';
// Removed import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck, Phone } from 'lucide-react'; // Added Phone icon
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from "./../ui/utils";
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { SolidButton } from '@/components/shared/SolidButton'; // Import the new SolidButton
import { TransparentButton } from '@/components/shared/TransparentButton';
// Optional: import { TransparentButton } from '@/components/shared/TransparentButton'; // Import if needed for secondary button

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
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="object-cover absolute inset-0 w-full h-full"
            onError={handleImageError}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex relative z-10 justify-center items-center p-4 h-full bg-black/30 sm:p-8">
        <motion.div
          key={currentSlide + '-content'}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="mx-auto max-w-4xl text-center text-white"
        >
          <motion.h1 variants={itemVariants} className="mb-4 text-3xl font-bold tracking-tight drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p variants={itemVariants} className="mx-auto mb-8 max-w-3xl text-base drop-shadow-md sm:text-lg md:text-xl text-white/95">
            {slides[currentSlide].subtitle}
          </motion.p>

          {/* --- Action Buttons --- */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center items-center md:gap-6">
            {/* Primary Action Button (Replaced with SolidButton) */}
            <SolidButton
              href={slides[currentSlide].buttonLink}
              icon={ArrowRight} // Using ArrowRight icon
              label={slides[currentSlide].buttonText}
            />

            {/* Book a Demo Button (Assuming it might use new buttons internally or has its own style) */}
            {/* Pass props if needed, but base component likely handles styling */}
            {/* <BookDemoButton /> */}
            <TransparentButton
            href="/contact#contact-form"
            icon={CalendarCheck}
            label="Book a Demo"
            textColorClassName="text-white" // <-- Use the new prop for white text
            // Optional: Still override border if needed, separate from text color
            className="border-white bg-transparent/30 dark:border-white"
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
      </div>

      {/* Slide Indicators (unchanged) */}
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
