"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import { youtubeShorts, studentsData, generateEmbedUrl, getYouTubeThumbnail } from '@/lib/testimonials/data';
import { cn } from '@/lib/utils';

export default function TestimonialsVideoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const studentMap = new Map(studentsData.map(s => [s.id, s]));

    // Auto-play carousel
    useEffect(() => {
        if (isAutoPlaying && !isPlaying) {
            autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % youtubeShorts.length);
            }, 4000);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, isPlaying]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'Escape' && isPlaying) {
                setIsPlaying(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % youtubeShorts.length);
        setIsAutoPlaying(false);
        setIsPlaying(false);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + youtubeShorts.length) % youtubeShorts.length);
        setIsAutoPlaying(false);
        setIsPlaying(false);
    };

    const getVisibleVideos = () => {
        const videos = [];
        for (let i = -2; i <= 2; i++) {
            const index = (currentIndex + i + youtubeShorts.length) % youtubeShorts.length;
            videos.push({ video: youtubeShorts[index], position: i });
        }
        return videos;
    };

    const visibleVideos = getVisibleVideos();

    const handlePlayClick = () => {
        setIsPlaying(true);
        setIsAutoPlaying(false);
    };

    const handleDragEnd = (event: any, info: any) => {
        const swipeThreshold = 50;
        if (info.offset.x > swipeThreshold) {
            prevSlide();
        } else if (info.offset.x < -swipeThreshold) {
            nextSlide();
        }
    };

    return (
        <div className="relative w-full max-w-[98vw] xl:max-w-[90vw] mx-auto px-6 md:px-12 py-6 md:py-8">
            <div className="relative flex flex-col items-center">
                <div className="relative flex items-center justify-center gap-3 md:gap-6 h-[55vh] sm:h-[65vh] md:h-[70vh] w-full">

                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                        }}
                        className="absolute left-2 md:left-4 z-30 p-2 md:p-3 rounded-full bg-white/70 md:bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-all flex items-center justify-center touch-manipulation"
                        aria-label="Previous testimonial"
                        type="button"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-800" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                        }}
                        className="absolute right-2 md:right-4 z-30 p-2 md:p-3 rounded-full bg-white/70 md:bg-white/80 hover:bg-white shadow-lg backdrop-blur-sm transition-all flex items-center justify-center touch-manipulation"
                        aria-label="Next testimonial"
                        type="button"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-800" />
                    </button>

                    {/* Video Cards */}
                    <AnimatePresence mode="sync" initial={false}>
                        <motion.div
                            className="flex items-center justify-center gap-3 md:gap-6 w-full perspective-1000"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                        >
                            {visibleVideos.map(({ video, position }) => {
                                const student = studentMap.get(video.studentId || '');
                                const isCenter = position === 0;
                                const isInner = Math.abs(position) === 1;

                                const widthClass = isCenter ? 'w-auto' : (isInner ? 'w-[200px] md:w-[240px]' : 'w-[160px] md:w-[180px]');
                                const height = isCenter ? 'h-[50vh] sm:h-[60vh] md:h-[65vh]' : (isInner ? 'h-[40vh] sm:h-[48vh] md:h-[52vh]' : 'h-[35vh] sm:h-[42vh] md:h-[45vh]');
                                const opacity = isCenter ? 1 : (isInner ? 0.6 : 0.4);
                                const blur = isCenter ? 0 : (isInner ? 2 : 4);
                                const scale = isCenter ? 1 : (isInner ? 0.9 : 0.85);
                                const zIndex = isCenter ? 30 : (isInner ? 20 : 10);

                                return (
                                    <motion.div
                                        key={video.id}
                                        className={cn(
                                            "flex flex-col gap-4 items-center",
                                            position !== 0 ? (Math.abs(position) === 1 ? "hidden md:flex" : "hidden xl:flex") : "flex",
                                            widthClass
                                        )}
                                        style={{ zIndex }}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity,
                                            scale,
                                            filter: `blur(${blur}px)`,
                                            transition: {
                                                duration: 0.5,
                                                ease: [0.4, 0.0, 0.2, 1],
                                                opacity: { duration: 0.3 },
                                                scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
                                                filter: { duration: 0.4 }
                                            }
                                        }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                    >
                                        <motion.div
                                            className={cn(
                                                "relative rounded-3xl overflow-hidden shadow-2xl bg-black",
                                                height,
                                                isCenter ? "aspect-[9/16]" : "w-full"
                                            )}
                                            whileHover={isCenter ? {
                                                scale: 1.02,
                                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                                                transition: { duration: 0.2 }
                                            } : {}}
                                        >
                                            {isCenter && isPlaying ? (
                                                <div
                                                    className="relative w-full h-full overflow-hidden cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsPlaying(false);
                                                    }}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label="Pause video"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setIsPlaying(false);
                                                        }
                                                    }}
                                                >
                                                    <iframe
                                                        src={`${generateEmbedUrl(video.videoId)}&autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${video.videoId}${isMuted ? '&mute=1' : '&mute=0'}&enablejsapi=1`}
                                                        title={`${video.studentName} testimonial`}
                                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                                        style={{
                                                            transform: 'scale(1.01)',
                                                            objectFit: 'cover'
                                                        }}
                                                        allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                    <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsMuted(!isMuted);
                                                            }}
                                                            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all border border-white/10 touch-manipulation"
                                                            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                                            type="button"
                                                        >
                                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="relative w-full h-full group cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isCenter) handlePlayClick();
                                                    }}
                                                    role="button"
                                                    tabIndex={isCenter ? 0 : -1}
                                                    aria-label={`Play ${video.studentName} testimonial`}
                                                    onKeyDown={(e) => {
                                                        if (isCenter && (e.key === 'Enter' || e.key === ' ')) {
                                                            e.preventDefault();
                                                            handlePlayClick();
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={getYouTubeThumbnail(video.videoId, '0')}
                                                        alt={`${video.studentName} testimonial`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        loading="eager"
                                                        onError={(e) => {
                                                            const current = e.currentTarget.src;
                                                            if (current.includes('/0.jpg')) {
                                                                e.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/1.jpg`;
                                                            } else if (current.includes('/1.jpg')) {
                                                                e.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/2.jpg`;
                                                            } else if (current.includes('/2.jpg')) {
                                                                e.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    {isCenter && (
                                                        <div className="absolute top-6 left-6 z-10">
                                                            <motion.button
                                                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-all shadow-lg"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <Play className="w-4 h-4 fill-current" />
                                                                <span className="text-sm font-medium tracking-wide">Play Video</span>
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>

                                        <motion.div
                                            className="text-left px-2 w-full"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{
                                                opacity: isCenter ? 1 : 0.5,
                                                y: 0,
                                                transition: { duration: 0.4, delay: 0.15 }
                                            }}
                                        >
                                            <h3 className={cn(
                                                "font-bold text-slate-900 dark:text-white mb-1",
                                                isCenter ? "text-2xl" : "text-lg"
                                            )}>
                                                {video.studentName}
                                            </h3>
                                            <p className={cn(
                                                "text-slate-500 dark:text-slate-400 font-medium",
                                                isCenter ? "text-base" : "text-sm"
                                            )}>
                                                {video.subjects?.join(", ") || student?.location || 'Aviation Student'}
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-12" role="tablist" aria-label="Testimonial navigation">
                    {youtubeShorts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setIsAutoPlaying(false);
                                setIsPlaying(false);
                            }}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300 touch-manipulation",
                                currentIndex === idx
                                    ? "w-8 bg-teal-600"
                                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                            )}
                            aria-label={`Go to testimonial ${idx + 1}`}
                            aria-current={currentIndex === idx ? 'true' : 'false'}
                            role="tab"
                            type="button"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
