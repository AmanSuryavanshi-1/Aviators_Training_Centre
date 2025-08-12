"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Star, Users, ChevronLeft, ChevronRight, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { youtubeShorts, studentsData, generateEmbedUrl, getAllSEOKeywords, getVideoSEOData } from '@/lib/testimonials/data';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import VideoCardSkeleton from './VideoCardSkeleton';
import { easingFunctions } from '@/lib/animations/easing';

// Performance-optimized animation variants with GPU acceleration
const carouselVariants = {
  hidden: { 
    opacity: 0, 
    transform: 'translate3d(0, 20px, 0)',
    willChange: 'transform, opacity'
  },
  visible: { 
    opacity: 1, 
    transform: 'translate3d(0, 0, 0)',
    willChange: 'auto',
    transition: { 
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier for natural motion
      staggerChildren: 0.05
    }
  }
};

// Ultra-smooth animations with no glitches
const createCardVariants = (prefersReducedMotion: boolean) => {
  const smoothTransition = {
    type: "tween" as const,
    ease: [0.25, 0.1, 0.25, 1],
    duration: prefersReducedMotion ? 0.2 : 0.8
  };

  return {
    center: {
      scale: 1,
      y: 0,
      opacity: 1,
      zIndex: 3,
      filter: 'blur(0px)',
      transition: smoothTransition
    },
    adjacent: {
      scale: 0.85,
      y: 10,
      opacity: 0.8,
      zIndex: 2,
      filter: 'blur(1px)',
      transition: smoothTransition
    },
    distant: {
      scale: 0.7,
      y: 20,
      opacity: 0.6,
      zIndex: 1,
      filter: 'blur(2px)',
      transition: smoothTransition
    },
    hidden: {
      scale: 0.5,
      y: 30,
      opacity: 0,
      zIndex: 0,
      filter: 'blur(3px)',
      transition: smoothTransition
    }
  };
};

// Remove the duplicate interface since we already added it above

interface VideoCardProps {
  video: any;
  student: any;
  position: 'center' | 'adjacent' | 'distant' | 'hidden';
  isPlaying: boolean;
  onPlayToggle: () => void;
  height: string;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  student, 
  position, 
  isPlaying, 
  onPlayToggle,
  height,
  onClick 
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default for better UX
  const [showControls, setShowControls] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const getCardDimensions = () => {
    switch (position) {
      case 'center': return {
        height: 'h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh]',
        width: 'w-[85vw] sm:w-[70vw] md:w-[240px] lg:w-[260px] max-w-[260px]',
        aspectRatio: '9/16'
      };
      case 'adjacent': return {
        height: 'h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh]',
        width: 'w-[70vw] sm:w-[55vw] md:w-[200px] lg:w-[220px] max-w-[220px]',
        aspectRatio: '9/16'
      };
      case 'distant': return {
        height: 'h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh]',
        width: 'w-[55vw] sm:w-[45vw] md:w-[160px] lg:w-[180px] max-w-[180px]',
        aspectRatio: '9/16'
      };
      default: return {
        height: 'h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh]',
        width: 'w-[45vw] sm:w-[35vw] md:w-[120px] lg:w-[140px] max-w-[140px]',
        aspectRatio: '9/16'
      };
    }
  };

  const cardDimensions = getCardDimensions();

