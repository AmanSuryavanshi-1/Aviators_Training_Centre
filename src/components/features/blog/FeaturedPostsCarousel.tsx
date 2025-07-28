"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, User, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import BulletproofImage from './BulletproofImage';
import Link from 'next/link';
import { BlogPostPreview } from '@/lib/types/blog';
import { getImageUrl } from '@/lib/blog/utils';

interface FeaturedPostsCarouselProps {
  posts: BlogPostPreview[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const FeaturedPostsCarousel: React.FC<FeaturedPostsCarouselProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
  }, [posts.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
  }, [posts.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || posts.length <= 1) return;

    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isAutoPlaying, posts.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    (e.currentTarget as HTMLElement).dataset.touchStartX = touchStartX.toString();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Main Carousel */}
      <div
        className="relative overflow-hidden rounded-2xl bg-card shadow-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="relative"
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-0 min-h-[350px] sm:min-h-[400px]">
                  {/* Image Section */}
                  <div className="relative overflow-hidden lg:order-1">
                    <div className="relative aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
                      <BulletproofImage
                        src={getImageUrl(currentPost.image, 800, 600)}
                        alt={currentPost.image?.alt || currentPost.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        priority={currentIndex === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
                    </div>
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white font-medium px-3 py-1">
                        Featured
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-12 lg:order-2">
                    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                      {/* Category */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs sm:text-sm font-medium w-fit"
                          style={{ 
                            borderColor: currentPost.category.color || 'hsl(var(--border))',
                            color: currentPost.category.color || 'hsl(var(--foreground))'
                          }}
                        >
                          {currentPost.category.title}
                        </Badge>
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-2 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <time dateTime={currentPost.publishedAt}>
                              {new Date(currentPost.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{currentPost.readingTime} min read</span>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground leading-tight font-heading line-clamp-2 sm:line-clamp-3">
                        {currentPost.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {currentPost.excerpt}
                      </p>

                      {/* Author */}
                      {currentPost.author && (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-muted flex-shrink-0">
                            {currentPost.author.image ? (
                              <Image
                                src={getImageUrl(currentPost.author.image, 40, 40)}
                                alt={currentPost.author.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {currentPost.author.name}
                            </p>
                            {currentPost.author.role && (
                              <p className="text-xs text-muted-foreground truncate">
                                {currentPost.author.role}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Read More Button */}
                      <div className="pt-1 sm:pt-2">
                        <Button asChild className="group w-full sm:w-auto" size="sm">
                          <Link href={`/blog/${currentPost.slug.current}`}>
                            <span className="text-sm">Read Full Article</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/95 backdrop-blur-sm border-border shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200 touch-manipulation"
              aria-label="Previous featured post"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/95 backdrop-blur-sm border-border shadow-lg hover:bg-accent hover:scale-105 transition-all duration-200 touch-manipulation"
              aria-label="Next featured post"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {posts.length > 1 && (
        <div className="flex justify-center mt-6 gap-2" role="tablist" aria-label="Featured posts navigation">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to featured post ${index + 1}`}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Navigation (Desktop) */}
      {posts.length > 1 && (
        <div className="hidden lg:flex justify-center mt-8 gap-4">
          {posts.map((post, index) => (
            <button
              key={post._id}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative overflow-hidden rounded-lg transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2",
                index === currentIndex
                  ? "ring-2 ring-primary scale-105"
                  : "opacity-60 hover:opacity-80"
              )}
            >
              <div className="relative w-20 h-16">
                <BulletproofImage
                  src={getImageUrl(post.image, 80, 64)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedPostsCarousel;