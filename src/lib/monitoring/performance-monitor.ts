/**
 * Performance monitoring system for blog operations
 * Tracks timing, memory usage, and operation success rates
 */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
  memoryUsage?: NodeJS.MemoryUsage;
}

interface PerformanceStats {
  operation: string;
  totalCalls: number;
  successRate: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  lastUpdated: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k metrics
  private readonly alertThresholds = {
    slowOperation: 5000, // 5 seconds
    lowSuccessRate: 0.95, // 95%
    highMemoryUsage: 500 * 1024 * 1024, // 500MB
  };

  /**
   * Start timing an operation
   */
  startTiming(operation: string): () => void {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    return (success: boolean = true, metadata?: Record<string, any>) => {
      const endTime = Date.now();
      const endMemory = this.getMemoryUsage();
      const duration = endTime - startTime;

      const metric: PerformanceMetric = {
        operation,
        duration,
        timestamp: new Date(),
        success,
        metadata,
        memoryUsage: this.calculateMemoryDiff(startMemory, endMemory),
      };

      this.recordMetric(metric);
      this.checkAlerts(metric);
    };
  }

  /**
   * Get memory usage - works in both Node.js and browser environments
   */
  private getMemoryUsage(): NodeJS.MemoryUsage | null {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    // Browser environment - use performance.memory if available
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      return {
        rss: memory.totalJSHeapSize || 0,
        heapTotal: memory.totalJSHeapSize || 0,
        heapUsed: memory.usedJSHeapSize || 0,
        external: 0,
        arrayBuffers: 0,
      };
    }
    
    return null;
  }

  /**
   * Calculate memory usage difference
   */
  private calculateMemoryDiff(start: NodeJS.MemoryUsage | null, end: NodeJS.MemoryUsage | null): NodeJS.MemoryUsage | undefined {
    if (!start || !end) {
      return undefined;
    }

    return {
      rss: end.rss - start.rss,
      heapTotal: end.heapTotal - start.heapTotal,
      heapUsed: end.heapUsed - start.heapUsed,
      external: end.external - start.external,
      arrayBuffers: end.arrayBuffers - start.arrayBuffers,
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > this.alertThresholds.slowOperation) {
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration}ms`);
    }
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metric: PerformanceMetric): void {
    // Check memory usage (only if available)
    if (metric.memoryUsage && metric.memoryUsage.heapUsed > this.alertThresholds.highMemoryUsage) {
      console.warn(`High memory usage detected: ${metric.operation} used ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check success rate for recent operations
    const recentMetrics = this.getRecentMetrics(metric.operation, 100);
    if (recentMetrics.length > 0) {
      const successRate = recentMetrics.filter(m => m.success).length / recentMetrics.length;
      
      if (successRate < this.alertThresholds.lowSuccessRate) {
        console.error(`Low success rate detected: ${metric.operation} has ${(successRate * 100).toFixed(1)}% success rate`);
      }
    }
  }

  /**
   * Get recent metrics for an operation
   */
  private getRecentMetrics(operation: string, count: number): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.operation === operation)
      .slice(-count);
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): PerformanceStats | null {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    if (operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration).sort((a, b) => a - b);
    const successCount = operationMetrics.filter(m => m.success).length;

    return {
      operation,
      totalCalls: operationMetrics.length,
      successRate: successCount / operationMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): PerformanceStats[] {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    return operations.map(op => this.getStats(op)).filter(Boolean) as PerformanceStats[];
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    totalOperations: number;
    overallSuccessRate: number;
    slowOperations: string[];
    memoryAlerts: number;
    lastHour: {
      operations: number;
      errors: number;
      averageResponseTime: number;
    };
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    const slowOperations = this.getAllStats()
      .filter(stat => stat.averageDuration > this.alertThresholds.slowOperation)
      .map(stat => stat.operation);

    const memoryAlerts = this.metrics.filter(m => 
      m.memoryUsage && m.memoryUsage.heapUsed > this.alertThresholds.highMemoryUsage
    ).length;

    return {
      totalOperations: this.metrics.length,
      overallSuccessRate: this.metrics.filter(m => m.success).length / this.metrics.length,
      slowOperations,
      memoryAlerts,
      lastHour: {
        operations: recentMetrics.length,
        errors: recentMetrics.filter(m => !m.success).length,
        averageResponseTime: recentMetrics.length > 0 
          ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length 
          : 0,
      },
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function for easy operation timing
export function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const endTiming = performanceMonitor.startTiming(operation);
  
  return fn()
    .then(result => {
      endTiming(true, metadata);
      return result;
    })
    .catch(error => {
      endTiming(false, { ...metadata, error: error.message });
      throw error;
    });
}

export type { PerformanceMetric, PerformanceStats };
