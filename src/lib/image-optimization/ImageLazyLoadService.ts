/**
 * High-Performance Image Lazy Loading Service
 * 
 * A singleton service that manages lazy loading for all images across the application
 * using a single Intersection Observer instance with batched DOM updates for optimal performance.
 */

import type { LoadingPriority, PreloadStrategy, PerformantLazyLoadConfig, ImageLoadingState } from './types';

interface LazyImageEntry {
  element: HTMLImageElement;
  config: PerformantLazyLoadConfig;
  originalSrc: string;
  callback?: (state: ImageLoadingState) => void;
  state: ImageLoadingState;
}

class ImageLazyLoadService {
  private static instance: ImageLazyLoadService;
  private observer: IntersectionObserver | null = null;
  private imageEntries = new Map<HTMLImageElement, LazyImageEntry>();
  private pendingUpdates = new Set<HTMLImageElement>();
  private rafId: number | null = null;
  private isSupported: boolean;

  // Default configurations for different priorities
  private static readonly DEFAULT_CONFIGS: Record<LoadingPriority, PerformantLazyLoadConfig> = {
    critical: {
      rootMargin: '0px',
      threshold: 0,
      priority: 'critical',
      preloadStrategy: 'immediate',
      useNativeLazy: false, // Critical images load immediately
      connectionAware: false,
    },
    high: {
      rootMargin: '200px 0px',
      threshold: 0.01,
      priority: 'high',
      preloadStrategy: 'interaction',
      useNativeLazy: true,
      connectionAware: true,
    },
    medium: {
      rootMargin: '100px 0px',
      threshold: 0.01,
      priority: 'medium',
      preloadStrategy: 'viewport',
      useNativeLazy: true,
      connectionAware: true,
    },
    low: {
      rootMargin: '50px 0px',
      threshold: 0.01,
      priority: 'low',
      preloadStrategy: 'connection-aware',
      useNativeLazy: true,
      connectionAware: true,
    },
  };

  private constructor() {
    this.isSupported = this.checkSupport();
    this.initializeObserver();
  }

  public static getInstance(): ImageLazyLoadService {
    if (!ImageLazyLoadService.instance) {
      ImageLazyLoadService.instance = new ImageLazyLoadService();
    }
    return ImageLazyLoadService.instance;
  }

  private checkSupport(): boolean {
    return (
      typeof window !== 'undefined' &&
      'IntersectionObserver' in window &&
      'requestAnimationFrame' in window
    );
  }