  return (
    <motion.div
      className={cn(
        "relative rounded-3xl overflow-hidden bg-card border border-border/50",
        "hover:shadow-2xl hover:shadow-primary/10",
        "backdrop-blur-sm bg-gradient-to-br from-card/95 to-card/80",
        cardDimensions.height,
        cardDimensions.width,
        "mx-auto group cursor-pointer flex-shrink-0"
      )}
      variants={createCardVariants(prefersReducedMotion)}
      animate={position}
      whileHover={{ 
        scale: position === 'center' ? 1.02 : 0.98,
        transition: { type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }
      }}
      onHoverStart={() => {
        if (!prefersReducedMotion && position === 'center') {
          setTimeout(() => setShowControls(true), 200);
        }
      }}
      onHoverEnd={() => {
        if (!prefersReducedMotion) {
          setShowControls(false);
        }
      }}
      onClick={onClick}
      style={{ 
        aspectRatio: cardDimensions.aspectRatio,
        boxShadow: position === 'center' 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
      // SEO Enhancement: Add structured data attributes
      itemScope
      itemType="https://schema.org/VideoObject"
      data-video-id={video.videoId}
      data-student-name={video.studentName}
      data-course={student?.course}
      data-subjects={video.subjects?.join(',')}
      data-keywords={video.seoKeywords?.join(',')}
    >
      {/* Background Blur Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt=""
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            position === 'center' ? "scale-105 opacity-30" : "scale-100 opacity-10"
          )}
          style={{ filter: 'blur(20px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-background/60" />
      </div>

      {/* Video Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Video Player Area */}
        <div className="flex-1 relative overflow-hidden rounded-t-2xl">
          {isPlaying && position === 'center' ? (
            <div className="relative w-full flex-1 bg-black rounded-lg overflow-hidden">
              {/* Video with delay to prevent YouTube interface flash */}
              <div className="relative w-full h-full">
                <iframe
                  src={`${generateEmbedUrl(video.videoId)}&autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${video.videoId}${isMuted ? '&mute=1' : '&mute=0'}&enablejsapi=1`}
                  title={`${video.studentName} - ${student?.course || 'Aviation Training'} Success Story Testimonial`}
                  className="w-full h-full border-0 pointer-events-none"
                  style={{ 
                    aspectRatio: '9/16',
                    minHeight: '100%',
                    transform: 'scale(1.2)',
                    transformOrigin: 'center',
                    opacity: isVideoLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                  allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setTimeout(() => setIsVideoLoaded(true), 500)}
                  // SEO Enhancement: Add structured data attributes
                  itemProp="embedUrl"
                  data-video-title={`${video.studentName} testimonial`}
                  data-video-description={`${video.studentName} shares their success story in ${video.subjects?.join(' and ')} at Aviators Training Centre`}
                  data-video-keywords={video.seoKeywords?.join(',')}
                  data-video-duration={video.duration}
                  data-video-upload-date={video.uploadDate}
                />
                
                {/* Video Controls - Bottom right corner with aviation theme */}
                <div className="absolute bottom-6 right-2 flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayToggle();
                    }}
                    className="p-2 rounded-full bg-teal-600/90 backdrop-blur-md text-white border border-teal-500/30 hover:bg-teal-500 hover:border-teal-400/50 transition-all duration-200 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="p-2 rounded-full bg-cyan-600/90 backdrop-blur-md text-white border border-cyan-500/30 hover:bg-cyan-500 hover:border-cyan-400/50 transition-all duration-200 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              
              {/* Aviation-themed loading overlay */}
              {!isVideoLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 flex items-center justify-center z-10">
                  <div className="text-center relative">
                    {/* Animated aviation elements */}
                    <div className="relative mb-6">
                      {/* Main plane animation */}
                      <motion.div
                        className="relative"
                        animate={{
                          y: [-5, 5, -5],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: easingFunctions.easeInOut
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-teal-600/20 backdrop-blur-sm flex items-center justify-center border border-teal-500/30">
                          <Plane className="w-6 h-6 text-teal-400" />
                        </div>
                      </motion.div>
                      
                      {/* Rotating rings */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-teal-500/30"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: easingFunctions.linear
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-cyan-400/20"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: easingFunctions.linear
                        }}
                      />
                      
                      {/* Pulsing outer ring */}
                      <motion.div
                        className="absolute -inset-2 rounded-full border border-teal-400/10"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: easingFunctions.easeInOut
                        }}
                      />
                    </div>
                    
                    {/* Loading text with typewriter effect */}
                    <motion.p
                      className="text-teal-300 text-sm font-medium mb-2"
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: easingFunctions.easeInOut
                      }}
                    >
                      Loading testimonial...
                    </motion.p>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: easingFunctions.easeInOut
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 3) * 20}%`,
                          }}
                          animate={{
                            y: [-20, -40, -20],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: easingFunctions.easeInOut
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              {/* Enhanced Thumbnail with Professional Blur Background */}
              <div className="absolute inset-0">
                {/* Blurred background layer */}
                <div className="absolute inset-0 scale-110">
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(8px)' }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/40" />
                </div>
                
                {/* Sharp foreground image with SEO Enhancement */}
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={`${video.studentName} - ${student?.course || 'Aviation Training'} graduate testimonial video. Success story from ${video.subjects?.join(' and ')} training at Aviators Training Centre.`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    itemProp="thumbnailUrl"
                    data-student={video.studentName}
                    data-course={student?.course}
                    data-subjects={video.subjects?.join(',')}
                    data-keywords={video.seoKeywords?.join(',')}
                  />
                  
                  {/* Professional overlay with subtle pattern */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.1)_70%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.05)_70%)]" />
                </div>
              </div>
              
              {/* Elegant Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  onClick={onPlayToggle}
                  className={cn(
                    "relative rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg",
                    "border-2 border-white/50 text-teal-600",
                    position === 'center' 
                      ? "w-16 h-16" 
                      : "w-12 h-12"
                  )}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    borderColor: "rgba(20, 184, 166, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "tween", duration: 0.2 }}
                  aria-label={`Play testimonial by ${student?.name}`}
                >
                  <Play 
                    className={cn(
                      "ml-0.5 transition-colors duration-200",
                      position === 'center' ? "w-6 h-6" : "w-4 h-4"
                    )} 
                    fill="currentColor" 
                  />
                </motion.button>
              </div>

              {/* Clean interface - no overlays */}
            </div>
          )}

          {/* Video is locked - no controls shown */}
        </div>

        {/* Enhanced Student Information */}
        <div className="p-4 bg-gradient-to-t from-card/95 to-transparent space-y-3">
          {/* Course/Subject Tags with SEO Enhancement */}
          {video.subjects && video.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.subjects.slice(0, 2).map((subject, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 rounded-md bg-aviation-primary/10 text-aviation-primary text-xs font-medium"
                  itemProp="about"
                  data-subject={subject}
                >
                  {subject}
                </span>
              ))}
              {video.subjects.length > 2 && (
                <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                  +{video.subjects.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Student Name and Verification with SEO Enhancement */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                className={cn(
                  "font-semibold text-card-foreground truncate",
                  position === 'center' ? "text-lg" : "text-base"
                )}
                itemProp="name"
              >
                {video.studentName || student?.name || 'Aviation Graduate'}
              </h3>
              <p 
                className={cn(
                  "text-muted-foreground",
                  position === 'center' ? "text-sm" : "text-xs"
                )}
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span itemProp="name" className="sr-only">{video.studentName}</span>
                Class of {student?.gradYear || '2024'}
              </p>
              {/* Hidden SEO content for this specific video */}
              <div className="sr-only" itemProp="description">
                {video.studentName} testimonial for {video.subjects?.join(' and ')} training at Aviators Training Centre. 
                Graduate of {student?.course} program. Keywords: {video.seoKeywords?.join(', ')}.
              </div>
            </div>

            {student?.verified && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 transition-all duration-500 pointer-events-none",
        "group-hover:opacity-100"
      )} />

      {/* Breathing border on hover */}
      <div className={cn(
        "absolute inset-0 rounded-3xl border-2 border-teal-500/0 transition-all duration-500 pointer-events-none",
        position === 'center' && "group-hover:border-teal-500/30"
      )} />

      {/* Testimonial tag - Top right corner with aviation theme */}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-xl bg-teal-700/90 backdrop-blur-md text-white text-xs font-medium border border-teal-500/30 shadow-lg z-20">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          TESTIMONIAL
        </div>
      </div>
    </motion.div>
  );
};

export default function InfiniteVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [videoPlayTime, setVideoPlayTime] = useState<Record<string, number>>({});
  const [userInteracted, setUserInteracted] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState<Record<string, number>>({});
  const [showNextButton, setShowNextButton] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const nextButtonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  // SEO Enhancement: Generate structured data for video testimonials
  const generateVideoTestimonialSchema = (video: any, student: any) => {
    const seoData = getVideoSEOData(video.id);
    if (!seoData) return null;

    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": seoData.title,
      "description": seoData.description,
      "thumbnailUrl": video.thumbnailUrl,
      "uploadDate": video.uploadDate,
      "duration": `PT${video.duration}S`,
      "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
      "contentUrl": `https://www.youtube.com/watch?v=${video.videoId}`,
      "publisher": {
        "@type": "Organization",
        "name": "Aviators Training Centre",
        "url": "https://www.aviatorstrainingcentre.in"
      },
      "author": {
        "@type": "Person",
        "name": video.studentName
      },
      "keywords": seoData.keywords.join(", "),
      "educationalLevel": "Professional",
      "learningResourceType": "Testimonial",
      "about": {
        "@type": "Course",
        "name": student?.course || "Aviation Training",
        "provider": {
          "@type": "Organization",
          "name": "Aviators Training Centre"
        }
      }
    };
  };

  // Create infinite loop by duplicating videos
  const extendedVideos = [...youtubeShorts, ...youtubeShorts, ...youtubeShorts];
  const studentMap = new Map(studentsData.map(s => [s.id, s]));

  // SEO Enhancement: Get all unique keywords for hidden content
  const allSEOKeywords = getAllSEOKeywords();
  const currentVideo = extendedVideos[currentIndex];
  const currentStudent = studentMap.get(currentVideo?.studentId || '');
  const currentVideoSchema = currentVideo ? generateVideoTestimonialSchema(currentVideo, currentStudent) : null;

  // SEO Enhancement: Generate dynamic page title based on current video
  React.useEffect(() => {
    if (currentVideo && currentStudent && typeof document !== 'undefined') {
      const seoTitle = `${currentVideo.studentName} - ${currentStudent.course} Success Story | Aviation Training Testimonials`;
      const metaDescription = `Watch ${currentVideo.studentName}'s testimonial about ${currentVideo.subjects?.join(' and ')} training at Aviators Training Centre. ${currentVideo.seoKeywords?.slice(0, 3).join(', ')}.`;
      
      // Update page title dynamically for better SEO
      document.title = seoTitle;
      
      // Update meta description if it exists
      const metaDescElement = document.querySelector('meta[name="description"]');
      if (metaDescElement) {
        metaDescElement.setAttribute('content', metaDescription);
      }
    }
  }, [currentVideo, currentStudent]);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance functionality - COMPLETELY DISABLED when video is playing
  useEffect(() => {
    // CRITICAL: Only auto-advance if NO video is currently playing
    if (isAutoPlaying && !playingVideoId && isInView && !prefersReducedMotion) {
      console.log('Starting auto-advance - no video playing');
      // Use requestAnimationFrame for smoother animations
      let animationId: number;
      let lastTime = 0;
      const interval = 2500; // 2.5 seconds per slide when no video is playing
      
      const animate = (currentTime: number) => {
        // Double-check that no video is playing before advancing
        if (playingVideoId) {
          console.log('Stopping auto-advance - video is now playing');
          return;
        }
        
        if (currentTime - lastTime >= interval) {
          setCurrentIndex((prev) => {
            const nextIndex = (prev + 1) % extendedVideos.length;
            // Reset to beginning of original array when we reach the end of extended array
            if (nextIndex >= youtubeShorts.length * 2) {
              return youtubeShorts.length; // Start from second set for smooth transition
            }
            return nextIndex;
          });
          lastTime = currentTime;
        }
        animationId = requestAnimationFrame(animate);
      };
      
      animationId = requestAnimationFrame(animate);
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    } else if (isAutoPlaying && !playingVideoId && isInView && prefersReducedMotion) {
      console.log('Starting auto-advance (reduced motion) - no video playing');
      // Fallback to regular interval for reduced motion users
      intervalRef.current = setInterval(() => {
        // Double-check that no video is playing before advancing
        if (playingVideoId) {
          console.log('Stopping auto-advance (reduced motion) - video is now playing');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return;
        }
        
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % extendedVideos.length;
          if (nextIndex >= youtubeShorts.length * 2) {
            return youtubeShorts.length;
          }
          return nextIndex;
        });
      }, 3000); // 3 seconds for reduced motion users
    } else {
      console.log('Stopping auto-advance - video playing or conditions not met');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, playingVideoId, isInView, prefersReducedMotion, extendedVideos.length, youtubeShorts.length]);

  // Force stop auto-advance when video starts playing
  useEffect(() => {
    if (playingVideoId) {
      console.log(`🛑 Video ${playingVideoId} is playing - forcing stop of auto-advance`);
      // Force clear any auto-advance intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [playingVideoId]);

  // Cleanup video timers on unmount
  useEffect(() => {
    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      if (nextButtonTimerRef.current) {
        clearTimeout(nextButtonTimerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handlePlayToggle = (videoId: string) => {
    if (playingVideoId === videoId) {
      console.log(`⏸️ Pausing video ${videoId}`);
      setPlayingVideoId(null);
      setIsPaused(false);
      setShowNextButton(false);
      
      // Clear any existing timers when pausing
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      if (nextButtonTimerRef.current) {
        clearTimeout(nextButtonTimerRef.current);
      }
    } else {
      console.log(`▶️ Starting video ${videoId}`);
      
      // Stop any currently playing video first
      if (playingVideoId) {
        console.log(`⏹️ Stopping currently playing video ${playingVideoId}`);
        if (videoTimerRef.current) {
          clearTimeout(videoTimerRef.current);
        }
        if (videoCheckInterval.current) {
          clearInterval(videoCheckInterval.current);
        }
        if (nextButtonTimerRef.current) {
          clearTimeout(nextButtonTimerRef.current);
        }
      }
      
      setPlayingVideoId(videoId);
      setIsPaused(true);
      setShowNextButton(false);
      
      // Record when video started playing
      const startTime = Date.now();
      setVideoStartTime(prev => ({ ...prev, [videoId]: startTime }));
      
      // Track video play count for analytics
      const currentPlayTime = videoPlayTime[videoId] || 0;
      const newPlayTime = currentPlayTime + 1;
      setVideoPlayTime(prev => ({ ...prev, [videoId]: newPlayTime }));
      
      // Start monitoring video completion
      startVideoCompletionMonitoring(videoId);
    }
  };

  // Monitor video completion and handle auto-advance - CONSERVATIVE APPROACH
  const startVideoCompletionMonitoring = (videoId: string) => {
    // Clear any existing monitoring
    if (videoCheckInterval.current) {
      clearInterval(videoCheckInterval.current);
    }
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
    }
    
    const videoStartTime = Date.now();
    const estimatedDuration = getEstimatedVideoDuration(videoId);
    let hasShownNextButton = false;
    
    console.log(`🎥 Starting video monitoring for ${videoId}, estimated duration: ${estimatedDuration}ms (${estimatedDuration/1000}s)`);
    
    videoCheckInterval.current = setInterval(() => {
      const elapsedTime = Date.now() - videoStartTime;
      
      // Show next button after 80% of video duration or minimum 20 seconds (more conservative)
      const nextButtonTime = Math.max(20000, estimatedDuration * 0.8);
      if (!hasShownNextButton && elapsedTime > nextButtonTime) {
        setShowNextButton(true);
        hasShownNextButton = true;
        console.log(`⏭️ Showing next button after ${elapsedTime}ms`);
      }
      
      // CONSERVATIVE: Auto-advance only after video completes + generous buffer
      const completionTime = estimatedDuration + 5000; // Add 5 second buffer to ensure full playback
      if (elapsedTime >= completionTime) {
        console.log(`✅ Video ${videoId} completed after ${elapsedTime}ms (${elapsedTime/1000}s), advancing to next`);
        
        // Video completed, auto-advance to next
        setPlayingVideoId(null);
        setIsPaused(false);
        setShowNextButton(false);
        
        // Clear the monitoring interval
        if (videoCheckInterval.current) {
          clearInterval(videoCheckInterval.current);
        }
        
        // Auto-advance to next video after a brief pause for smooth transition
        setTimeout(() => {
          handleNext();
        }, 2000); // 2 second pause before advancing
        
        return;
      }
      
      // Log progress every 10 seconds for debugging
      if (elapsedTime % 10000 < 1000) {
        console.log(`⏱️ Video ${videoId} progress: ${elapsedTime}ms / ${completionTime}ms (${Math.round((elapsedTime/completionTime)*100)}%)`);
      }
    }, 1000); // Check every second
    
    // Very generous fallback timeout - 3 minutes maximum
    const maxDuration = Math.max(180000, estimatedDuration * 3); // 3 minutes or 3x estimated duration
    videoTimerRef.current = setTimeout(() => {
      console.log(`⚠️ Video ${videoId} fallback timeout reached after ${maxDuration}ms, advancing to next`);
      
      setPlayingVideoId(null);
      setIsPaused(false);
      setShowNextButton(false);
      
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      
      handleNext();
    }, maxDuration);
  };

  // Get actual video duration from data or use default
  const getEstimatedVideoDuration = (videoId: string): number => {
    // Find the video in our data to get the actual duration
    const video = extendedVideos.find(v => v.videoId === videoId || v.id === videoId);
    if (video && video.duration) {
      console.log(`📊 Found duration for ${videoId}: ${video.duration}s`);
      return video.duration * 1000; // Convert to milliseconds
    }
    
    // Fallback: Conservative estimate for YouTube Shorts: 60 seconds
    console.log(`⚠️ No duration found for ${videoId}, using fallback: 60s`);
    return 60000;
  };

  const handlePrevious = () => {
    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev - 1 + extendedVideos.length) % extendedVideos.length;
        const video = extendedVideos[newIndex];
        const student = studentMap.get(video.studentId || '');
        setAnnouncement(`Previous testimonial: ${student?.name || 'Aviation Graduate'}`);
        return newIndex;
      });
      setPlayingVideoId(null);
      setIsPaused(false);
      setShowNextButton(false);
      // Clear video timers when manually navigating
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      if (nextButtonTimerRef.current) {
        clearTimeout(nextButtonTimerRef.current);
      }
    });
  };

  const handleNext = () => {
    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % extendedVideos.length;
        const video = extendedVideos[newIndex];
        const student = studentMap.get(video.studentId || '');
        setAnnouncement(`Next testimonial: ${student?.name || 'Aviation Graduate'}`);
        return newIndex;
      });
      setPlayingVideoId(null);
      setIsPaused(false);
      setShowNextButton(false);
      // Clear video timers when manually navigating
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      if (nextButtonTimerRef.current) {
        clearTimeout(nextButtonTimerRef.current);
      }
    });
  };

  // Optimized keyboard navigation with throttling
  useEffect(() => {
    let lastKeyTime = 0;
    const keyThrottle = 200; // Prevent rapid key presses
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInView) return;
      
      const now = Date.now();
      if (now - lastKeyTime < keyThrottle) return;
      lastKeyTime = now;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          setIsAutoPlaying(!isAutoPlaying);
          break;
        case 'Enter':
          event.preventDefault();
          const centerVideo = extendedVideos[currentIndex];
          handlePlayToggle(centerVideo.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, currentIndex, isAutoPlaying, extendedVideos]);

  // Optimized Touch/Swipe handlers with momentum
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
    
    // Clean up touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getCardPosition = (index: number): 'center' | 'adjacent' | 'distant' | 'hidden' => {
    const diff = Math.abs(index - currentIndex);
    const wrappedDiff = Math.min(diff, extendedVideos.length - diff);
    
    if (wrappedDiff === 0) return 'center';
    if (wrappedDiff === 1) return 'adjacent';
    if (wrappedDiff === 2) return 'distant';
    return 'hidden';
  };

  // Handle click-to-focus functionality - optimized for smoothness
  const handleCardClick = (targetIndex: number) => {
    if (targetIndex !== currentIndex) {
      // Pause auto-playing during manual transitions
      setIsAutoPlaying(false);
      
      // Clear any existing video timers
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
      }
      if (videoCheckInterval.current) {
        clearInterval(videoCheckInterval.current);
      }
      
      // Smooth transition without glitches
      setCurrentIndex(targetIndex);
      setPlayingVideoId(null);
      setIsPaused(false);
      
      // Start playing the video after animation completes
      setTimeout(() => {
        const video = extendedVideos[targetIndex];
        handlePlayToggle(video.id);
        // Resume auto-playing after 2 seconds
        setTimeout(() => setIsAutoPlaying(true), 2000);
      }, 800);
    }
  };

  const getVisibleIndices = () => {
    const indices = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + extendedVideos.length) % extendedVideos.length;
      indices.push(index);
    }
    return indices;
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-background via-card/30 to-background min-h-screen flex flex-col justify-center"
      variants={carouselVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* SEO Enhancement: Structured Data for Current Video */}
      {currentVideoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(currentVideoSchema)
          }}
        />
      )}

      {/* SEO Enhancement: Hidden Content for Search Engines */}
      <div className="sr-only" aria-hidden="true">
        <h1>DGCA CPL ATPL Aviation Training Success Stories Video Testimonials</h1>
        <p>
          Real success stories from DGCA CPL and ATPL graduates at Aviators Training Centre. 
          Watch verified testimonials from students who achieved their commercial pilot license 
          through our comprehensive ground school training programs.
        </p>
        
        {/* Dynamic SEO Keywords from Video Data */}
        <div>
          <h2>Aviation Training Courses Featured:</h2>
          <ul>
            {[...new Set(youtubeShorts.flatMap(v => v.subjects || []))].map((subject, index) => (
              <li key={index}>{subject} training testimonials and success stories</li>
            ))}
          </ul>
        </div>

        <div>
          <h2>SEO Keywords for Aviation Training:</h2>
          <p>{allSEOKeywords.join(', ')}</p>
        </div>

        {/* Current Video SEO Content */}
        {currentVideo && currentStudent && (
          <div>
            <h3>{currentVideo.studentName} - {currentStudent.course} Graduate</h3>
            <p>
              {currentVideo.studentName} successfully completed {currentStudent.course} at Aviators Training Centre. 
              Specialized in {currentVideo.subjects?.join(', ')} with excellent results. 
              {currentVideo.seoKeywords?.join(', ')}.
            </p>
          </div>
        )}

        {/* All Video Testimonials for SEO */}
        <div>
          <h2>Complete List of Student Success Stories:</h2>
          {youtubeShorts.map((video, index) => {
            const student = studentMap.get(video.studentId || '');
            return (
              <div key={video.id}>
                <h4>{video.studentName} - {student?.course || 'Aviation Training'} Success Story</h4>
                <p>
                  {video.studentName} shares their journey in {video.subjects?.join(' and ')} at Aviators Training Centre. 
                  Graduated in {video.gradYear} with specialization in {video.subjects?.join(', ')}. 
                  Keywords: {video.seoKeywords?.join(', ')}.
                </p>
              </div>
            );
          })}
        </div>

        {/* Aviation Training Institute Information */}
        <div>
          <h2>About Aviators Training Centre</h2>
          <p>
            India's premier DGCA approved aviation training institute specializing in CPL and ATPL ground school preparation. 
            Located in Dwarka, Delhi, serving aspiring pilots across India with comprehensive training programs including 
            Air Navigation, Aviation Meteorology, Technical General, Air Regulations, RTR(A), and Type Rating courses.
          </p>
          <p>
            Our experienced airline pilot instructors provide industry-leading training with 95% success rate in DGCA examinations. 
            Join over 500 successful graduates who chose Aviators Training Centre for their aviation career.
          </p>
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--aviation-primary))_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,hsl(var(--aviation-primary)/0.05)_50%,transparent_51%)] bg-[length:20px_20px]" />
      </div>

      <div className="container relative z-10 max-w-full overflow-hidden px-2 sm:px-4 md:px-6">

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 px-4">
          <button
            onClick={handlePrevious}
            className={cn(
              "p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card text-card-foreground border-2 border-border shadow-sm",
              prefersReducedMotion 
                ? "transition-colors duration-200" 
                : "transition-all duration-300 hover:scale-105"
            )}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium border",
              prefersReducedMotion 
                ? "transition-colors duration-200" 
                : "transition-all duration-300 hover:scale-105",
              isAutoPlaying 
                ? "bg-aviation-primary text-white shadow-lg border-aviation-primary" 
                : "bg-card/80 backdrop-blur-sm text-card-foreground hover:bg-card border-border"
            )}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{isAutoPlaying ? 'Auto-Playing' : 'Paused'}</span>
          </button>

          <button
            onClick={handleNext}
            className={cn(
              "p-3 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card text-card-foreground border-2 border-border shadow-sm",
              prefersReducedMotion 
                ? "transition-colors duration-200" 
                : "transition-all duration-300 hover:scale-105"
            )}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Infinite Carousel */}
        <div 
          className="relative flex items-center justify-center py-8 sm:py-10 md:py-12 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Video testimonials carousel"
          aria-live="polite"
          aria-atomic="false"
          style={{ 
            touchAction: 'pan-y pinch-zoom',
            WebkitOverflowScrolling: 'touch',
            minHeight: '75vh',
            paddingBottom: '2rem' // Extra padding for center card shadow
          }}
        >
          <div className="relative w-full max-w-full mx-auto overflow-hidden px-2 sm:px-4 pb-6 sm:pb-8 md:pb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
              {isLoading ? (
                // Skeleton loading state
                <>
                  <div className="flex-shrink-0 hidden lg:block">
                    <VideoCardSkeleton position="distant" />
                  </div>
                  <div className="flex-shrink-0 hidden md:block">
                    <VideoCardSkeleton position="adjacent" />
                  </div>
                  <div className="flex-shrink-0">
                    <VideoCardSkeleton position="center" />
                  </div>
                  <div className="flex-shrink-0 hidden md:block">
                    <VideoCardSkeleton position="adjacent" />
                  </div>
                  <div className="flex-shrink-0 hidden lg:block">
                    <VideoCardSkeleton position="distant" />
                  </div>
                </>
              ) : (
                // Actual video cards
                getVisibleIndices().map((index, arrayIndex) => {
                  const video = extendedVideos[index];
                  const student = studentMap.get(video.studentId || '');
                  const position = getCardPosition(index);
                  
                  return (
                    <motion.div
                      key={`${video.id}-${index}`}
                      className={cn(
                        "flex-shrink-0",
                        position === 'hidden' && "hidden lg:block"
                      )}
                      aria-hidden={position === 'hidden'}
                      tabIndex={position === 'center' ? 0 : -1}
                      layout
                    >
                      <VideoCard
                        video={video}
                        student={student}
                        position={position}
                        isPlaying={playingVideoId === video.id}
                        onPlayToggle={() => handlePlayToggle(video.id)}
                        height={position === 'center' ? '75vh' : position === 'adjacent' ? '65vh' : '55vh'}
                        onClick={() => handleCardClick(index)}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div 
          className="flex justify-center gap-1 sm:gap-2 mt-6 md:mt-8 px-4"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {youtubeShorts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-aviation-primary focus:ring-offset-2",
                (currentIndex % youtubeShorts.length) === index 
                  ? "bg-aviation-primary w-8" 
                  : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
              )}
              role="tab"
              aria-selected={(currentIndex % youtubeShorts.length) === index}
              aria-label={`Go to testimonial ${index + 1} of ${youtubeShorts.length}`}
            />
          ))}
        </div>

        {/* Navigation Hints */}
        <motion.div 
          className="text-center mt-4 md:mt-6 px-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted-foreground text-xs sm:text-sm">
            <span className="hidden sm:inline">Use ← → arrow keys, swipe, or click controls to navigate • Press Space to pause • Enter to play</span>
            <span className="sm:hidden">Swipe or tap controls to navigate</span>
          </p>
        </motion.div>

        {/* SEO Enhancement: Comprehensive Summary Section */}
        <motion.div 
          className="sr-only mt-8 md:mt-12 px-4 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
              Why Our Students Choose Aviators Training Centre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">DGCA Approved Curriculum</h4>
                <p>Comprehensive training in Air Navigation, Meteorology, Technical General, and Air Regulations</p>
              </div>
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">95% Success Rate</h4>
                <p>Proven track record with over 500 successful CPL and ATPL graduates</p>
              </div>
              <div className="bg-card/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Expert Instructors</h4>
                <p>Learn from experienced airline pilots and aviation industry professionals</p>
              </div>
            </div>
            
            {/* Dynamic course information based on current testimonials */}
            <div className="mt-6 text-xs text-muted-foreground">
              <p>
                Featured courses: {[...new Set(youtubeShorts.flatMap(v => v.subjects || []))].slice(0, 6).join(' • ')}
                {[...new Set(youtubeShorts.flatMap(v => v.subjects || []))].length > 6 && ' • and more'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}