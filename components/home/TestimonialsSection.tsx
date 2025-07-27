"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Star, Quote, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/components/ui/utils';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// --- Video Testimonials Data ---
interface VideoTestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  thumbnail: string;
  videoUrl: string;
  quote: string;
}

const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Commercial Pilot",
    company: "IndiGo Airlines",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=533&fit=crop&crop=face",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
    quote: "Exceptional training that transformed my aviation career completely."
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "First Officer",
    company: "Air India",
    thumbnail: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=533&fit=crop&crop=face",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    quote: "The structured approach and expert guidance made all the difference."
  },
  {
    id: 3,
    name: "Vikram Singh",
    role: "Training Captain",
    company: "SpiceJet",
    thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=533&fit=crop&crop=face",
    videoUrl: "https://www.youtube.com/embed/L_jWHffIx5E",
    quote: "Outstanding faculty and comprehensive study materials."
  },
  {
    id: 4,
    name: "Amit Patel",
    role: "Aircraft Engineer",
    company: "Jet Airways",
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=533&fit=crop&crop=face",
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    quote: "Technical subjects were explained with real-world examples."
  }
];

// --- Text Testimonials Data ---
interface TextTestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  testimonial: string;
  course: string;
  graduationYear: string;
}

const textTestimonials: TextTestimonial[] = [
  {
    id: 1,
    name: "Arjun Mehta",
    role: "Commercial Pilot",
    company: "Vistara Airlines",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMehta&backgroundColor=b6e3f4,c0aede,d1d4f9&clothingColor=262e33,65c9ff,5199e4&eyeColor=brown&hairColor=2c1b18,724133,d2691e&skinColor=f8d25c",
    rating: 4.7,
    testimonial: "Aviators Training Centre provided exceptional DGCA ground school preparation. The instructors' real-world experience and comprehensive study materials made complex aviation concepts easy to understand. I cleared all my exams in the first attempt!",
    course: "DGCA CPL Ground School",
    graduationYear: "2024"
  },
  {
    id: 2,
    name: "Sneha Reddy",
    role: "First Officer",
    company: "IndiGo Airlines",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy&backgroundColor=ffd5dc,ffdfba,c0aede&clothingColor=3c4f5c,65c9ff&eyeColor=brown&hairColor=2c1b18,4a312c&skinColor=edb98a&top=longHairStraight",
    rating: 4.5,
    testimonial: "The online ground school format was perfect for my schedule. Captain Ankit Kumar's teaching methodology and the 24/7 doubt clearing sessions were invaluable. The mock tests and practice papers were exactly like the actual DGCA exams.",
    course: "ATPL Ground Training",
    graduationYear: "2023"
  },
  {
    id: 3,
    name: "Rohit Sharma",
    role: "Training Captain",
    company: "Air India Express",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RohitSharma&backgroundColor=b6e3f4,d1d4f9&clothingColor=262e33,3c4f5c&eyeColor=brown&hairColor=2c1b18,724133&skinColor=ae5d29&top=shortHairShortFlat",
    rating: 4.7,
    testimonial: "Outstanding Type Rating preparation course! The simulator sessions and technical ground classes were thorough. Dhruv Shirkoli's expertise in aircraft systems made complex topics simple. Highly recommend for serious aviation professionals.",
    course: "A320 Type Rating Prep",
    graduationYear: "2023"
  },
  {
    id: 4,
    name: "Kavya Nair",
    role: "ATC Officer",
    company: "AAI Mumbai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KavyaNair&backgroundColor=ffd5dc,ffdfba&clothingColor=65c9ff,5199e4&eyeColor=brown&hairColor=2c1b18,4a312c&skinColor=f8d25c&top=longHairCurly",
    rating: 4.5,
    testimonial: "The RTR(A) course was comprehensive and well-structured. Saksham Khandelwal's practical approach to radio telephony procedures and the mock ATC sessions prepared me perfectly for the actual examination and my current role.",
    course: "RTR(A) Certification",
    graduationYear: "2024"
  }
];