  private initializeObserver(): void {
    if (!this.isSupported) return;

    // Use aggressive settings for maximum performance
    this.observer = new IntersectionObserver(
      (entries) => {
        // Batch process entries for better performance
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          const imageEntry = this.imageEntries.get(img);
          
          if (!imageEntry) return;

          if (entry.isIntersecting) {
            this.scheduleImageLoad(img);
          }
        });
      },
      {
        rootMargin: '200px 0px', // Aggressive preloading
        threshold: 0.01, // Minimal threshold for early loading
      }
    );
  }

  private scheduleImageLoad(img: HTMLImageElement): void {
    this.pendingUpdates.add(img);
    
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.processPendingUpdates();
        this.rafId = null;
      });
    }
  }

  private processPendingUpdates(): void {
    this.pendingUpdates.forEach((img) => {
      const entry = this.imageEntries.get(img);
      if (entry && !entry.state.isLoaded && !entry.state.isLoading) {
        this.loadImage(img, entry);
      }
    });
    this.pendingUpdates.clear();
  }

  private async loadImage(img: HTMLImageElement, entry: LazyImageEntry): Promise<void> {
    const { config, originalSrc, callback, state } = entry;

    // Update loading state
    state.isLoading = true;
    state.loadStartTime = performance.now();
    callback?.(state);

    try {
      // Check connection awareness
      if (config.connectionAware && this.shouldDeferForConnection()) {
        await this.waitForBetterConnection();
      }

      // Load the image
      await this.loadImageSrc(img, originalSrc);
      
      // Update success state
      state.isLoaded = true;
      state.isLoading = false;
      state.loadEndTime = performance.now();
      
      // Stop observing this image
      if (this.observer) {
        this.observer.unobserve(img);
      }

    } catch (error) {
      // Update error state
      state.hasError = true;
      state.isLoading = false;
      state.loadEndTime = performance.now();
    }

    callback?.(state);
  }

  private loadImageSrc(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = src;
        resolve();
      };
      
      tempImg.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      tempImg.src = src;
    });
  }

  private shouldDeferForConnection(): boolean {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return false;
    }

    const connection = (navigator as any).connection;
    if (!connection) return false;

    // Defer on slow connections (2G, slow 3G)
    return connection.effectiveType === '2g' || 
           (connection.effectiveType === '3g' && connection.downlink < 1.5);
  }

  private waitForBetterConnection(): Promise<void> {
    return new Promise((resolve) => {
      // Wait a short time for connection to improve, then proceed anyway
      setTimeout(resolve, 1000);
    });
  }

  /**
   * Register an image for lazy loading
   */
  public observe(
    img: HTMLImageElement,
    originalSrc: string,
    priority: LoadingPriority = 'medium',
    callback?: (state: ImageLoadingState) => void
  ): void {
    if (!this.isSupported || !this.observer) {
      // Fallback: load immediately if not supported
      img.src = originalSrc;
      return;
    }

    const config = ImageLazyLoadService.DEFAULT_CONFIGS[priority];
    
    // For critical priority, load immediately
    if (priority === 'critical') {
      img.src = originalSrc;
      callback?.({
        isLoading: false,
        isLoaded: true,
        hasError: false,
        priority,
        loadStartTime: performance.now(),
        loadEndTime: performance.now(),
      });
      return;
    }

    // Create entry for this image
    const entry: LazyImageEntry = {
      element: img,
      config,
      originalSrc,
      callback,
      state: {
        isLoading: false,
        isLoaded: false,
        hasError: false,
        priority,
      },
    };

    this.imageEntries.set(img, entry);

    // Use native lazy loading if supported and configured
    if (config.useNativeLazy && 'loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
      img.src = originalSrc;
      
      // Still track the state
      img.onload = () => {
        entry.state.isLoaded = true;
        entry.state.loadEndTime = performance.now();
        callback?.(entry.state);
      };
      
      img.onerror = () => {
        entry.state.hasError = true;
        callback?.(entry.state);
      };
    } else {
      // Use Intersection Observer
      this.observer.observe(img);
    }
  }

  /**
   * Unregister an image from lazy loading
   */
  public unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.imageEntries.delete(img);
    this.pendingUpdates.delete(img);
  }

  /**
   * Preload an image with high priority
   */
  public preload(src: string, priority: LoadingPriority = 'high'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use link preload for critical images
      if (priority === 'critical' && typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to preload: ${src}`));
        document.head.appendChild(link);
        return;
      }

      // Use Image preloading for other priorities
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
      img.src = src;
    });
  }

  /**
   * Get loading state for an image
   */
  public getState(img: HTMLImageElement): ImageLoadingState | null {
    const entry = this.imageEntries.get(img);
    return entry ? entry.state : null;
  }

  /**
   * Cleanup and destroy the service
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.imageEntries.clear();
    this.pendingUpdates.clear();
  }

  /**
   * Get performance metrics for all loaded images
   */
  public getPerformanceMetrics(): Array<{
    priority: LoadingPriority;
    loadTime: number;
    wasLazyLoaded: boolean;
  }> {
    const metrics: Array<{
      priority: LoadingPriority;
      loadTime: number;
      wasLazyLoaded: boolean;
    }> = [];

    this.imageEntries.forEach((entry) => {
      const { state } = entry;
      if (state.isLoaded && state.loadStartTime && state.loadEndTime) {
        metrics.push({
          priority: state.priority,
          loadTime: state.loadEndTime - state.loadStartTime,
          wasLazyLoaded: state.priority !== 'critical',
        });
      }
    });

    return metrics;
  }
}

export default ImageLazyLoadService;