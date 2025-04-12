import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: '/Hero1.webp',
      title: 'Begin Your Journey to the Skies',
      subtitle: '100% Online Professional Flight Training',
      buttonText: 'Explore Courses',
      buttonLink: '/courses'
    },
    {
      id: 2,
      image: '/Hero2.webp',
      title: 'Learn from Industry Veterans',
      subtitle: 'Expert Instructors with Thousands of Flight Hours',
      buttonText: 'Meet Our Team',
      buttonLink: '/instructors'
    },
    {
      id: 3,
      image: '/Hero5.webp',
      title: 'Join Our Aviation Community',
      subtitle: 'Connect with Fellow Aviation Enthusiasts',
      buttonText: 'Join Now',
      buttonLink: '/community'
    },
    // {
    //   id: 3,
    //   image: '/Hero3.webp',
    //   title: 'Advanced Simulator Training',
    //   subtitle: 'Virtual Cockpit Experience with Modern Technology',
    //   buttonText: 'View Simulators',
    //   buttonLink: '/simulators'
    // },
    {
      id: 4,
      image: '/Hero4.webp',
      title: 'State-of-the-Art Facilities',
      subtitle: 'World-Class Training Environment',
      buttonText: 'Tour Our Center',
      buttonLink: '/facilities'
    },
   
  ];

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      slides.forEach(slide => {
        const img = new Image();
        img.src = slide.image;
      });
    };
    preloadImages();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSlideChange = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

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
        duration: 0.6,
        delay: 0.3,
        ease: "easeOut"
      } 
    }
  };

  const buttonHoverVariants = {
    initial: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="relative h-screen md:h-[90vh] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="relative w-full h-full">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-4xl mx-auto text-center"
            >
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row justify-center gap-6 mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  variants={buttonHoverVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <Button 
                    className="bg-[#0C6E72] hover:bg-[#219099] text-white text-lg px-8 py-6 w-full sm:w-auto transition-colors duration-300"
                    asChild
                  >
                    <Link to={slides[currentSlide].buttonLink}>
                      {slides[currentSlide].buttonText}
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  variants={buttonHoverVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 w-full sm:w-auto transition-colors duration-300"
                    asChild
                  >
                    <Link to="/schedule">
                      Schedule a Free Consultation <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-[#0C6E72] w-8' : 'bg-white/50'
            }`}
            onClick={() => handleSlideChange(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
