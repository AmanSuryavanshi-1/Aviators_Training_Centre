"use client"
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Pause, X, ChevronLeft, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { youtubeShorts, studentsData, generateEmbedUrl } from '@/lib/testimonials/data';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Aviation-inspired animation variants
const cloudParticleVariants = {
  float: {
    y: [-10, 10, -10],
    x: [-5, 5, -5],
    opacity: [0.3, 0.7, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const videoGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const videoCardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.9,
    rotateY: -15
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -12,
    scale: 1.05,
    rotateY: 5,
    boxShadow: "0 25px 50px rgba(6, 182, 212, 0.25)",
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 100
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    y: 100,
    transition: { 
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

interface VideoModalProps {
  video: any;
  student: any;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, student, isOpen, onClose }) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className={cn(
            "relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl",
            isTheaterMode 
              ? "w-full h-full max-w-none max-h-none" 
              : "w-full max-w-4xl max-h-[90vh]"
          )}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {student?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{student?.name || 'Aviation Graduate'}</h3>
                <p className="text-teal-400 text-sm">{student?.course || 'Aviation Training'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition-colors"
                aria-label="Toggle theater mode"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className={cn(
            "relative bg-black",
            isTheaterMode ? "aspect-video" : "aspect-[9/16] md:aspect-video"
          )}>
            <iframe
              src={`${generateEmbedUrl(video.videoId)}&autoplay=1${isMuted ? '&mute=1' : ''}`}
              title={`${student?.name} testimonial`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Student Info */}
          {!isTheaterMode && (
            <div className="p-6 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold text-lg mb-1">
                    Success Story: {student?.name}
                  </h4>
                  <p className="text-teal-400 mb-2">{student?.course}</p>
                  {student?.gradYear && (
                    <p className="text-slate-400 text-sm">Class of {student.gradYear}</p>
                  )}
                </div>
                {student?.verified && (
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    ✓ Verified Graduate
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface VideoCarouselProps {
  videos: any[];
  students: Map<string, any>;
  onVideoClick: (video: any, student: any) => void;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos, students, onVideoClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying && hoveredIndex === null) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(videos.length / 4));
      }, 8000);
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
  }, [isAutoPlaying, hoveredIndex, videos.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(videos.length / 4)) % Math.ceil(videos.length / 4));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(videos.length / 4));
  };

  const visibleVideos = videos.slice(currentIndex * 4, (currentIndex + 1) * 4);

  return (
    <div className="relative">
      {/* Carousel Controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Video Testimonials
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isAutoPlaying 
                ? "bg-teal-600 text-white" 
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}
            aria-label={isAutoPlaying ? "Pause auto-scroll" : "Resume auto-scroll"}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePrevious}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Previous videos"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Next videos"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={videoGridVariants}
        initial="hidden"
        animate="visible"
        key={currentIndex}
      >
        {visibleVideos.map((video, index) => {
          const student = students.get(video.studentId || '');
          const globalIndex = currentIndex * 4 + index;
          
          return (
            <motion.div
              key={video.id}
              className="group cursor-pointer"
              variants={videoCardVariants}
              whileHover="hover"
              onMouseEnter={() => setHoveredIndex(globalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onVideoClick(video, student)}
            >
              <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-lg">
                {/* Video Thumbnail */}
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={`${student?.name} testimonial`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-5 h-5 text-teal-700 ml-0.5" fill="currentColor" />
                      </motion.div>
                    </div>

                    {/* Cloud particles on hover */}
                    <AnimatePresence>
                      {hoveredIndex === globalIndex && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white/40 rounded-full"
                              style={{
                                left: `${30 + i * 20}%`,
                                top: `${20 + i * 15}%`,
                              }}
                              variants={cloudParticleVariants}
                              initial={{ opacity: 0, scale: 0 }}
                              animate="float"
                              exit={{ opacity: 0, scale: 0 }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Student Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {student?.name || 'Aviation Graduate'}
                  </h4>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">
                    {student?.course || 'Aviation Training'}
                  </p>
                  {student?.gradYear && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Class of {student.gradYear}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(videos.length / 4) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-teal-600 w-8" 
                : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function EnhancedTestimonialsSection() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const studentMap = new Map(studentsData.map(s => [s.id, s]));

  const handleVideoClick = (video: any, student: any) => {
    setSelectedVideo(video);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
    setSelectedStudent(null);
  };

  return (
    <motion.section
      ref={sectionRef}
      className="py-20 md:py-28 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-teal-50/30 dark:from-slate-900/80 dark:via-slate-800 dark:to-teal-950/30" />

      <div className="container relative z-10">
        <VideoCarousel
          videos={youtubeShorts}
          students={studentMap}
          onVideoClick={handleVideoClick}
        />
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.section>
  );
}