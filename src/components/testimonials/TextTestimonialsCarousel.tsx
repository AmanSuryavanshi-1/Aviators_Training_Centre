"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Quote, Star, Plane, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/components/ui/utils';

// Sample text testimonials data
const textTestimonials = [
  {
    id: 'text-1',
    text: "The instructors at Aviators Training Centre are exceptional. Captain Ankit Kumar's teaching methodology made complex aviation concepts crystal clear. I cleared my DGCA CPL exams in the first attempt with excellent scores.",
    author: "Rajesh Kumar",
    course: "DGCA CPL Ground School",
    rating: 5,
    gradYear: 2024,
    verified: true,
    location: "Mumbai"
  },
  {
    id: 'text-2',
    text: "Outstanding training quality! The comprehensive study material and personalized attention helped me understand every aspect of aviation theory. The mock tests were incredibly helpful for exam preparation.",
    author: "Ananya Sharma",
    course: "ATPL Theory",
    rating: 5,
    gradYear: 2024,
    verified: true,
    location: "Delhi"
  },
  {
    id: 'text-3',
    text: "Best decision I made for my aviation career. The Type Rating preparation was thorough and practical. Captain Dhruv's real-world experience made all the difference in my understanding.",
    author: "Karthik Reddy",
    course: "Type Rating Preparation",
    rating: 5,
    gradYear: 2023,
    verified: true,
    location: "Bangalore"
  },
  {
    id: 'text-4',
    text: "Excellent RTR(A) training program. The communication skills and radio procedures were taught with great detail. I'm now confidently working as a commercial pilot thanks to ATC's training.",
    author: "Priya Mehta",
    course: "RTR(A) Training",
    rating: 5,
    gradYear: 2024,
    verified: true,
    location: "Pune"
  },
  {
    id: 'text-5',
    text: "The online learning platform is user-friendly and comprehensive. 24/7 doubt clearing sessions were a game-changer. I highly recommend ATC to anyone serious about their aviation career.",
    author: "Arjun Patel",
    course: "DGCA CPL Ground School",
    rating: 5,
    gradYear: 2023,
    verified: true,
    location: "Ahmedabad"
  },
  {
    id: 'text-6',
    text: "Professional training with personal touch. The instructors genuinely care about student success. The interview preparation sessions helped me land my dream job with a major airline.",
    author: "Sneha Gupta",
    course: "Interview Preparation",
    rating: 5,
    gradYear: 2024,
    verified: true,
    location: "Chennai"
  }
];

// Aviation-inspired 3D flip card variants
const cardVariants = {
  hidden: { 
    opacity: 0, 
    rotateY: -90,
    scale: 0.8,
    z: -100
  },
  visible: { 
    opacity: 1, 
    rotateY: 0,
    scale: 1,
    z: 0,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    rotateY: 5,
    scale: 1.05,
    z: 50,
    boxShadow: "0 25px 50px rgba(6, 182, 212, 0.3)",
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  flip: {
    rotateY: 180,
    transition: { 
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const propellerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: "linear",
      repeat: 3
    }
  }
};

const starsVariants = {
  twinkle: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface TestimonialCardProps {
  testimonial: any;
  index: number;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  index, 
  isActive, 
  onHover, 
  onLeave 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPropeller, setShowPropeller] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    setShowPropeller(true);
    setTimeout(() => setShowPropeller(false), 1500);
  };

  return (
    <motion.div
      className="relative w-full h-80 cursor-pointer perspective-1000"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={handleCardClick}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Card Container */}
      <motion.div
        className="relative w-full h-full transition-transform duration-600 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{
          transformStyle: "preserve-3d"
        }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-gradient-to-br from-card via-card/90 to-card/80 rounded-2xl shadow-lg border border-border/50 p-6 flex flex-col backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Quote className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                {showPropeller && (
                  <motion.div
                    variants={propellerVariants}
                    animate="spin"
                    className="w-5 h-5"
                  >
                    <Plane className="w-full h-full text-teal-600 dark:text-teal-400" />
                  </motion.div>
                )}
              </div>
              
              {/* Rating Stars */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={starsVariants}
                    animate={isActive ? "twinkle" : ""}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Testimonial Text */}
            <div className="flex-1 mb-4">
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
                "{testimonial.text}"
              </p>
            </div>

            {/* Author Info */}
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-aviation-primary">
                    {testimonial.course}
                  </p>
                </div>
                {testimonial.verified && (
                  <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                    ✓ Verified
                  </div>
                )}
              </div>
            </div>

            {/* Click hint */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/60">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 rounded-2xl shadow-lg p-6 flex flex-col text-white">
            {/* Aviation Graphics */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Plane className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    style={{
                      left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 30}px`,
                      top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 30}px`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex-1 space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Success Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Graduation Year:</span>
                    <span className="font-semibold">{testimonial.gradYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Location:</span>
                    <span className="font-semibold">{testimonial.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Rating:</span>
                    <span className="font-semibold">{testimonial.rating}/5 ⭐</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-full h-px bg-white/20 mb-4" />
                <p className="text-white/90 text-sm italic">
                  "Transformed my aviation dreams into reality"
                </p>
              </div>
            </div>

            {/* Click hint */}
            <div className="absolute bottom-2 right-2 text-xs text-white/60">
              Click to flip back
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TextTestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Auto-advance functionality
  useEffect(() => {
    if (isAutoPlaying && hoveredCard === null) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(textTestimonials.length / 3));
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, hoveredCard]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(textTestimonials.length / 3)) % Math.ceil(textTestimonials.length / 3));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(textTestimonials.length / 3));
  };

  const visibleTestimonials = textTestimonials.slice(currentIndex * 3, (currentIndex + 1) * 3);

  return (
    <motion.section
      ref={sectionRef}
      className="py-10 md:py-12 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-card/30 to-background/80" />

      {/* Floating aviation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          >
            <Plane className="w-4 h-4 text-aviation-primary/30" />
          </motion.div>
        ))}
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-aviation-primary via-aviation-secondary to-aviation-tertiary">
              Graduates Say
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Real experiences from pilots who transformed their careers with our comprehensive training programs
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevious}
            className="p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card text-card-foreground border border-border shadow-sm hover:shadow-xl hover:text-aviation-primary transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(textTestimonials.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-aviation-primary w-8" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial set ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card text-card-foreground border border-border shadow-sm hover:shadow-xl hover:text-aviation-primary transition-all duration-300 hover:scale-110"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {visibleTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              isActive={hoveredCard === index}
              onHover={() => setHoveredCard(index)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </motion.div>

        {/* Auto-play indicator */}
        <div className="flex items-center justify-center mt-8">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              isAutoPlaying 
                ? "bg-aviation-primary text-white shadow-lg" 
                : "bg-card/80 backdrop-blur-sm text-card-foreground hover:bg-card border border-border"
            )}
          >
            {isAutoPlaying ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Auto-playing
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                Paused
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.section>
  );
}