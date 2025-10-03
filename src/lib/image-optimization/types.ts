/**
 * TypeScript interfaces for high-performance image optimization
 */

export type LoadingPriority = 'critical' | 'high' | 'medium' | 'low';
export type PreloadStrategy = 'immediate' | 'interaction' | 'viewport' | 'connection-aware';

export interface PerformantLazyLoadConfig {
  rootMargin: string;
  threshold: number;
  priority: LoadingPriority;
  preloadStrategy: PreloadStrategy;
  useNativeLazy: boolean;
  connectionAware: boolean;
}

export interface ImageLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  loadStartTime?: number;
  loadEndTime?: number;
  priority: LoadingPriority;
}

export interface ImagePerformanceMetrics {
  imageId: string;
  loadTime: number;
  priority: LoadingPriority;
  wasLazyLoaded: boolean;
  viewport: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
  timestamp: number;
}

export interface ConnectionInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData?: boolean;
}

export interface ImageOptimizationConfig {
  enableLazyLoading: boolean;
  defaultPriority: LoadingPriority;
  rootMargin: string;
  threshold: number;
  enablePerformanceTracking: boolean;
  fallbackImage: string;
  respectDataSaver: boolean;
  respectReducedMotion: boolean;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: LoadingPriority;
  lazyLoad?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  performanceTracking?: boolean;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export interface EnhancedSafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazyLoad?: boolean;
  priority?: LoadingPriority;
  placeholder?: React.ReactNode;
  intersectionConfig?: PerformantLazyLoadConfig;
  [key: string]: any;
}

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackStrategy: 'immediate' | 'placeholder' | 'hide';
  onError?: (error: Error, imageProps: any) => void;
}

export interface PreloadOptions {
  priority?: LoadingPriority;
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: ReferrerPolicy;
  as?: 'image';
}

// Utility types for component props
export type ImageComponent = React.ComponentType<OptimizedImageProps>;
export type SafeImageComponent = React.ComponentType<EnhancedSafeImageProps>;

// Performance monitoring types
export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export interface ImagePerformanceEntry extends PerformanceEntry {
  priority: LoadingPriority;
  wasLazyLoaded: boolean;
  connectionType?: string;
}

// Connection-aware loading types
export interface ConnectionAwareConfig {
  '2g': {
    quality: number;
    enableLazyLoading: boolean;
    aggressivePreloading: boolean;
  };
  '3g': {
    quality: number;
    enableLazyLoading: boolean;
    aggressivePreloading: boolean;
  };
  '4g': {
    quality: number;
    enableLazyLoading: boolean;
    aggressivePreloading: boolean;
  };
  wifi: {
    quality: number;
    enableLazyLoading: boolean;
    aggressivePreloading: boolean;
  };
}

// Image format optimization
export interface ImageFormatSupport {
  webp: boolean;
  avif: boolean;
  jpeg2000: boolean;
  jpegXR: boolean;
}

export interface OptimizedImageSource {
  src: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  quality: number;
  width: number;
  height: number;
}

// Responsive image configuration
export interface ResponsiveImageConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  densities: number[];
  formats: string[];
}

// Performance budget configuration
export interface PerformanceBudget {
  maxLCP: number; // Maximum Largest Contentful Paint in ms
  maxCLS: number; // Maximum Cumulative Layout Shift
  maxImageLoadTime: number; // Maximum individual image load time in ms
  maxTotalImageSize: number; // Maximum total image payload in bytes
}

// Note: Types are exported individually above, no default export needed for types