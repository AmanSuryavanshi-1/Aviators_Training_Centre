'use client';

/**
 * EnhancedSafeImage Component
 * 
 * Enhanced version of SafeImage with lazy loading capabilities while maintaining
 * full backward compatibility with existing SafeImage usage.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  usePerformanceImage,
  useConnectionAwareLoading,
  PerformanceMetricsCollector,
} from '@/lib/image-optimization';
import type {
  LoadingPriority,
  EnhancedSafeImageProps,
} from '@/lib/image-optimization';

const EnhancedSafeImage: React.FC<EnhancedSafeImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  lazyLoad = true,
  priority = 'medium',
  placeholder,
  intersectionConfig,
  ...props
}) => {
  // State management
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  
  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const metricsCollector = useRef<PerformanceMetricsCollector | null>(null);

  // Hooks for performance optimization (with fallback)
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
    connectionPriority = priority;
    isSlowConnection = false;
    isDataSaverEnabled = false;
  }

  // Determine final loading strategy
  const finalPriority = priority === 'medium' ? connectionPriority : priority;
  const shouldUseLazyLoading = shouldLazyLoad && lazyLoad;
  const shouldRespectDataSaver = isDataSaverEnabled;

  // Initialize performance tracking
  useEffect(() => {
    if (config?.enablePerformanceTracking && typeof window !== 'undefined') {
      metricsCollector.current = PerformanceMetricsCollector.getInstance();
    }
  }, [config?.enablePerformanceTracking]);

  // Handle image load start
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
  }, [imgSrc, finalPriority, shouldUseLazyLoading]);

  // Handle successful image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    
    if (metricsCollector.current && imgRef.current) {
      metricsCollector.current.markAsLoaded(imgRef.current);
    }
  }, []);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    if (metricsCollector.current && imgRef.current) {
      metricsCollector.current.markAsError(imgRef.current, 'Image load failed');
    }
  }, []);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!shouldUseLazyLoading || isVisible || !imgRef.current) return;

    const observerConfig = intersectionConfig || {
      rootMargin: config?.rootMargin || '200px 0px',
      threshold: config?.threshold || 0.01,
      priority: finalPriority,
      preloadStrategy: 'viewport',
      useNativeLazy: true,
      connectionAware: true,
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: observerConfig.rootMargin,
        threshold: observerConfig.threshold,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldUseLazyLoading, isVisible, finalPriority, config, intersectionConfig]);

  // Cleanup performance tracking on unmount
  useEffect(() => {
    return () => {
      if (metricsCollector.current && imgRef.current) {
        metricsCollector.current.stopTracking(imgRef.current);
      }
    };
  }, []);

  // Generate optimized src for data saver mode
  const optimizedSrc = shouldRespectDataSaver && imgSrc.includes('?') 
    ? `${imgSrc}&quality=70` 
    : shouldRespectDataSaver 
    ? `${imgSrc}?quality=70` 
    : imgSrc;

  // Render placeholder while not visible (for lazy loading)
  if (shouldUseLazyLoading && !isVisible) {
    if (placeholder) {
      return <div className={className}>{placeholder}</div>;
    }
    
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted animate-pulse rounded',
          className
        )}
        style={{ width: width || 'auto', height: height || 'auto' }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Render the actual image
  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-300',
        isLoading && 'opacity-50',
        hasError && 'opacity-25',
        className
      )}
      loading={shouldUseLazyLoading ? 'lazy' : 'eager'}
      onLoadStart={handleLoadStart}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// Backward compatibility: Export as SafeImage as well
export const SafeImage = EnhancedSafeImage;

export default EnhancedSafeImage;