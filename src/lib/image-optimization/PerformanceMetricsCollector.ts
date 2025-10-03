/**
 * Zero-Overhead Image Performance Metrics Collector
 * 
 * Lightweight performance tracking using Performance Observer API
 * with minimal impact on image loading performance.
 */

import { ImagePerformanceMetrics, LoadingPriority, ConnectionInfo } from './types';

interface ImageMetricsEntry {
  id: string;
  src: string;
  priority: LoadingPriority;
  startTime: number;
  endTime?: number;
  loadTime?: number;
  wasLazyLoaded: boolean;
  viewport: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
  error?: string;
}

class PerformanceMetricsCollector {
  private static instance: PerformanceMetricsCollector;
  private metrics = new WeakMap<HTMLImageElement, ImageMetricsEntry>();
  private urlToMetricsMap = new Map<string, ImageMetricsEntry>(); // Additional map for URL lookup
  private aggregatedMetrics: ImagePerformanceMetrics[] = [];
  private performanceObserver: PerformanceObserver | null = null;
  private isEnabled: boolean = true;
  private maxMetricsCount: number = 1000; // Prevent memory leaks
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5 seconds
  private pendingBatch: ImagePerformanceMetrics[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializePerformanceObserver();
  }

  public static getInstance(): PerformanceMetricsCollector {
    if (!PerformanceMetricsCollector.instance) {
      PerformanceMetricsCollector.instance = new PerformanceMetricsCollector();
    }
    return PerformanceMetricsCollector.instance;
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      this.isEnabled = false;
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        // Process entries asynchronously to avoid blocking
        requestIdleCallback(() => {
          this.processPerformanceEntries(list.getEntries());
        }, { timeout: 1000 });
      });

      // Observe resource timing for images
      this.performanceObserver.observe({
        entryTypes: ['resource', 'navigation', 'measure'],
        buffered: true,
      });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
      this.isEnabled = false;
    }
  }

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    if (!this.isEnabled) return;

    entries.forEach((entry) => {
      // Only process image resources
      if (entry.entryType === 'resource' && this.isImageResource(entry.name)) {
        this.processImageResourceEntry(entry as PerformanceResourceTiming);
      }
    });
  }

  private isImageResource(url: string): boolean {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('image') || url.includes('img');
  }

  private processImageResourceEntry(entry: PerformanceResourceTiming): void {
    // Find corresponding image element and metrics
    const metrics = this.findMetricsByUrl(entry.name);
    if (metrics) {
      metrics.endTime = entry.responseEnd;
      metrics.loadTime = entry.responseEnd - entry.startTime;
      
      // Create performance metrics entry
      const performanceMetrics: ImagePerformanceMetrics = {
        imageId: metrics.id,
        loadTime: metrics.loadTime,
        priority: metrics.priority,
        wasLazyLoaded: metrics.wasLazyLoaded,
        viewport: metrics.viewport,
        connectionType: metrics.connectionType,
        timestamp: Date.now(),
      };

      this.addToBatch(performanceMetrics);
    }
  }

  private findMetricsByUrl(url: string): ImageMetricsEntry | null {
    // First try exact match
    const exactMatch = this.urlToMetricsMap.get(url);
    if (exactMatch) {
      return exactMatch;
    }

    // Then try partial matching
    for (const [storedUrl, metrics] of this.urlToMetricsMap) {
      if (url.includes(storedUrl) || storedUrl.includes(url)) {
        return metrics;
      }
    }
    
    return null;
  }

  private addToBatch(metrics: ImagePerformanceMetrics): void {
    this.pendingBatch.push(metrics);

    // Process batch when it reaches the batch size or after timeout
    if (this.pendingBatch.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeout);
    }
  }

  private processBatch(): void {
    if (this.pendingBatch.length === 0) return;

    // Add to aggregated metrics
    this.aggregatedMetrics.push(...this.pendingBatch);

    // Maintain maximum metrics count to prevent memory leaks
    if (this.aggregatedMetrics.length > this.maxMetricsCount) {
      this.aggregatedMetrics = this.aggregatedMetrics.slice(-this.maxMetricsCount);
    }

    // Clear batch
    this.pendingBatch = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Emit metrics event for external consumers
    this.emitMetricsEvent();
  }

  private emitMetricsEvent(): void {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('imagePerformanceMetrics', {
        detail: {
          metrics: this.getRecentMetrics(10),
          summary: this.getPerformanceSummary(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  private getViewportSize(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getConnectionType(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;
    
    const connection = (navigator as any).connection;
    return connection?.effectiveType || undefined;
  }

  /**
   * Start tracking an image's performance
   */
  public startTracking(
    img: HTMLImageElement,
    src: string,
    priority: LoadingPriority,
    wasLazyLoaded: boolean = true
  ): void {
    if (!this.isEnabled) return;

    const id = this.generateImageId(src);
    const metrics: ImageMetricsEntry = {
      id,
      src,
      priority,
      startTime: performance.now(),
      wasLazyLoaded,
      viewport: this.getViewportSize(),
      connectionType: this.getConnectionType(),
    };

    this.metrics.set(img, metrics);
    this.urlToMetricsMap.set(src, metrics);
  }

  /**
   * Mark an image as loaded
   */
  public markAsLoaded(img: HTMLImageElement): void {
    if (!this.isEnabled) return;

    const metrics = this.metrics.get(img);
    if (metrics && !metrics.endTime) {
      metrics.endTime = performance.now();
      metrics.loadTime = metrics.endTime - metrics.startTime;

      // Create performance metrics entry
      const performanceMetrics: ImagePerformanceMetrics = {
        imageId: metrics.id,
        loadTime: metrics.loadTime,
        priority: metrics.priority,
        wasLazyLoaded: metrics.wasLazyLoaded,
        viewport: metrics.viewport,
        connectionType: metrics.connectionType,
        timestamp: Date.now(),
      };

      this.addToBatch(performanceMetrics);
    }
  }

  /**
   * Mark an image as failed to load
   */
  public markAsError(img: HTMLImageElement, error: string): void {
    if (!this.isEnabled) return;

    const metrics = this.metrics.get(img);
    if (metrics) {
      metrics.error = error;
      metrics.endTime = performance.now();
    }
  }

  /**
   * Stop tracking an image
   */
  public stopTracking(img: HTMLImageElement): void {
    if (!this.isEnabled) return;
    
    // Get the metrics before deleting to remove from URL map
    const metrics = this.metrics.get(img);
    if (metrics) {
      this.urlToMetricsMap.delete(metrics.src);
    }
    
    this.metrics.delete(img);
  }

  /**
   * Get all collected metrics
   */
  public getAllMetrics(): ImagePerformanceMetrics[] {
    return [...this.aggregatedMetrics];
  }

  /**
   * Get recent metrics
   */
  public getRecentMetrics(count: number = 50): ImagePerformanceMetrics[] {
    return this.aggregatedMetrics.slice(-count);
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    totalImages: number;
    averageLoadTime: number;
    lazyLoadedPercentage: number;
    priorityBreakdown: Record<LoadingPriority, number>;
    viewportBreakdown: Record<string, number>;
    connectionBreakdown: Record<string, number>;
  } {
    const metrics = this.aggregatedMetrics;
    const totalImages = metrics.length;

    if (totalImages === 0) {
      return {
        totalImages: 0,
        averageLoadTime: 0,
        lazyLoadedPercentage: 0,
        priorityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
        viewportBreakdown: {},
        connectionBreakdown: {},
      };
    }

    const totalLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0);
    const lazyLoadedCount = metrics.filter(m => m.wasLazyLoaded).length;

    const priorityBreakdown: Record<LoadingPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const viewportBreakdown: Record<string, number> = {};
    const connectionBreakdown: Record<string, number> = {};

    metrics.forEach(metric => {
      priorityBreakdown[metric.priority]++;
      
      viewportBreakdown[metric.viewport] = (viewportBreakdown[metric.viewport] || 0) + 1;
      
      if (metric.connectionType) {
        connectionBreakdown[metric.connectionType] = (connectionBreakdown[metric.connectionType] || 0) + 1;
      }
    });

    return {
      totalImages,
      averageLoadTime: totalLoadTime / totalImages,
      lazyLoadedPercentage: (lazyLoadedCount / totalImages) * 100,
      priorityBreakdown,
      viewportBreakdown,
      connectionBreakdown,
    };
  }

  /**
   * Get Core Web Vitals related metrics
   */
  public getCoreWebVitalsMetrics(): {
    lcp: number | null;
    cls: number | null;
    fid: number | null;
  } {
    if (!this.isEnabled || typeof window === 'undefined') {
      return { lcp: null, cls: null, fid: null };
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      // This is a simplified approach - in practice, you'd use web-vitals library
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || null;
      
      return {
        lcp,
        cls: null, // Would need layout shift observer
        fid: null, // Would need first input delay observer
      };
    } catch (error) {
      return { lcp: null, cls: null, fid: null };
    }
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.aggregatedMetrics = [];
    this.pendingBatch = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Enable or disable metrics collection
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && typeof window !== 'undefined' && 'PerformanceObserver' in window;
  }

  /**
   * Export metrics for external analysis
   */
  public exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      summary: this.getPerformanceSummary(),
      metrics: this.getAllMetrics(),
      coreWebVitals: this.getCoreWebVitalsMetrics(),
    }, null, 2);
  }

  /**
   * Generate a unique ID for an image
   */
  private generateImageId(src: string): string {
    // Simple hash function for generating IDs
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      const char = src.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `img_${Math.abs(hash)}_${Date.now()}`;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.metrics = new WeakMap();
    this.urlToMetricsMap.clear();
    this.aggregatedMetrics = [];
    this.pendingBatch = [];
    this.isEnabled = false;
  }
}

// Utility function to get connection-aware performance thresholds
export function getPerformanceThresholds(connectionInfo: ConnectionInfo | null): {
  goodLoadTime: number;
  poorLoadTime: number;
} {
  if (!connectionInfo) {
    return { goodLoadTime: 1000, poorLoadTime: 2500 };
  }

  switch (connectionInfo.effectiveType) {
    case '2g':
      return { goodLoadTime: 3000, poorLoadTime: 6000 };
    case '3g':
      return { goodLoadTime: 2000, poorLoadTime: 4000 };
    case '4g':
      return { goodLoadTime: 1000, poorLoadTime: 2500 };
    default:
      return { goodLoadTime: 1000, poorLoadTime: 2500 };
  }
}

// Utility function to analyze performance metrics
export function analyzePerformanceMetrics(metrics: ImagePerformanceMetrics[]): {
  performance: 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
} {
  if (metrics.length === 0) {
    return {
      performance: 'good',
      recommendations: [],
    };
  }

  const averageLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
  const lazyLoadedPercentage = (metrics.filter(m => m.wasLazyLoaded).length / metrics.length) * 100;
  const slowImages = metrics.filter(m => m.loadTime > 2500).length;
  const slowImagePercentage = (slowImages / metrics.length) * 100;

  const recommendations: string[] = [];
  let performance: 'good' | 'needs-improvement' | 'poor' = 'good';

  if (averageLoadTime > 2500) {
    performance = 'poor';
    recommendations.push('Average image load time is too high. Consider optimizing image sizes and formats.');
  } else if (averageLoadTime > 1500) {
    performance = 'needs-improvement';
    recommendations.push('Image load times could be improved. Consider using WebP format and responsive images.');
  }

  if (lazyLoadedPercentage < 70) {
    recommendations.push('Consider implementing lazy loading for more images to improve initial page load.');
  }

  if (slowImagePercentage > 20) {
    recommendations.push('Too many images are loading slowly. Review image optimization and CDN usage.');
  }

  const criticalImages = metrics.filter(m => m.priority === 'critical');
  if (criticalImages.some(m => m.loadTime > 1000)) {
    performance = 'poor';
    recommendations.push('Critical images are loading too slowly. These should load within 1 second.');
  }

  return { performance, recommendations };
}

export default PerformanceMetricsCollector;