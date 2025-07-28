"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Enhanced blur placeholder with better compression
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
    
    // Report LCP candidate to performance monitoring
    if (priority && typeof window !== 'undefined' && 'performance' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              // Report to analytics if available
              if ((window as any).gtag) {
                (window as any).gtag('event', 'lcp_image_loaded', {
                  event_category: 'Core Web Vitals',
                  event_label: src,
                  value: Math.round(entry.startTime),
                });
              }
            }
          });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }, [onLoad, priority, src]);

  const [retryCount, setRetryCount] = useState(0);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const handleError = useCallback(() => {
    setIsLoading(false);
    
    // Try fallback strategies before showing error
    if (retryCount === 0) {
      // First retry: try with different format or size
      const fallback = generateFallbackSrc(src);
      if (fallback) {
        setFallbackSrc(fallback);
        setRetryCount(1);
        setIsLoading(true);
        return;
      }
    }
    
    if (retryCount === 1) {
      // Second retry: try with lower quality
      const lowQualitySrc = src.includes('?') 
        ? `${src}&q=50&w=400` 
        : `${src}?q=50&w=400`;
      setFallbackSrc(lowQualitySrc);
      setRetryCount(2);
      setIsLoading(true);
      return;
    }
    
    // All retries failed
    setHasError(true);
    onError?.();
    
    // Report image loading errors
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_load_error', {
        event_category: 'Performance',
        event_label: src,
        value: retryCount,
        non_interaction: true,
      });
    }
  }, [onError, src, retryCount]);

  // Generate fallback image sources
  const generateFallbackSrc = (originalSrc: string): string | null => {
    try {
      const url = new URL(originalSrc, window.location.origin);
      
      // For Sanity CDN images, try different formats
      if (url.hostname.includes('sanity.io') || url.hostname.includes('cdn.sanity.io')) {
        return `${originalSrc}?auto=format&fit=max&w=800`;
      }
      
      // For other CDNs, try basic optimization
      if (url.searchParams.has('w') || url.searchParams.has('width')) {
        url.searchParams.set('w', '800');
        url.searchParams.set('q', '75');
        return url.toString();
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : width 
        ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
        : '100vw'
  );

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground rounded-lg",
          className
        )}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined)
        }}
      >
        <div className="text-center p-4">
          <div className="text-sm opacity-60">Image unavailable</div>
          <div className="text-xs opacity-40 mt-1">Failed to load</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined)
      }}
    >
      {isInView && (
        <Image
          src={fallbackSrc || src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={responsiveSizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          className={cn(
            "transition-opacity duration-300 ease-in-out",
            isLoading ? "opacity-0" : "opacity-100",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
            objectFit === 'scale-down' && "object-scale-down"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      
      {/* Enhanced loading skeleton with shimmer effect */}
      {(isLoading || !isInView) && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted",
            "animate-pulse bg-[length:200%_100%]",
            !isInView && "bg-muted" // Static background when not in view
          )}
          style={{ 
            width: fill ? '100%' : width, 
            height: fill ? '100%' : height,
            backgroundImage: isLoading && isInView 
              ? 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 75%)'
              : undefined,
            animation: isLoading && isInView ? 'shimmer 1.5s ease-in-out infinite' : undefined,
          }}
        >
          {!isInView && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse" />
            </div>
          )}
        </div>
      )}
      
      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;