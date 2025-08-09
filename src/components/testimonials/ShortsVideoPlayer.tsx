"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Play, User } from 'lucide-react';
import { YouTubeShort, Student } from '@/lib/testimonials/types';
import { generateEmbedUrl } from '@/lib/testimonials/data';

interface ShortsVideoPlayerProps {
  video: YouTubeShort;
  student: Student | null;
  className?: string;
}

export default function ShortsVideoPlayer({ video, student, className }: ShortsVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-md p-4 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Video Container */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted mb-4">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-muted-foreground/40" />
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <Play className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Video unavailable</p>
            <button 
              onClick={() => window.open(video.url, '_blank')}
              className="text-xs text-primary hover:underline"
            >
              Watch on YouTube
            </button>
          </div>
        )}

        {/* Video Iframe */}
        {!isPlaying ? (
          // Thumbnail with play overlay
          <div className="relative w-full h-full">
            <img
              src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
              alt={`${student?.name || 'Student'} testimonial`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-testimonial.jpg';
              }}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200"
                aria-label={`Play video by ${student?.name || 'student'}`}
              >
                <Play className="w-6 h-6 text-teal-700 ml-1" fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          // Actual video iframe
          <iframe
            src={generateEmbedUrl(video.videoId)}
            title={`${student?.name || 'Student'} testimonial`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      {/* Student Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
            {student?.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name || 'Student'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            )}
          </div>

          {/* Student Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {student?.name || 'Aviation Graduate'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {student?.course || 'Aviation Training'}
            </p>
          </div>

          {/* Verification Badge */}
          {student?.verified && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Additional Info */}
        {student?.gradYear && (
          <p className="text-xs text-muted-foreground">
            Graduated: {student.gradYear}
          </p>
        )}
      </div>
    </motion.div>
  );
}