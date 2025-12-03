/**
 * Image Optimization Library
 * 
 * High-performance image lazy loading and optimization utilities
 * for zero-lag user experience.
 */

export { default as ImageLazyLoadService } from './ImageLazyLoadService';
export type {
  LoadingPriority,
  PreloadStrategy,
  PerformantLazyLoadConfig,
  ImageLoadingState,
} from './types';

export {
  default as PerformanceImageProvider,
  usePerformanceImage,
  useOptionalPerformanceImage,
  useOptimalImageConfig,
  useConnectionAwareLoading,
  useImagePerformanceMetrics,
  withPerformanceOptimization,
  getConnectionAwareQuality,
  shouldPreloadImage,
} from './PerformanceImageProvider';

export {
  default as PerformanceMetricsCollector,
  getPerformanceThresholds,
  analyzePerformanceMetrics,
} from './PerformanceMetricsCollector';

export type {
  ImagePerformanceMetrics,
  ConnectionInfo,
  ImageOptimizationConfig,
  OptimizedImageProps,
  EnhancedSafeImageProps,
  ErrorRecoveryConfig,
  PreloadOptions,
  ImageComponent,
  SafeImageComponent,
  PerformanceEntry,
  ImagePerformanceEntry,
  ConnectionAwareConfig,
  ImageFormatSupport,
  OptimizedImageSource,
  ResponsiveImageConfig,
  PerformanceBudget,
} from './types';

// Re-export for convenience
export * from './types';