'use client';

/**
 * OptimizedImage Component
 * 
 * Zero-lag enhanced version of BulletproofImage with performance-first optimizations.
 * Maintains full backward compatibility while adding intelligent lazy loading,
 * connection awareness, and performance tracking.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  usePerformanceImage,
  useConnectionAwareLoading,
  PerformanceMetricsCollector,
} from '@/lib/image-optimization';
import type {
  LoadingPriority,
  OptimizedImageProps,
} from '@/lib/image-optimization';

// Re-export BulletproofImage props for backward compatibility
interface BulletproofImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
}

// Enhanced props that extend BulletproofImage
interface OptimizedImagePropsExtended extends BulletproofImageProps {
  // Performance optimization props
  loadingPriority?: LoadingPriority;
  lazyLoad?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  performanceTracking?: boolean;
  
  // Advanced optimization props
  fetchPriority?: 'high' | 'low' | 'auto';
  preload?: boolean;
  connectionAware?: boolean;
  respectDataSaver?: boolean;
  
  // Responsive image props
  responsiveBreakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

const OptimizedImage: React.FC<OptimizedImagePropsExtended> = ({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = '/Blogs/Blog_Header.webp',
  priority = false,
  fill = false,
  sizes,
  onError,
  onLoad,
  
  // Enhanced props with defaults
  loadingPriority = 'medium',
  lazyLoad = true,
  placeholder = 'empty',
  onLoadStart,
  onLoadComplete,
  performanceTracking = true,
  fetchPriority = 'auto',
  preload = false,
  connectionAware = true,
  respectDataSaver = true,
  responsiveBreakpoints,
  
  ...restProps
}) => {
  // State management
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(!lazyLoad || priority);
  
  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const metricsCollector = useRef<PerformanceMetricsCollector | null>(null);
  
  // Hooks for performance optimization (with fallback for when provider is not available)
  let config, lazyLoadService, shouldLazyLoad, connectionPriority, isSlowConnection, isDataSaverEnabled;
  
  try {
    const performanceContext = usePerformanceImage();
    config = performanceContext.config;
    lazyLoadService = performanceContext.lazyLoadService;
    
    const connectionContext = useConnectionAwareLoading();
    shouldLazyLoad = connectionContext.shouldLazyLoad;
    connectionPriority = connectionContext.priority;
    isSlowConnection = connectionContext.isSlowConnection;
    isDataSaverEnabled = connectionContext.isDataSaverEnabled;
  } catch (error) {
    // Fallback when PerformanceImageProvider is not available
    config = {
      enableLazyLoading: true,
      defaultPriority: 'medium',
      rootMargin: '200px 0px',
      threshold: 0.01,
      enablePerformanceTracking: false,
      fallbackImage: '/placeholder.svg',
      respectDataSaver: false,
      respectReducedMotion: false,
    };
    lazyLoadService = null;
    shouldLazyLoad = lazyLoad;
    connectionPriority = loadingPriority;
    isSlowConnection = false;
    isDataSaverEnabled = false;
  }

  // Determine final loading strategy
  const finalPriority = loadingPriority === 'medium' ? connectionPriority : loadingPriority;
  const shouldUseLazyLoading = connectionAware ? shouldLazyLoad && lazyLoad : lazyLoad;
  const shouldRespectDataSaver = respectDataSaver && isDataSaverEnabled;
  
  // Determine Next.js Image props based on priority and connection
  const nextImageProps = {
    priority: finalPriority === 'critical' || priority,
    loading: (finalPriority === 'critical' || priority) ? 'eager' as const : 'lazy' as const,
    ...(fetchPriority !== 'auto' && { fetchPriority }),
  };

  // Initialize performance tracking
  useEffect(() => {
    if (performanceTracking && typeof window !== 'undefined') {
      metricsCollector.current = PerformanceMetricsCollector.getInstance();
    }
  }, [performanceTracking]);

  // Handle image loading start
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    
    if (metricsCollector.current && imgRef.current) {
      metricsCollector.current.startTracking(
        imgRef.current,
        imgSrc,
        finalPriority,
        shouldUseLazyLoading
      );
    }
    
    onLoadStart?.();
  }, [imgSrc, finalPriority, shouldUseLazyLoading, onLoadStart]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    
    if (metricsCollector.current && imgRef.current) {
      metricsCollector.current.markAsLoaded(imgRef.current);
    }
    
    onLoadComplete?.();
    onLoad?.();
  }, [onLoadComplete, onLoad]);

  // Handle image error with fallback
  const handleError = useCallback(() => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      
      if (metricsCollector.current && imgRef.current) {
        metricsCollector.current.markAsError(imgRef.current, 'Image load failed, using fallback');
      }
    } else {
      // Fallback also failed
      setIsLoading(false);
      
      if (metricsCollector.current && imgRef.current) {
        metricsCollector.current.markAsError(imgRef.current, 'Both primary and fallback images failed');
      }
    }
    
    onError?.();
  }, [hasError, imgSrc, fallbackSrc, onError]);

  // Preload image if requested and connection allows
  useEffect(() => {
    if (preload && !shouldRespectDataSaver && lazyLoadService) {
      lazyLoadService.preload(src, finalPriority).catch(() => {
        // Preload failed, but this shouldn't affect the main image loading
      });
    }
  }, [preload, shouldRespectDataSaver, src, finalPriority, lazyLoadService]);

  // Generate responsive sizes if breakpoints are provided
  const responsiveSizes = React.useMemo(() => {
    if (!responsiveBreakpoints || sizes) return sizes;
    
    const { mobile = 100, tablet = 50, desktop = 33 } = responsiveBreakpoints;
    return `(max-width: 768px) ${mobile}vw, (max-width: 1024px) ${tablet}vw, ${desktop}vw`;
  }, [responsiveBreakpoints, sizes]);

  // Cleanup performance tracking on unmount
  useEffect(() => {
    return () => {
      if (metricsCollector.current && imgRef.current) {
        metricsCollector.current.stopTracking(imgRef.current);
      }
    };
  }, []);

  // Generate optimized image props
  const imageProps = {
    ref: imgRef,
    src: imgSrc,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading && placeholder === 'skeleton' && 'animate-pulse bg-muted',
      className
    ),
    onLoadStart: handleLoadStart,
    onLoad: handleLoad,
    onError: handleError,
    ...nextImageProps,
    ...(fill ? { fill: true } : { 
      width: width || 400, 
      height: height || 300 
    }),
    ...(responsiveSizes && { sizes: responsiveSizes }),
    ...restProps,
  };

  // Add connection-aware quality optimization
  if (shouldRespectDataSaver) {
    // For data saver mode, we might want to add quality parameters to the src
    // This would depend on your image CDN/optimization service
    const optimizedSrc = imgSrc.includes('?') 
      ? `${imgSrc}&quality=70` 
      : `${imgSrc}?quality=70`;
    imageProps.src = optimizedSrc;
  }

  // Render placeholder while loading (for skeleton mode)
  if (isLoading && placeholder === 'skeleton' && !isVisible) {
    return (
      <div
        className={cn(
          'animate-pulse bg-muted rounded',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={!fill ? { width: width || 400, height: height || 300 } : undefined}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Render blur placeholder (requires blur data URL)
  if (isLoading && placeholder === 'blur') {
    const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciPjxzdG9wIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';
    
    return (
      <Image
        {...imageProps}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );
  }

  // Standard Next.js Image component with optimizations
  return <Image {...imageProps} />;
};

// Higher-order component for automatic optimization
export const withImageOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const OptimizedComponent = (props: P) => {
    let isSlowConnection = false;
    let isDataSaverEnabled = false;
    
    try {
      const connectionContext = useConnectionAwareLoading();
      isSlowConnection = connectionContext.isSlowConnection;
      isDataSaverEnabled = connectionContext.isDataSaverEnabled;
    } catch (error) {
      // Fallback when provider is not available
      isSlowConnection = false;
      isDataSaverEnabled = false;
    }
    
    // Add performance hints to component props
    const enhancedProps = {
      ...props,
      // Add performance-related props that components can use
      imageOptimizationHints: {
        isSlowConnection,
        isDataSaverEnabled,
        recommendedPriority: isSlowConnection ? 'low' : 'medium',
      },
    };
    
    return <Component {...enhancedProps} />;
  };
  
  OptimizedComponent.displayName = `withImageOptimization(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

// Utility hook for image optimization recommendations
export const useImageOptimizationRecommendations = (
  imageCount: number,
  averageSize: number
) => {
  let isSlowConnection = false;
  let isDataSaverEnabled = false;
  
  try {
    const connectionContext = useConnectionAwareLoading();
    isSlowConnection = connectionContext.isSlowConnection;
    isDataSaverEnabled = connectionContext.isDataSaverEnabled;
  } catch (error) {
    // Fallback when provider is not available
    isSlowConnection = false;
    isDataSaverEnabled = false;
  }
  
  return React.useMemo(() => {
    const recommendations: string[] = [];
    
    if (isSlowConnection && imageCount > 5) {
      recommendations.push('Consider reducing the number of images on slow connections');
    }
    
    if (isDataSaverEnabled && averageSize > 100000) { // 100KB
      recommendations.push('Use lower quality images for users with data saver enabled');
    }
    
    if (imageCount > 10) {
      recommendations.push('Implement progressive loading for large image sets');
    }
    
    return recommendations;
  }, [isSlowConnection, isDataSaverEnabled, imageCount, averageSize]);
};

// Backward compatibility: Export as BulletproofImage for existing code
export const BulletproofImage = OptimizedImage;

export default OptimizedImage;