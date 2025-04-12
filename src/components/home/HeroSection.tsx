
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  // Parallax effect values
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Button hover animation variants
  const buttonHoverVariants = {
    initial: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };
  
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
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-cockpit-of-an-airplane-with-the-control-panel-9823-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,94,104,0.6)] to-[rgba(7,94,104,0.6)]"></div>
      </div>

      {/* Content with Parallax Effect */}
      <motion.div 
        className="relative z-10 h-full flex items-center justify-center text-white"
        style={{ y, opacity }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Begin Your Journey to the Skies
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Premium flight training with industry-leading instructors and modern technology
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
              <motion.div
                variants={buttonHoverVariants}
                initial="initial"
                whileHover="hover"
              >
                <Button 
                  className="bg-[#0C6E72] hover:bg-[#219099] text-white text-lg px-8 py-6 w-full sm:w-auto transition-colors duration-300"
                  asChild
                >
                  <Link to="/courses">
                    Explore Courses
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
            </div>
          </motion.div>
        </div>
      </motion.div>

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
