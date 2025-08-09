"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Plane } from 'lucide-react';
import { easingFunctions } from '@/lib/animations/easing';

interface VideoCardSkeletonProps {
  position?: 'center' | 'adjacent' | 'distant' | 'hidden';
}

export default function VideoCardSkeleton({ position = 'center' }: VideoCardSkeletonProps) {
  const getCardDimensions = () => {
    switch (position) {
      case 'center': return {
        height: 'h-[80vh] md:h-[85vh]',
        width: 'w-[240px] md:w-[260px]'
      };
      case 'adjacent': return {
        height: 'h-[70vh] md:h-[75vh]',
        width: 'w-[200px] md:w-[220px]'
      };
      case 'distant': return {
        height: 'h-[60vh] md:h-[65vh]',
        width: 'w-[160px] md:w-[180px]'
      };
      default: return {
        height: 'h-[50vh] md:h-[55vh]',
        width: 'w-[120px] md:w-[140px]'
      };
    }
  };

  const dimensions = getCardDimensions();

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card/90 to-card/80",
        "border border-border/50 backdrop-blur-sm",
        dimensions.height,
        dimensions.width,
        "mx-auto"
      )}
    >
      {/* Animated shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-pulse" />
      
      {/* Main video area skeleton */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-aviation-primary/5 via-muted/20 to-aviation-secondary/5" />
        
        {/* Animated loading plane */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative"
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: easingFunctions.easeInOut
            }}
          >
            <div className={cn(
              "rounded-full bg-aviation-primary/20 backdrop-blur-sm flex items-center justify-center",
              "border border-aviation-primary/30",
              position === 'center' ? "w-16 h-16" : "w-12 h-12"
            )}>
              <Plane className={cn(
                "text-aviation-primary",
                position === 'center' ? "w-6 h-6" : "w-4 h-4"
              )} />
            </div>
            
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-aviation-primary/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: easingFunctions.easeOut
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-aviation-secondary/20"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: easingFunctions.easeOut,
                delay: 0.5
              }}
            />
          </motion.div>
        </div>

        {/* Loading text */}
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <motion.p
            className="text-muted-foreground text-sm font-medium"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: easingFunctions.easeInOut
            }}
          >
            Loading testimonial...
          </motion.p>
        </div>

        {/* Skeleton elements for controls area */}
        <div className="absolute bottom-16 left-4 right-4 flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-muted/40 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-muted/40 animate-pulse" />
        </div>

        {/* Skeleton for testimonial tag */}
        <div className="absolute bottom-8 left-4">
          <div className="w-20 h-6 rounded-full bg-muted/40 animate-pulse" />
        </div>
      </div>

      {/* Student info skeleton */}
      <div className="p-4 bg-gradient-to-t from-card/95 to-transparent space-y-3">
        {/* Course tags skeleton */}
        <div className="flex gap-1">
          <div className="w-16 h-5 rounded-md bg-aviation-primary/10 animate-pulse" />
          <div className="w-20 h-5 rounded-md bg-aviation-primary/10 animate-pulse" />
        </div>
        
        {/* Student info skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={cn(
              "bg-muted/60 rounded mb-2 animate-pulse",
              position === 'center' ? "h-5 w-32" : "h-4 w-28"
            )} />
            <div className={cn(
              "bg-muted/40 rounded animate-pulse",
              position === 'center' ? "h-4 w-24" : "h-3 w-20"
            )} />
          </div>
          <div className="w-16 h-6 bg-green-500/20 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Floating particles for visual interest */}
      {position === 'center' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-aviation-primary/30 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: easingFunctions.easeInOut
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}