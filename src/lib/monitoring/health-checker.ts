/**
 * Health checker for all blog services
 * Monitors service availability, performance, and dependencies
 */

import { performanceMonitor } from './performance-monitor';
import { errorTracker } from './error-tracker';
import { queryOptimizer } from './query-optimizer';

interface HealthCheck {
  name: string;
  description: string;
  check: () => Promise<HealthCheckResult>;
  critical: boolean;
  timeout: number;
  interval: number;
}

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'unhealthy';
  message: string;
  details?: Record<string, any>;
  responseTime: number;
  timestamp: Date;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  lastCheck: Date;
  uptime: number;
  checks: HealthCheckResult[];
}

class HealthChecker {
  private checks: HealthCheck[] = [];
  private results = new Map<string, HealthCheckResult[]>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private readonly maxResults = 100; // Keep last 100 results per check

  constructor() {
    this.initializeHealthChecks();
    this.startHealthChecks();
  }

  /**
   * Initialize health checks for all blog services
   */
  private initializeHealthChecks(): void {
    this.checks = [
      {
        name: 'sanity-connection',
        description: 'Check Sanity CMS connection and authentication',
        check: this.checkSanityConnection.bind(this),
        critical: true,
        timeout: 10000,
        interval: 60000, // 1 minute
      },
      {
        name: 'blog-api-endpoints',
        description: 'Check blog API endpoints availability',
        check: this.checkBlogApiEndpoints.bind(this),
        critical: true,
        timeout: 5000,
        interval: 120000, // 2 minutes
      },
      {
        name: 'cache-system',
        description: 'Check cache system health and performance',
        check: this.checkCacheSystem.bind(this),
        critical: false,
        timeout: 3000,
        interval: 300000, // 5 minutes
      },
      {
        name: 'database-performance',
        description: 'Check database query performance',
        check: this.checkDatabasePerformance.bind(this),
        critical: false,
        timeout: 8000,
        interval: 300000, // 5 minutes
      },
      {
        name: 'conversion-tracking',
        description: 'Check conversion tracking system',
        check: this.checkConversionTracking.bind(this),
        critical: false,
        timeout: 5000,
        interval: 600000, // 10 minutes
      },
      {
        name: 'error-rates',
        description: 'Check system error rates and patterns',
        check: this.checkErrorRates.bind(this),
        critical: false,
        timeout: 2000,
        interval: 180000, // 3 minutes
      },
      {
        name: 'memory-usage',
        description: 'Check system memory usage',
        check: this.checkMemoryUsage.bind(this),
        critical: false,
        timeout: 1000,
        interval: 120000, // 2 minutes
      },
      {
        name: 'seo-services',
        description: 'Check SEO optimization services',
        check: this.checkSeoServices.bind(this),
        critical: false,
        timeout: 5000,
        interval: 600000, // 10 minutes
      },
    ];
  }

  /**
   * Start all health checks
   */
  private startHealthChecks(): void {
    this.checks.forEach(check => {
      // Run initial check
      this.runHealthCheck(check);
      
      // Set up interval
      const interval = setInterval(() => {
        this.runHealthCheck(check);
      }, check.interval);
      
      this.intervals.set(check.name, interval);
    });
  }

