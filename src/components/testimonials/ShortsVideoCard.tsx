"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Play, User, ExternalLink } from 'lucide-react';
import { YouTubeShort, Student } from '@/lib/testimonials/types';
import { generateEmbedUrl } from '@/lib/testimonials/data';
import { testimonialsAnalytics } from '@/lib/testimonials/analytics';

interface ShortsVideoCardProps {
  video: YouTubeShort;
  student: Student | null;
  className?: string;
}

export default function ShortsVideoCard({ video, student, className }: ShortsVideoCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    
    // Track video play event
    testimonialsAnalytics.trackVideoPlay(video.videoId, student?.name, student?.course);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "rounded-2xl shadow-md p-4 bg-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500",
        className
      )}
      role="group"
      aria-labelledby={`video-title-${video.id}`}
    >
      {/* Video Container - Vertical 9:16 aspect ratio */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted mb-4">
        {/* Loading Skeleton */}
        {isLoading && !isPlaying && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-card-foreground/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-card-foreground/40" />
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
              className="inline-flex items-center gap-1 text-xs text-aviation-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Try again
            </button>
          </div>
        )}

        {/* Video Content */}
        {!isPlaying ? (
          // Thumbnail with play overlay
          <div className="relative w-full h-full">
            <img
              src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
              alt={`${student?.name || 'Student'} testimonial`}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-testimonial.jpg';
                setIsLoading(false);
              }}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-aviation-primary focus:ring-offset-2 min-h-[44px] min-w-[44px] border border-border/50"
                aria-label={`Play testimonial video by ${student?.name || 'student'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlay();
                  }
                }}
              >
                <Play className="w-6 h-6 text-aviation-primary ml-1" fill="currentColor" />
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

      {/* Card Content - Responsive layout */}
      <div className="space-y-3">
        {/* Mobile: Stacked layout, Desktop: Avatar-left meta-right */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-aviation-primary/10 dark:bg-aviation-primary/20 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            {student?.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name || 'Student'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-aviation-primary dark:text-aviation-light" />
            )}
          </div>

          {/* Student Details */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 
                  id={`video-title-${video.id}`}
                  className="text-sm font-semibold text-card-foreground"
                >
                  {student?.name || 'Aviation Graduate'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {student?.course || 'Aviation Training'}
                </p>
              </div>

              {/* Verification Badge */}
              {student?.verified && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 mx-auto sm:mx-0 border border-green-500/20">
                  ✓ Verified
                </div>
              )}
            </div>

            {/* Additional Info */}
            {student?.gradYear && (
              <p className="text-xs text-muted-foreground">
                Class of {student.gradYear}
              </p>
            )}
          </div>
        </div>

        {/* Video Duration and Upload Date */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/30">
          {video.duration && (
            <span>{video.duration}s</span>
          )}
          {video.uploadDate && (
            <span>
              {new Date(video.uploadDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}