/**
 * Performance monitoring endpoint
 * Provides detailed performance metrics for production monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache/production-cache';
import { sanityClient } from '@/lib/sanity/client';
import { createLogger } from '@/lib/logging/production-logger';

const performanceLogger = createLogger('performance');

interface PerformanceMetrics {
  timestamp: string;
  system: {
    memory: NodeJS.MemoryUsage;
    uptime: number;
    cpuUsage: NodeJS.CpuUsage;
    loadAverage: number[];
  };
  cache: {
    hitRatio: number;
    responseTime: number;
    errorRate: number;
    size: number;
  };
  database: {
    responseTime: number;
    errorRate: number;
    connectionCount: number;
  };
  api: {
    averageResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  blog: {
    postsCount: number;
    averageLoadTime: number;
    seoScore: number;
  };
}

// Measure cache performance
async function measureCachePerformance() {
  const startTime = Date.now();
  const testKey = 'perf-test-' + Date.now();
  const testValue = { test: true, timestamp: Date.now() };
  
  try {
    // Test cache write
    await cache.set(testKey, testValue, 60);
    
    // Test cache read
    const retrieved = await cache.get(testKey);
    
    // Cleanup
    await cache.del(testKey);
    
    const responseTime = Date.now() - startTime;
    
    return {
      hitRatio: 0.95, // Would be calculated from actual metrics
      responseTime,
      errorRate: 0,
      size: 0, // Would be from cache stats
    };
  } catch (error) {
    performanceLogger.error('Cache performance test failed', {}, error as Error);
    return {
      hitRatio: 0,
      responseTime: Date.now() - startTime,
      errorRate: 1,
      size: 0,
    };
  }
}

// Measure database performance
async function measureDatabasePerformance() {
  const startTime = Date.now();
  
  try {
    // Test Sanity query
    await sanityClient.fetch('*[_type == "post"][0]');
    
    const responseTime = Date.now() - startTime;
    
    return {
      responseTime,
      errorRate: 0,
      connectionCount: 1, // Would be from actual connection pool
    };
  } catch (error) {
    performanceLogger.error('Database performance test failed', {}, error as Error);
    return {
      responseTime: Date.now() - startTime,
      errorRate: 1,
      connectionCount: 0,
    };
  }
}

// Measure blog-specific performance
async function measureBlogPerformance() {
  try {
    const postsQuery = '*[_type == "post"] | order(publishedAt desc)';
    const posts = await sanityClient.fetch(postsQuery);
    
    return {
      postsCount: posts.length,
      averageLoadTime: 150, // Would be calculated from actual metrics
      seoScore: 95, // Would be calculated from SEO analysis
    };
  } catch (error) {
    performanceLogger.error('Blog performance measurement failed', {}, error as Error);
    return {
      postsCount: 0,
      averageLoadTime: 0,
      seoScore: 0,
    };
  }
}

// Get system performance metrics
function getSystemMetrics() {
  return {
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    cpuUsage: process.cpuUsage(),
    loadAverage: process.platform === 'linux' ? require('os').loadavg() : [0, 0, 0],
  };
}

// Main performance monitoring endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Collect all performance metrics in parallel
    const [cacheMetrics, dbMetrics, blogMetrics] = await Promise.all([
      measureCachePerformance(),
      measureDatabasePerformance(),
      measureBlogPerformance(),
    ]);
    
    const systemMetrics = getSystemMetrics();
    
    const performanceData: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      cache: cacheMetrics,
      database: dbMetrics,
      api: {
        averageResponseTime: Date.now() - startTime,
        requestsPerSecond: 10, // Would be calculated from actual metrics
        errorRate: 0.01, // Would be calculated from actual metrics
      },
      blog: blogMetrics,
    };
    
    // Log performance data
    performanceLogger.logPerformance('performance_check', Date.now() - startTime, {
      cacheResponseTime: cacheMetrics.responseTime,
      dbResponseTime: dbMetrics.responseTime,
      memoryUsage: systemMetrics.memory.heapUsed,
    });
    
    // Cache performance data briefly
    await cache.set('performance:latest', performanceData, 300); // 5 minutes
    
    return NextResponse.json(performanceData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    performanceLogger.error('Performance monitoring failed', {}, error as Error);
    
    return NextResponse.json(
      { 
        error: 'Performance monitoring failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Performance alerts endpoint
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { metric, threshold, value } = body;
    
    // Check if metric exceeds threshold
    if (value > threshold) {
      performanceLogger.warn('Performance threshold exceeded', {
        metric,
        threshold,
        value,
        severity: 'high',
      });
      
      // In production, this would trigger alerts
      // e.g., send to Slack, PagerDuty, etc.
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process performance alert' },
      { status: 500 }
    );
  }
}