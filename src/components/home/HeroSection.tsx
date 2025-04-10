
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Begin Your Journey to the Skies',
      subtitle: '100% Online Professional Flight Training',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1555009908-eda8a2c0339a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Learn from Industry Veterans',
      subtitle: 'Expert Instructors with Thousands of Flight Hours',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1505842115551-19b8f15968d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      title: 'Advanced Simulator Training',
      subtitle: 'Virtual Cockpit Experience with Modern Technology',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  // Animation variants for the slides
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Animation variants for content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        delay: 0.2,
      } 
    }
  };

  // Handle manual navigation
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <AnimatePresence initial={false} custom={currentSlide}>
        {slides.map((slide, index) => (
          index === currentSlide && (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial="enter"
              animate="center"
              exit="exit"
              variants={slideVariants}
              custom={index}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-aviation-primary/70 to-aviation-secondary/70"></div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-aviation-secondary/90 py-2 px-4 rounded-full mb-6 inline-block">
            <p className="text-sm md:text-base font-medium text-white">
              100% Online Training | No Physical Centers | Specialized in CPL/ATPL Exam Prep & Interview Coaching
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={slides[currentSlide].id}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white max-w-2xl mx-auto">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-aviation-secondary hover:bg-aviation-secondary/90 text-white text-lg px-8 py-6 transform transition-transform duration-300 hover:scale-105"
                  asChild
                >
                  <Link to="#programs">
                    Start Your Journey
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 transform transition-transform duration-300 hover:scale-105"
                  asChild
                >
                  <Link to="#about">
                    Learn More
                  </Link>
                </Button>
              </div>
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
              index === currentSlide ? 'bg-aviation-secondary w-8' : 'bg-white/50'
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
