import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { BookDemoButton } from '@/components/shared/BookDemoButton'; // Import the new button

// --- Configuration ---
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';

// --- Slides Data (Define your hero slides here) ---
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
    subtitle: 'Gain insights from experienced pilots and engineers.',
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
    image: '/HomePage/Hero4.webp', // Using Hero5
    title: 'Dedicated Support & Guidance',
    subtitle: 'Personalized attention and 24/7 doubt clearing.',
    buttonText: 'Contact Admissions',
    buttonLink: '/contact'
  }
];

const FALLBACK_IMAGE = "/placeholder.svg"; // A generic fallback

// --- Animation Variants ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15, // Stagger text and button animation
      delayChildren: 0.2, // Delay start of content animation
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) { // Basic check
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // Increased interval time

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleIndicatorClick = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden">
      {/* Carousel Images */} 
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide} // Important: key change triggers animation
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title} // Dynamic alt text
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            loading="eager" // Load first image eagerly
          />
           {/* REMOVED GRADIENT OVERLAY DIV */}
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */} 
      <div className="relative z-10 h-full flex items-center justify-center bg-black/30 p-4"> {/* Added subtle dark overlay for text contrast */} 
        <motion.div
          key={currentSlide + '-content'} // Change key to force content re-animation
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="hidden" // Ensure content fades out
          className="max-w-4xl mx-auto text-center text-white"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg" // Added drop-shadow
          >
            {slides[currentSlide].title}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-white/95 max-w-3xl mx-auto drop-shadow-md" // Added drop-shadow
          >
            {slides[currentSlide].subtitle}
          </motion.p>

          {/* --- Action Buttons --- */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {/* Primary Action Button (from slide data) */}
            <Button
              asChild
              size="lg"
              className={cn(
                "min-h-[52px] text-lg px-8 transition duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg hover:shadow-xl",
                aviationButtonBg,
                aviationButtonDarkBg,
                "text-white"
              )}
            >
              <Link to={slides[currentSlide].buttonLink}>
                {slides[currentSlide].buttonText}
              </Link>
            </Button>

            {/* Book a Demo Button */}
            <BookDemoButton size="lg" className="min-h-[52px] text-lg px-8 shadow-lg hover:shadow-xl" />

            {/* Optional Secondary/Contact Button (removed ArrowRight icon for space) */}
             {/* <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-[52px] text-lg px-8 border-white text-white hover:bg-white/10 hover:text-white transition duration-300 ease-in-out transform hover:scale-[1.03] shadow-lg hover:shadow-xl hidden sm:inline-flex" // Hide on small screens if crowded
              >
                <Link to="/contact">Contact Us</Link>
              </Button> */}
          </motion.div>
          {/* --- End Action Buttons --- */}

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
