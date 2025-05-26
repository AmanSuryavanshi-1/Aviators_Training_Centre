"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, Star, Quote, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/components/ui/utils';
import { SolidButton } from '@/components/shared/SolidButton';
import { TransparentButton } from '@/components/shared/TransparentButton';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

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

// --- Video Player Component ---
interface VideoPlayerProps {
  testimonial: VideoTestimonial;
  isActive: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ testimonial, isActive }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handlePlay = () => {
    setShowVideo(true);
    setIsPlaying(true);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      <motion.div
        className="overflow-hidden relative bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl dark:from-teal-900/20 dark:to-blue-900/20"
        whileHover="hover"
        initial="rest"
        variants={cardHoverEffect}
      >
        {!showVideo ? (
          <div className="relative aspect-[9/16]">
            <img
              src={testimonial.thumbnail}
              alt={`${testimonial.name} testimonial`}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholders/testimonial-avatar.svg';
                target.alt = 'Placeholder Testimonial Avatar';
              }}
            />
            <div className="absolute inset-0 transition-colors duration-300 bg-black/20 group-hover:bg-black/10" />
            <motion.button
              onClick={handlePlay}
              className="flex absolute inset-0 justify-center items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex justify-center items-center w-16 h-16 rounded-full shadow-lg backdrop-blur-sm bg-white/90">
                <Play className="ml-1 w-6 h-6 text-teal-600" />
              </div>
            </motion.button>
          </div>
        ) : (
          <div className="aspect-[9/16]">
            <iframe
              src={`${testimonial.videoUrl}?autoplay=1`}
              className="w-full h-full rounded-t-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
            <div className="p-4">
              <div>
                <h4 className="mb-1 text-lg font-semibold transition-colors group-hover:text-teal-600">{testimonial.name}</h4>
                {/* Role and company are not displayed as per request */}
              </div>
              {testimonial.quote && <p className="text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">"{testimonial.quote}"</p>} {/* Optional description, smaller text, line-clamp for brevity */}
            </div>
      </motion.div>
    </motion.div>
  );
};

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
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
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

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
        <Card className={cn(
          "overflow-hidden w-full bg-gradient-to-br shadow-lg transition-shadow duration-300 hover:shadow-xl",
          "from-gray-50 to-blue-50 dark:from-gray-800/40 dark:to-blue-900/30",
          "border-gray-200 dark:border-gray-700/60",
          "flex flex-col h-[20rem] max-lg:h-auto" // Increased height for better content display
        )}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="object-cover w-16 h-16 rounded-full border-2 border-teal-200 dark:border-teal-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholders/testimonial-avatar.svg'; // Fallback to generic placeholder
                  target.alt = 'Placeholder Student Avatar';
                }}
              />
              <div className="flex absolute -right-1 -bottom-1 justify-center items-center w-6 h-6 bg-teal-500 rounded-full">
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
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">({testimonial.rating}/5)</span>
              </div>
            </div>
          </div>
          <Quote className="w-8 h-8 text-teal-300 dark:text-teal-600" />
        </div>
      </CardHeader>
            <CardContent className="flex overflow-y-auto flex-col flex-grow px-6 pt-2 pb-6"> {/* Adjusted padding, added flex flex-col */}
              <div className="flex-grow mb-3">
                <Quote className="float-left mr-2 mb-2 w-5 h-5 text-teal-500 opacity-60 dark:text-teal-400" />
                <p className="clear-left text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {testimonial.testimonial}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 mt-auto text-xs border-t border-gray-200 text-muted-foreground dark:border-gray-700/30">
                <span className="px-2 py-1 text-teal-700 bg-teal-100 rounded-full dark:bg-teal-900/30 dark:text-teal-300">
                  {testimonial.course}
                </span>
                <span>Graduated {testimonial.graduationYear}</span>
              </div>
            </CardContent>
    </Card>
  );
};

// --- Main Testimonials Section Component ---
const TestimonialsSection: React.FC = () => {
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

  return (
    <motion.section
      id="testimonials"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-16 md:py-20"
    >
      {/* Section Header */}
      <div className="mb-12 text-center md:mb-16">
        <motion.h2
          variants={itemVariants}
          className={cn("mb-4 text-2xl font-bold sm:text-3xl md:text-4xl", aviationPrimary)}
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
      <motion.div variants={itemVariants} className="px-4 mb-16 sm:px-6 lg:px-8">
              <h2 className={`mb-8 text-2xl font-bold text-center sm:text-3xl md:text-4xl ${aviationPrimary}`}>Video Testimonials</h2>
              <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">Watch our successful graduates share their journey and achievements</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {videoTestimonials.map((testimonial, index) => (
            <VideoPlayer
              key={testimonial.id}
              testimonial={testimonial}
              isActive={true}
            />
          ))}
        </div>
      </motion.div>

      {/* Text Testimonials Carousel */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="mb-8 text-center">
          <h3 className={cn("mb-2 text-xl font-semibold sm:text-2xl", aviationSecondary)}>
            Student Success Stories
          </h3>
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">4.8/5 Average Rating</span>
            <span>•</span>
            <span>500+ Success Stories</span>
          </div>
        </div>
        
        <div className="relative px-20 mx-auto max-w-4xl sm:px-24 md:px-28 lg:px-32">
          {/* Carousel Container */}
          <div className="overflow-hidden relative rounded-xl">
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
              >
                <TestimonialCard testimonial={textTestimonials[currentTextIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows - Much better separated positioning */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute -left-8 top-1/2 z-10 w-14 h-14 rounded-full border-teal-200 shadow-xl backdrop-blur-sm transition-all duration-300 -translate-y-1/2 sm:-left-10 md:-left-12 lg:-left-16 bg-white/95 dark:bg-card/95 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:scale-110 hover:shadow-2xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute -right-8 top-1/2 z-10 w-14 h-14 rounded-full border-teal-200 shadow-xl backdrop-blur-sm transition-all duration-300 -translate-y-1/2 sm:-right-10 md:-right-12 lg:-right-16 bg-white/95 dark:bg-card/95 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:scale-110 hover:shadow-2xl"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {textTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentTextIndex
                    ? "bg-teal-500 scale-125"
                    : "bg-teal-200 dark:bg-teal-700 hover:bg-teal-300 dark:hover:bg-teal-600"
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        variants={itemVariants}
        className="p-8 text-center bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border border-teal-100 dark:from-teal-900/20 dark:to-blue-900/20 md:p-12 dark:border-teal-800/30"
      >
        <div className="flex justify-center items-center mb-4">
          <Users className="mr-3 w-8 h-8 text-teal-600" />
          <h3 className={cn("text-2xl font-bold", aviationPrimary)}>
            Join Our Success Stories
          </h3>
        </div>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-foreground/80">
          Ready to start your aviation journey? Join hundreds of successful pilots who chose Aviators Training Centre for their DGCA preparation.
        </p>
        <div className="flex flex-col gap-4 justify-center sm:flex-row">
          <SolidButton
            href="/courses"
            icon={Award}
            label="Explore Courses"
            className="min-w-[160px]"
          />
          <TransparentButton
            href="/contact"
            icon={Users}
            label="Talk to Admissions"
            className="min-w-[160px]"
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default TestimonialsSection;