"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { AlertTriangle, RefreshCw, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YouTubeShort, Student } from '@/lib/testimonials/types';

interface VideoErrorFallbackProps {
  video: YouTubeShort;
  student: Student | null;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export default function VideoErrorFallback({ 
  video, 
  student, 
  error = "Video temporarily unavailable",
  onRetry,
  className 
}: VideoErrorFallbackProps) {
  const handleWatchOnYouTube = () => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      className={cn(
        "rounded-2xl shadow-md p-4 bg-card border border-destructive/20",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error State Container */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted/50 mb-4 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-destructive/30">
        {/* Thumbnail if available */}
        {video.thumbnailUrl && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={video.thumbnailUrl}
              alt={`${student?.name || 'Student'} testimonial thumbnail`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Error Content */}
        <div className="relative z-10 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-1">
              {error}
            </h4>
            <p className="text-sm text-muted-foreground">
              {student?.name ? `${student.name}'s testimonial` : 'Student testimonial'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button
              onClick={handleWatchOnYouTube}
              size="sm"
              variant="default"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
            <Play className="w-5 h-5 text-teal-600 dark:text-teal-400" />
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
            Class of {student.gradYear}
          </p>
        )}

        {/* Fallback Description */}
        <div className="pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            {student?.name ? `${student.name} shares their success story` : 'Student success story'} 
            {student?.course ? ` from our ${student.course} program` : ' from our aviation training program'}.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Error Boundary Class Component
interface VideoErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface VideoErrorBoundaryProps {
  children: React.ReactNode;
  video: YouTubeShort;
  student: Student | null;
  fallback?: React.ComponentType<VideoErrorFallbackProps>;
}

export class VideoErrorBoundary extends React.Component<VideoErrorBoundaryProps, VideoErrorBoundaryState> {
  constructor(props: VideoErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VideoErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Video Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || VideoErrorFallback;
      
      return (
        <FallbackComponent
          video={this.props.video}
          student={this.props.student}
          error={this.state.error?.message || "Something went wrong"}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}