  /**
   * Run a single health check
   */
  private async runHealthCheck(check: HealthCheck): Promise<void> {
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
      });

      const result = await Promise.race([
        check.check(),
        timeoutPromise,
      ]);

      result.responseTime = Date.now() - startTime;
      result.timestamp = new Date();

      this.recordResult(check.name, result);
      
    } catch (error) {
      const result: HealthCheckResult = {
        status: 'unhealthy',
        message: `Health check failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      };

      this.recordResult(check.name, result);
      errorTracker.trackError(`health-check:${check.name}`, error as Error);
    }
  }

  /**
   * Record health check result
   */
  private recordResult(checkName: string, result: HealthCheckResult): void {
    if (!this.results.has(checkName)) {
      this.results.set(checkName, []);
    }

    const results = this.results.get(checkName)!;
    results.push(result);

    // Keep only the most recent results
    if (results.length > this.maxResults) {
      results.splice(0, results.length - this.maxResults);
    }
  }

  /**
   * Check Sanity CMS connection
   */
  private async checkSanityConnection(): Promise<HealthCheckResult> {
    try {
      // Import Sanity client dynamically to avoid circular dependencies
      const { enhancedClient } = await import('../sanity/client');
      
      const result = await enhancedClient.fetch('*[_type == "post"] | order(_createdAt desc) [0...1] { _id }');
      
      return {
        status: 'healthy',
        message: 'Sanity connection is working',
        details: { postsFound: result.length },
        responseTime: 0,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Sanity connection failed: ${error.message}`,
        responseTime: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check blog API endpoints
   */
  private async checkBlogApiEndpoints(): Promise<HealthCheckResult> {
    const endpoints = [
      '/api/blog/posts',
      '/api/blog/categories',
      '/api/blog/authors',
      '/api/health',
    ];

    const results = await Promise.allSettled(
      endpoints.map(async endpoint => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${endpoint}`);
        return { endpoint, status: response.status, ok: response.ok };
      })
    );

    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));
    
    if (failed.length === 0) {
      return {
        status: 'healthy',
        message: 'All blog API endpoints are responding',
        details: { endpointsChecked: endpoints.length },
        responseTime: 0,
        timestamp: new Date(),
      };
    } else {
      return {
        status: failed.length === endpoints.length ? 'unhealthy' : 'warning',
        message: `${failed.length} of ${endpoints.length} endpoints are failing`,
        details: { failedEndpoints: failed.length },
        responseTime: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check cache system health
   */
  private async checkCacheSystem(): Promise<HealthCheckResult> {
    const cacheStats = queryOptimizer.getCacheStats();
    
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let message = 'Cache system is performing well';
    
    if (cacheStats.hitRate < 0.3) {
      status = 'warning';
      message = 'Cache hit rate is low';
    }
    
    if (cacheStats.memoryUsage > 100 * 1024 * 1024) { // 100MB
      status = 'unhealthy';
      message = 'Cache memory usage is too high';
    }

    return {
      status,
      message,
      details: cacheStats,
      responseTime: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Check database performance
   */
  private async checkDatabasePerformance(): Promise<HealthCheckResult> {
    const stats = performanceMonitor.getAllStats();
    const dbStats = stats.filter(s => s.operation.includes('query') || s.operation.includes('sanity'));
    
    if (dbStats.length === 0) {
      return {
        status: 'warning',
        message: 'No database performance data available',
        responseTime: 0,
        timestamp: new Date(),
      };
    }

    const avgResponseTime = dbStats.reduce((sum, stat) => sum + stat.averageDuration, 0) / dbStats.length;
    const minSuccessRate = Math.min(...dbStats.map(stat => stat.successRate));
    
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let message = 'Database performance is good';
    
    if (avgResponseTime > 2000) {
      status = 'warning';
      message = 'Database queries are slow';
    }
    
    if (minSuccessRate < 0.95) {
      status = 'unhealthy';
      message = 'Database queries have high failure rate';
    }

    return {
      status,
      message,
      details: {
        averageResponseTime: avgResponseTime,
        minimumSuccessRate: minSuccessRate,
        operationsTracked: dbStats.length,
      },
      responseTime: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Check conversion tracking system
   */
  private async checkConversionTracking(): Promise<HealthCheckResult> {
    try {
      // Check if conversion tracking API is responding
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics/conversions`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          message: 'Conversion tracking is working',
          details: { conversionsTracked: data.total || 0 },
          responseTime: 0,
          timestamp: new Date(),
        };
      } else {
        return {
          status: 'warning',
          message: 'Conversion tracking API is not responding properly',
          responseTime: 0,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Conversion tracking failed: ${error.message}`,
        responseTime: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check system error rates
   */
  private async checkErrorRates(): Promise<HealthCheckResult> {
    const healthSummary = errorTracker.getHealthSummary();
    
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let message = 'Error rates are within normal limits';
    
    if (healthSummary.lastHour.errors > 10) {
      status = 'warning';
      message = 'High error rate detected';
    }
    
    if (healthSummary.criticalErrors > 0) {
      status = 'unhealthy';
      message = 'Critical errors detected';
    }

    return {
      status,
      message,
      details: healthSummary,
      responseTime: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let message = 'Memory usage is normal';
    
    if (memoryUsageMB.heapUsed > 500) {
      status = 'warning';
      message = 'High memory usage detected';
    }
    
    if (memoryUsageMB.heapUsed > 1000) {
      status = 'unhealthy';
      message = 'Critical memory usage detected';
    }

    return {
      status,
      message,
      details: memoryUsageMB,
      responseTime: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Check SEO services
   */
  private async checkSeoServices(): Promise<HealthCheckResult> {
    try {
      // Check if sitemap is accessible
      const sitemapResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sitemap.xml`);
      
      if (sitemapResponse.ok) {
        return {
          status: 'healthy',
          message: 'SEO services are working',
          details: { sitemapAccessible: true },
          responseTime: 0,
          timestamp: new Date(),
        };
      } else {
        return {
          status: 'warning',
          message: 'SEO sitemap is not accessible',
          responseTime: 0,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `SEO services check failed: ${error.message}`,
        responseTime: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get current health status for all services
   */
  getHealthStatus(): ServiceHealth[] {
    return this.checks.map(check => {
      const results = this.results.get(check.name) || [];
      const latestResult = results[results.length - 1];
      
      // Calculate uptime (percentage of healthy checks in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentResults = results.filter(r => r.timestamp > oneDayAgo);
      const healthyResults = recentResults.filter(r => r.status === 'healthy');
      const uptime = recentResults.length > 0 ? (healthyResults.length / recentResults.length) * 100 : 0;

      return {
        name: check.name,
        status: latestResult?.status || 'unhealthy',
        lastCheck: latestResult?.timestamp || new Date(0),
        uptime,
        checks: results.slice(-10), // Last 10 results
      };
    });
  }

  /**
   * Get overall system health
   */
  getOverallHealth(): {
    status: 'healthy' | 'warning' | 'unhealthy';
    message: string;
    services: ServiceHealth[];
    summary: {
      total: number;
      healthy: number;
      warning: number;
      unhealthy: number;
      criticalIssues: number;
    };
  } {
    const services = this.getHealthStatus();
    const criticalServices = this.checks.filter(c => c.critical).map(c => c.name);
    
    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      warning: services.filter(s => s.status === 'warning').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length,
      criticalIssues: services.filter(s => 
        criticalServices.includes(s.name) && s.status === 'unhealthy'
      ).length,
    };

    let overallStatus: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let message = 'All systems are operational';

    if (summary.criticalIssues > 0) {
      overallStatus = 'unhealthy';
      message = `${summary.criticalIssues} critical service(s) are down`;
    } else if (summary.unhealthy > 0 || summary.warning > 0) {
      overallStatus = 'warning';
      message = `${summary.unhealthy + summary.warning} service(s) need attention`;
    }

    return {
      status: overallStatus,
      message,
      services,
      summary,
    };
  }

  /**
   * Run all health checks immediately
   */
  async runAllChecks(): Promise<ServiceHealth[]> {
    await Promise.all(this.checks.map(check => this.runHealthCheck(check)));
    return this.getHealthStatus();
  }

  /**
   * Stop all health checks
   */
  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  /**
   * Get health check history
   */
  getHealthHistory(checkName: string, hours: number = 24): HealthCheckResult[] {
    const results = this.results.get(checkName) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return results.filter(r => r.timestamp > cutoffTime);
  }
}

// Global health checker instance
export const healthChecker = new HealthChecker();

export type { HealthCheck, HealthCheckResult, ServiceHealth };
