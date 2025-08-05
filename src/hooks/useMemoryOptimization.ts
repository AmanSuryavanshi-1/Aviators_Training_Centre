'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';

interface MemoryOptimizationOptions {
  maxCacheSize?: number;
  cleanupInterval?: number;
  enableWeakRefs?: boolean;
  enablePerformanceMonitoring?: boolean;
}

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  cacheHitRate: number;
  lastCleanup: number;
}

export function useMemoryOptimization(options: MemoryOptimizationOptions = {}) {
  const {
    maxCacheSize = 100,
    cleanupInterval = 60000, // 1 minute
    enableWeakRefs = true,
    enablePerformanceMonitoring = true
  } = options;

  const cacheRef = useRef(new Map<string, any>());
  const weakRefsRef = useRef(enableWeakRefs ? new WeakMap() : null);
  const metricsRef = useRef<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    cacheHitRate: 0,
    lastCleanup: Date.now()
  });
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderStartTimeRef = useRef<number>(0);

  // Performance monitoring
  const startRenderMeasurement = useCallback(() => {
    if (enablePerformanceMonitoring) {
      renderStartTimeRef.current = performance.now();
    }
  }, [enablePerformanceMonitoring]);

  const endRenderMeasurement = useCallback(() => {
    if (enablePerformanceMonitoring && renderStartTimeRef.current > 0) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      metricsRef.current.renderTime = renderTime;
      renderStartTimeRef.current = 0;
    }
  }, [enablePerformanceMonitoring]);

  // Cache management
  const setCache = useCallback((key: string, value: any, ttl?: number) => {
    const cache = cacheRef.current;
    
    // Remove oldest entries if cache is full
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const entry = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 300000, // 5 minutes default
      accessCount: 0
    };

    cache.set(key, entry);

    // Update memory usage estimate
    if (enablePerformanceMonitoring) {
      metricsRef.current.memoryUsage = cache.size;
    }
  }, [maxCacheSize, enablePerformanceMonitoring]);

  const getCache = useCallback((key: string) => {
    const cache = cacheRef.current;
    const entry = cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    // Update access count and move to end (LRU)
    entry.accessCount++;
    cache.delete(key);
    cache.set(key, entry);

    return entry.value;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    if (enablePerformanceMonitoring) {
      metricsRef.current.memoryUsage = 0;
    }
  }, [enablePerformanceMonitoring]);

  // WeakRef management for large objects
  const setWeakRef = useCallback((key: any, value: any) => {
    if (weakRefsRef.current && typeof key === 'object') {
      weakRefsRef.current.set(key, new WeakRef(value));
    }
  }, []);

  const getWeakRef = useCallback((key: any) => {
    if (!weakRefsRef.current || typeof key !== 'object') {
      return null;
    }

    const weakRef = weakRefsRef.current.get(key);
    if (!weakRef) {
      return null;
    }

    const value = weakRef.deref();
    if (!value) {
      // Object was garbage collected, remove the WeakRef
      weakRefsRef.current.delete(key);
      return null;
    }

    return value;
  }, []);

  // Cleanup expired cache entries
  const cleanup = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
        removedCount++;
      }
    }

    if (enablePerformanceMonitoring) {
      metricsRef.current.lastCleanup = now;
      metricsRef.current.memoryUsage = cache.size;
    }

    console.log(`Memory cleanup: removed ${removedCount} expired entries`);
  }, [enablePerformanceMonitoring]);

  // Memoized data processor with size limits
  const createMemoizedProcessor = useCallback(<T, R>(
    processor: (data: T) => R,
    keyExtractor: (data: T) => string,
    maxItems: number = 1000
  ) => {
    return (data: T): R => {
      const key = keyExtractor(data);
      const cached = getCache(key);
      
      if (cached) {
        return cached;
      }

      // Limit processing for very large datasets
      let processedData = data;
      if (Array.isArray(data) && data.length > maxItems) {
        console.warn(`Dataset too large (${data.length} items), processing first ${maxItems} items`);
        processedData = data.slice(0, maxItems) as T;
      }

      const result = processor(processedData);
      setCache(key, result);
      
      return result;
    };
  }, [getCache, setCache]);

  // Debounced function creator for expensive operations
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 300
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (!enablePerformanceMonitoring) {
      return null;
    }

    const metrics = metricsRef.current;
    const cacheSize = cacheRef.current.size;
    
    // Estimate memory usage (rough calculation)
    let estimatedMemory = 0;
    for (const [key, entry] of cacheRef.current.entries()) {
      estimatedMemory += JSON.stringify(entry).length;
    }

    return {
      cacheSize,
      estimatedMemoryKB: Math.round(estimatedMemory / 1024),
      renderTime: metrics.renderTime,
      lastCleanup: metrics.lastCleanup,
      // Browser memory API if available
      ...(performance.memory && {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      })
    };
  }, [enablePerformanceMonitoring]);

  // Batch processing for large datasets
  const processBatch = useCallback(async <T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 100,
    onProgress?: (processed: number, total: number) => void
  ): Promise<R[]> => {
    const results: R[] = [];
    const total = items.length;

    for (let i = 0; i < total; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);

      if (onProgress) {
        onProgress(Math.min(i + batchSize, total), total);
      }

      // Allow other tasks to run
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  }, []);

  // Setup cleanup interval
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(cleanup, cleanupInterval);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanup, cleanupInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache();
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [clearCache]);

  return {
    // Cache management
    setCache,
    getCache,
    clearCache,
    
    // WeakRef management
    setWeakRef,
    getWeakRef,
    
    // Performance monitoring
    startRenderMeasurement,
    endRenderMeasurement,
    getMemoryUsage,
    
    // Utility functions
    createMemoizedProcessor,
    createDebouncedFunction,
    processBatch,
    cleanup
  };
}

// Hook for optimizing large lists
export function useVirtualization(
  items: any[],
  itemHeight: number,
  containerHeight: number
) {
  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(visibleCount * 0.5); // 50% buffer
    
    return {
      start: 0,
      end: Math.min(visibleCount + buffer, items.length),
      visibleCount,
      buffer
    };
  }, [items.length, itemHeight, containerHeight]);

  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleRange.visibleCount + visibleRange.buffer,
      items.length
    );

    return {
      startIndex: Math.max(0, startIndex - visibleRange.buffer),
      endIndex,
      items: items.slice(
        Math.max(0, startIndex - visibleRange.buffer),
        endIndex
      )
    };
  }, [items, itemHeight, visibleRange]);

  return {
    visibleRange,
    getVisibleItems,
    totalHeight: items.length * itemHeight
  };
}

// Hook for managing component lifecycle and preventing memory leaks
export function useComponentCleanup() {
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    if (!isMountedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
      timeoutsRef.current.delete(timeoutId);
    }, delay);
    
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    if (!isMountedRef.current) return;
    
    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
      
      // Clear all intervals
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current.clear();
      
      // Abort all controllers
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    isMounted: () => isMountedRef.current,
    safeSetTimeout,
    safeSetInterval,
    createAbortController
  };
}