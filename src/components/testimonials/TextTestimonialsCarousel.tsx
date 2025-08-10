"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, Play, MapPin } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { testimonials } from '@/lib/testimonials/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Use the actual text testimonials data
const textTestimonials = testimonials.text.map((testimonial: any) => ({
  id: testimonial.id,
  text: testimonial.testimonial,
  author: testimonial.studentName,
  course: testimonial.course,
  rating: typeof testimonial.rating === 'number' ? testimonial.rating : 5,
  gradYear: testimonial.gradYear,
  verified: testimonial.verified,
  location: testimonial.location,
  subjects: testimonial.subjects || [],
  specificFeedback: testimonial.specificFeedback
}));

// StarRating component with clean design
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const safeRating = Math.max(0, Math.min(5, typeof rating === 'number' ? rating : 5));
  const fullStars = Math.floor(safeRating);
  const hasPartialStar = safeRating % 1 !== 0;
  const partialStarWidth = (safeRating % 1) * 100;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
      ))}
      {hasPartialStar && (
        <div className="relative">
          <Star className="w-3.5 h-3.5 text-gray-300" />
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialStarWidth}%` }}
          >
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          </div>
        </div>
      )}
      {[...Array(Math.max(0, 5 - Math.ceil(safeRating)))].map((_, i) => (
        <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-300" />
      ))}
      <span className="ml-1.5 text-xs font-medium text-muted-foreground">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
};

// Modern testimonial card component
const TestimonialCard: React.FC<{ 
  testimonial: any; 
  index: number;
}> = ({ testimonial, index }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
        scale: { duration: prefersReducedMotion ? 0.1 : 0.4 }
      }}
      whileHover={prefersReducedMotion ? {} : { 
        y: -2, 
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="h-full"
    >
      <Card className="h-full bg-card border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 group">
        <CardContent className="p-5 h-full flex flex-col">
          {/* Quote and Rating */}
          <div className="flex items-start justify-between mb-3">
            <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <StarRating rating={testimonial.rating} />
          </div>

          {/* Testimonial Text */}
          <div className="flex-1 mb-4">
            <p className="text-foreground leading-relaxed text-sm">
              "{testimonial.text}"
            </p>
          </div>

          {/* Author Info */}
          <div className="border-t border-border pt-3 mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">
                  {testimonial.author}
                </h4>
                <p className="text-xs text-primary truncate mt-0.5">
                  {testimonial.course}
                </p>
              </div>
              {testimonial.verified && (
                <div className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium flex-shrink-0">
                  ✓
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{testimonial.location}</span>
            </div>
            
            {/* Subjects */}
            {testimonial.subjects && testimonial.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {testimonial.subjects.slice(0, 2).map((subject: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {subject}
                  </span>
                ))}
                {testimonial.subjects.length > 2 && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    +{testimonial.subjects.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * TextTestimonialsCarousel - A clean, modern testimonials carousel component
 * Designed to fit within 100vh with professional styling
 */
export default function TextTestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(textTestimonials.length / 3);
  const prefersReducedMotion = useReducedMotion();

  // Auto-advance functionality - Always enabled by default
  useEffect(() => {
    if (isAutoPlaying && !isDragging && totalPages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 3000); // 3 seconds interval
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlaying, isDragging, totalPages]);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + totalPages) % totalPages;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % totalPages;
    setCurrentIndex(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch gesture handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_event: any, info: any) => {
    setIsDragging(false);
    
    const { offset } = info;
    const threshold = 50;

    if (Math.abs(offset.x) > threshold) {
      if (offset.x > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
  };

  const visibleTestimonials = textTestimonials.slice(currentIndex * 3, (currentIndex + 1) * 3);

  return (
    <section
      ref={sectionRef}
      className="max-h-screen py-8 md:py-12 relative overflow-hidden bg-background"
      aria-label="Student testimonials carousel. Use left and right arrow keys to navigate."
      role="region"
      tabIndex={0}
    >
      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Compact */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Authentic testimonials from DGCA CPL graduates who achieved their pilot dreams
          </p>
        </motion.div>

        {/* Controls - Compact */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="rounded-full w-8 h-8 p-0 bg-card/80 backdrop-blur-sm hover:bg-card border-border shadow-sm"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex gap-1.5" role="tablist" aria-label="Testimonial pages">
            {Array.from({ length: totalPages }).map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  scale: index === currentIndex ? 1.1 : 1,
                  opacity: index === currentIndex ? 1 : 0.7
                }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.3,
                  ease: "easeInOut"
                }}
              >
                <Button
                  variant={index === currentIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "rounded-full transition-all duration-300 relative overflow-hidden",
                    index === currentIndex 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground w-3 h-3 p-0" 
                      : "bg-muted hover:bg-muted/80 w-2.5 h-2.5 p-0"
                  )}
                  aria-label={`Go to testimonial page ${index + 1}`}
                  aria-selected={index === currentIndex}
                  role="tab"
                >
                  {/* Auto-play progress indicator for current page */}
                  {index === currentIndex && isAutoPlaying && (
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground/20 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 3,
                        ease: "linear",
                        repeat: Infinity
                      }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="rounded-full w-8 h-8 p-0 bg-card/80 backdrop-blur-sm hover:bg-card border-border shadow-sm"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Testimonials Grid - Enhanced with smooth auto-scroll animations */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto cursor-grab active:cursor-grabbing"
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.2 : 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
            opacity: { duration: prefersReducedMotion ? 0.1 : 0.4 },
            x: { duration: prefersReducedMotion ? 0.1 : 0.5 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
          role="group"
          aria-label={`Testimonials page ${currentIndex + 1} of ${totalPages}`}
          style={{
            height: '320px', // Fixed height to prevent overflow
            touchAction: 'pan-y pinch-zoom'
          }}
        >
          {visibleTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>


      </div>
    </section>
  );
}