// --- TypeScript Interfaces ---
interface TestimonialsSectionProps {
  className?: string;
}

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalItems: number;
}

// --- Error Boundary Component ---
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class TestimonialErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Testimonials section error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-muted/50 rounded-xl border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Testimonials Temporarily Unavailable
          </h3>
          <p className="text-muted-foreground">
            We're working to fix this issue. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Video Player Component ---
interface VideoPlayerProps {
  testimonial: VideoTestimonial;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ testimonial }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handlePlay = () => {
    if (!hasError) {
      setShowVideo(true);
    } else if (retryCount < 2) {
      // Allow retry for video loading
      setHasError(false);
      setRetryCount(prev => prev + 1);
      setShowVideo(true);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setShowVideo(false);
    console.warn(`Video failed to load for ${testimonial.name}:`, testimonial.videoUrl);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setIsLoading(false);
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUzMyIgdmlld0JveD0iMCAwIDMwMCA1MzMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNTMzIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE4MCIgcj0iNDAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAzMDBIMjAwQzIwMCAzMDAgMjAwIDI4MCAyMDAgMjgwQzIwMCAyNjAgMTgwIDI0MCAyMDAgMjQwSDE1MEgxMDBDMTIwIDI0MCAxMDAgMjYwIDEwMCAyODBDMTAwIDI4MCAxMDAgMzAwIDEwMCAzMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+VGVzdGltb25pYWwgVmlkZW88L3RleHQ+Cjwvc3ZnPgo=';
    target.alt = `${testimonial.name} testimonial thumbnail`;
  };

  return (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      <motion.div
        className="overflow-hidden relative bg-gradient-to-br from-card to-card/80 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
        whileHover="hover"
        initial="rest"
        variants={cardHoverEffect}
      >
        {!showVideo ? (
          <div className="relative aspect-[9/16]">
            {isLoading && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={testimonial.thumbnail}
              alt={`${testimonial.name} testimonial thumbnail`}
              className="object-cover w-full h-full"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
            />
            {imageError && (
              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-16 mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8" />
                </div>
                <p className="text-sm text-center px-4">
                  {testimonial.name}<br />
                  <span className="text-xs">{testimonial.role}</span>
                </p>
              </div>
            )}
            <div className="absolute inset-0 transition-colors duration-300 bg-black/20 group-hover:bg-black/10" />
            <motion.button
              onClick={handlePlay}
              className="flex absolute inset-0 justify-center items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={hasError && retryCount >= 2 ? `Video unavailable for ${testimonial.name}` : `Play testimonial video from ${testimonial.name}`}
              disabled={hasError && retryCount >= 2}
            >
              <div className={cn(
                "flex justify-center items-center w-16 h-16 rounded-full shadow-lg backdrop-blur-sm transition-colors",
                hasError && retryCount >= 2 
                  ? "bg-muted/90 cursor-not-allowed" 
                  : "bg-white/90 dark:bg-card/90 hover:bg-white dark:hover:bg-card"
              )}>
                <Play className="ml-1 w-6 h-6 text-primary" fill="currentColor" />
              </div>
              {hasError && retryCount < 2 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  Tap to retry
                </div>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="aspect-[9/16]">
            {hasError ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground p-4">
                <div className="w-12 h-12 mb-3 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </div>
                <p className="text-sm text-center mb-2">Video temporarily unavailable</p>
                <p className="text-xs text-center opacity-75">"{testimonial.quote}"</p>
                {retryCount < 2 && (
                  <button
                    onClick={handlePlay}
                    className="mt-3 px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <iframe
                src={`${testimonial.videoUrl}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={handleVideoError}
                title={`${testimonial.name} testimonial video`}
                loading="lazy"
              />
            )}
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-2">
            <h4 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
          </div>
          {testimonial.quote && (
            <div className="relative">
              <Quote className="absolute -left-1 -top-1 w-3 h-3 text-primary/40" />
              <p className="pl-3 text-sm italic text-muted-foreground line-clamp-2">
                {testimonial.quote}
              </p>
            </div>
          )}
          {showVideo && !hasError && (
            <div className="mt-2 text-xs text-primary font-medium">
              ▶ Playing video testimonial
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

// --- Star Rating Component ---
interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
};

// --- Text Testimonial Card Component ---
interface TestimonialCardProps {
  testimonial: TextTestimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = React.memo(({ testimonial }) => {
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setAvatarError(true);
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE2IDUyQzE2IDQ0IDIzIDM4IDMyIDM4UzQ4IDQ0IDQ4IDUyIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
    target.alt = `${testimonial.name} avatar placeholder`;
  };

  return (
        <Card className={cn(
          "overflow-hidden w-full bg-gradient-to-br shadow-lg transition-shadow duration-300 hover:shadow-xl",
          "from-card to-card/90 border-border",
          "flex flex-col h-[24rem] max-lg:h-auto"
        )}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={testimonial.avatar}
                alt={`${testimonial.name} avatar`}
                className="object-cover w-16 h-16 rounded-full border-2 border-primary/20 dark:border-primary/40"
                loading="lazy"
                onError={handleAvatarError}
              />
              <div className="flex absolute -right-1 -bottom-1 justify-center items-center w-6 h-6 bg-primary rounded-full">
                <Award className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {testimonial.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {testimonial.role} at {testimonial.company}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <StarRating rating={testimonial.rating} />
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-500">({testimonial.rating}/5)</span>
              </div>
            </div>
          </div>
          <Quote className="w-8 h-8 text-primary/30 dark:text-primary/60" />
        </div>
      </CardHeader>
            <CardContent className="flex overflow-y-auto flex-col flex-grow px-6 pt-2 pb-6">
              <div className="flex-grow mb-4">
                <div className="relative">
                  <Quote className="absolute -left-1 -top-1 w-4 h-4 text-primary/40" />
                  <p className="pl-4 text-sm leading-relaxed text-foreground">
                    {testimonial.testimonial}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-3 mt-auto border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full dark:bg-primary/20 dark:text-primary">
                    {testimonial.course}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Class of {testimonial.graduationYear}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>⭐ Verified Graduate</span>
                  <span>{testimonial.rating}/5.0 Rating</span>
                </div>
              </div>
            </CardContent>
    </Card>
  );
});

// Add display names for debugging
VideoPlayer.displayName = 'VideoPlayer';
TestimonialCard.displayName = 'TestimonialCard';

// --- Main Testimonials Section Component ---
const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentTextIndex((prev) => (prev + 1) % textTestimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentTextIndex((prev) => (prev - 1 + textTestimonials.length) % textTestimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setDirection(index > currentTextIndex ? 1 : -1);
    setCurrentTextIndex(index);
  };

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentTextIndex]);

  // Keyboard navigation support with focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when testimonials section is focused
      const activeElement = document.activeElement;
      const testimonialsSection = document.getElementById('testimonials');
      
      if (!testimonialsSection?.contains(activeElement)) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevTestimonial();
        // Announce change to screen readers
        announceTestimonialChange('previous');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextTestimonial();
        // Announce change to screen readers
        announceTestimonialChange('next');
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToTestimonial(0);
        announceTestimonialChange('first');
      } else if (e.key === 'End') {
        e.preventDefault();
        goToTestimonial(textTestimonials.length - 1);
        announceTestimonialChange('last');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTextIndex]);

  // Screen reader announcements
  const announceTestimonialChange = (direction: string) => {
    const currentTestimonial = textTestimonials[currentTextIndex];
    const announcement = `${direction === 'next' ? 'Next' : direction === 'previous' ? 'Previous' : direction === 'first' ? 'First' : 'Last'} testimonial: ${currentTestimonial.name}, ${currentTestimonial.role} at ${currentTestimonial.company}. Testimonial ${currentTextIndex + 1} of ${textTestimonials.length}`;
    
    // Create or update live region for announcements
    let liveRegion = document.getElementById('testimonial-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'testimonial-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = announcement;
  };

  // Touch/swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    (e.currentTarget as HTMLElement).dataset.touchStartX = touchStartX.toString();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Minimum swipe distance to trigger navigation
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextTestimonial();
      } else {
        prevTestimonial();
      }
    }
  };

  return (
    <TestimonialErrorBoundary>
      <motion.section
        id="testimonials"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className={cn("space-y-16 md:space-y-20", className)}
      >
      {/* Section Header */}
      <div className="text-center">
        <motion.h2
          variants={itemVariants}
          className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl text-primary"
        >
          What Our Students Say
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-3xl text-lg leading-relaxed text-foreground/80"
        >
          Hear from successful pilots and aviation professionals who achieved their dreams with Aviators Training Centre.
        </motion.p>
      </div>

      {/* Video Testimonials */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-semibold sm:text-2xl text-secondary">
            Video Testimonials
          </h3>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Watch our successful graduates share their journey and achievements
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {videoTestimonials.map((testimonial) => (
            <VideoPlayer
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>
      </motion.div>

      {/* Text Testimonials Carousel */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-semibold sm:text-2xl text-secondary">
            Student Success Stories
          </h3>
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">4.8/5 Average Rating</span>
            <span>•</span>
            <span>500+ Success Stories</span>
          </div>
        </div>
        
        <div className="relative mx-auto max-w-4xl">
          {/* Carousel Container */}
          <div 
            className="overflow-hidden relative rounded-xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Student testimonials carousel"
            aria-describedby="carousel-instructions"
          >
            <div id="carousel-instructions" className="sr-only">
              Use arrow keys to navigate between testimonials, Home key for first testimonial, End key for last testimonial
            </div>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTextIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
                role="tabpanel"
                aria-label={`Testimonial ${currentTextIndex + 1} of ${textTestimonials.length}`}
                tabIndex={0}
              >
                <TestimonialCard testimonial={textTestimonials[currentTextIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="absolute -left-6 top-1/2 z-10 w-12 h-12 rounded-full border-border shadow-lg backdrop-blur-sm transition-all duration-300 -translate-y-1/2 sm:-left-8 md:-left-12 bg-background/95 hover:bg-accent hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="absolute -right-6 top-1/2 z-10 w-12 h-12 rounded-full border-border shadow-lg backdrop-blur-sm transition-all duration-300 -translate-y-1/2 sm:-right-8 md:-right-12 bg-background/95 hover:bg-accent hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-6 space-x-2" role="tablist" aria-label="Testimonial navigation">
            {textTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                role="tab"
                aria-selected={index === currentTextIndex}
                aria-label={`Go to testimonial ${index + 1}`}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  index === currentTextIndex
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        variants={itemVariants}
        className="relative p-8 text-center bg-gradient-to-br from-card to-accent/5 rounded-2xl border border-border md:p-12 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-primary rounded-full" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-primary rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary/30 rounded-full" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full mr-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">
              Join Our Success Stories
            </h3>
          </div>
          <p className="mx-auto mb-2 max-w-2xl text-lg text-foreground/80">
            Ready to start your aviation journey? Join hundreds of successful pilots who chose Aviators Training Centre for their DGCA preparation.
          </p>
          <div className="flex justify-center items-center mb-6 space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span>4.8/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-primary mr-1" />
              <span>500+ Graduates</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-primary mr-1" />
              <span>95% Success Rate</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center sm:flex-row">
            <SolidButton
              href="/courses"
              icon={Award}
              label="Explore Courses"
              className="min-w-[160px] hover:scale-105 transition-transform"
            />
            <TransparentButton
              href="/contact"
              icon={Users}
              label="Talk to Admissions"
              className="min-w-[160px] hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </motion.div>
      </motion.section>
    </TestimonialErrorBoundary>
  );
};

TestimonialsSection.displayName = 'TestimonialsSection';

export default React.memo(TestimonialsSection);