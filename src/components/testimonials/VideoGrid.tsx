"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Loader2 } from 'lucide-react';
import ShortsVideoCard from './ShortsVideoCard';
import { VideoErrorBoundary } from './VideoErrorBoundary';
import { YouTubeShort, Student } from '@/lib/testimonials/types';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { Button } from '@/components/ui/button';
import { cardVariants, staggerContainer } from '@/components/animations/motionVariants';

interface VideoGridProps {
  videos: YouTubeShort[];
  students: Student[];
  className?: string;
}

// Use imported animation variants

export default function VideoGrid({ videos, students, className }: VideoGridProps) {
  // Create a map for quick student lookup
  const studentMap = new Map(students.map(s => [s.id, s]));

  // Use lazy loading hook
  const { items: visibleVideos, isLoading, hasMore, loadMoreRef, loadMore } = useLazyLoad(videos, {
    initialLoad: 6,
    loadMore: 3
  });

  return (
    <div className={cn("space-y-8", className)}>
      {/* Video Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 max-w-[1280px] mx-auto px-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {visibleVideos.map((video) => {
          const student = video.studentId ? studentMap.get(video.studentId) || null : null;
          
          return (
            <motion.div
              key={video.id}
              variants={cardVariants}
              initial="initial"
              whileInView="enter"
              whileHover="hover"
              className="flex"
            >
              <VideoErrorBoundary video={video} student={student}>
                <ShortsVideoCard
                  video={video}
                  student={student}
                  className="w-full h-full"
                />
              </VideoErrorBoundary>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Loading/Load More Section */}
      <div className="flex justify-center items-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more testimonials...</span>
          </div>
        )}

        {hasMore && !isLoading && (
          <Button
            onClick={loadMore}
            variant="outline"
            className="px-6 py-2"
          >
            Load More Testimonials
          </Button>
        )}

        {!hasMore && visibleVideos.length > 0 && (
          <p className="text-muted-foreground text-sm">
            You've seen all testimonials
          </p>
        )}
      </div>

      {/* Intersection Observer Target */}
      <div ref={loadMoreRef} className="h-1" />
    </div>
  );
}