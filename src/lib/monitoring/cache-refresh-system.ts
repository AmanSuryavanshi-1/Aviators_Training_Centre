import { enhancedClient } from '../sanity/client';

export interface CacheRefreshConfig {
  enabled: boolean;
  intervals: {
    blogPosts: number; // minutes
    healthChecks: number; // minutes
    diagnostics: number; // minutes
  };
  triggers: {
    onHealthDegradation: boolean;
    onMaintenanceFailure: boolean;
    onResponseTimeThreshold: number; // ms
  };
}

export interface CacheRefreshResult {
  cacheType: string;
  success: boolean;
  message: string;
  duration: number;
  timestamp: Date;
  itemsRefreshed?: number;
}

export class CacheRefreshSystem {
  private config: CacheRefreshConfig;
  private refreshHistory: CacheRefreshResult[] = [];
  private intervals: { [key: string]: NodeJS.Timeout } = {};
  private isRunning = false;

  constructor(config?: Partial<CacheRefreshConfig>) {
    this.config = {
      enabled: true,
      intervals: {
        blogPosts: 30, // 30 minutes
        healthChecks: 15, // 15 minutes
        diagnostics: 60 // 60 minutes
      },
      triggers: {
        onHealthDegradation: true,
        onMaintenanceFailure: true,
        onResponseTimeThreshold: 5000 // 5 seconds
      },
      ...config
    };
  }

  /**
   * Start automatic cache refresh system
   */
  start(): void {
    if (this.isRunning || !this.config.enabled) {
      console.log('🔄 Cache refresh system already running or disabled');
      return;
    }

    console.log('🚀 Starting cache refresh system...');
    this.isRunning = true;

    // Set up periodic cache refreshes
    this.setupPeriodicRefresh('blogPosts', this.config.intervals.blogPosts, () => this.refreshBlogPostsCache());
    this.setupPeriodicRefresh('healthChecks', this.config.intervals.healthChecks, () => this.refreshHealthChecksCache());
    this.setupPeriodicRefresh('diagnostics', this.config.intervals.diagnostics, () => this.refreshDiagnosticsCache());

    console.log('✅ Cache refresh system started');
  }

  /**
   * Stop automatic cache refresh system
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏹️ Cache refresh system is not running');
      return;
    }

    console.log('⏹️ Stopping cache refresh system...');
    this.isRunning = false;

    // Clear all intervals
    Object.values(this.intervals).forEach(interval => clearInterval(interval));
    this.intervals = {};

    console.log('⏹️ Cache refresh system stopped');
  }

  /**
   * Set up periodic cache refresh
   */
  private setupPeriodicRefresh(name: string, intervalMinutes: number, refreshFunction: () => Promise<void>): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Run initial refresh after 30 seconds
    setTimeout(refreshFunction, 30000);
    
    // Set up periodic refresh
    this.intervals[name] = setInterval(refreshFunction, intervalMs);
    
    console.log(`📊 ${name} cache refresh scheduled every ${intervalMinutes} minutes`);
  }

  /**
   * Refresh blog posts cache
   */
  private async refreshBlogPostsCache(): Promise<CacheRefreshResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Refreshing blog posts cache...');
      
      // Clear Sanity client cache
      enhancedClient.resetValidationCache();
      
      // Pre-fetch commonly used blog queries to warm the cache
      const queries = [
        // Blog listing query
        `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
          _id, title, slug, publishedAt, excerpt, author, categories
        }[0...20]`,
        
        // Recent posts query
        `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
          _id, title, slug, publishedAt, excerpt
        }[0...5]`,
        
        // Categories query
        `*[_type == "category"] { _id, title, slug }`,
        
        // Authors query
        `*[_type == "author"] { _id, name, slug, bio }`
      ];

      let itemsRefreshed = 0;
      
      for (const query of queries) {
        try {
          const result = await enhancedClient.fetch(query, {}, { 
            cache: 'no-store',
            validateConnection: false 
          });
          itemsRefreshed += Array.isArray(result) ? result.length : 1;
        } catch (queryError) {
          console.warn(`Failed to refresh cache for query: ${query.substring(0, 50)}...`, queryError);
        }
      }

      const result: CacheRefreshResult = {
        cacheType: 'blogPosts',
        success: true,
        message: `Blog posts cache refreshed successfully`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        itemsRefreshed
      };

      this.addToHistory(result);
      console.log(`✅ Blog posts cache refreshed (${itemsRefreshed} items, ${result.duration}ms)`);
      
      return result;
      
    } catch (error) {
      const result: CacheRefreshResult = {
        cacheType: 'blogPosts',
        success: false,
        message: `Blog posts cache refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      console.error('❌ Blog posts cache refresh failed:', error);
      
      return result;
    }
  }

  /**
   * Refresh health checks cache
   */
  private async refreshHealthChecksCache(): Promise<CacheRefreshResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Refreshing health checks cache...');
      
      // Reset health monitor internal caches
      const { SystemHealthMonitor } = await import('./system-health-monitor');
      const healthMonitor = new SystemHealthMonitor();
      
      // Perform a fresh health check to warm the cache
      await healthMonitor.performHealthCheck();

      const result: CacheRefreshResult = {
        cacheType: 'healthChecks',
        success: true,
        message: 'Health checks cache refreshed successfully',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      console.log(`✅ Health checks cache refreshed (${result.duration}ms)`);
      
      return result;
      
    } catch (error) {
      const result: CacheRefreshResult = {
        cacheType: 'healthChecks',
        success: false,
        message: `Health checks cache refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      console.error('❌ Health checks cache refresh failed:', error);
      
      return result;
    }
  }

  /**
   * Refresh diagnostics cache
   */
  private async refreshDiagnosticsCache(): Promise<CacheRefreshResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Refreshing diagnostics cache...');
      
      // Reset diagnostic service cache
      const { SanityDiagnosticService } = await import('../diagnostics/sanity-diagnostic-service');
      const diagnosticService = new SanityDiagnosticService();
      
      // Perform fresh diagnostics to warm the cache
      await diagnosticService.generateDiagnosticReport();

      const result: CacheRefreshResult = {
        cacheType: 'diagnostics',
        success: true,
        message: 'Diagnostics cache refreshed successfully',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      console.log(`✅ Diagnostics cache refreshed (${result.duration}ms)`);
      
      return result;
      
    } catch (error) {
      const result: CacheRefreshResult = {
        cacheType: 'diagnostics',
        success: false,
        message: `Diagnostics cache refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      console.error('❌ Diagnostics cache refresh failed:', error);
      
      return result;
    }
  }

  /**
   * Trigger cache refresh based on system conditions
   */
  async triggerConditionalRefresh(conditions: {
    healthStatus?: string;
    maintenanceFailure?: boolean;
    averageResponseTime?: number;
  }): Promise<CacheRefreshResult[]> {
    const results: CacheRefreshResult[] = [];
    
    // Check if conditions warrant cache refresh
    const shouldRefresh = 
      (conditions.healthStatus === 'degraded' && this.config.triggers.onHealthDegradation) ||
      (conditions.maintenanceFailure && this.config.triggers.onMaintenanceFailure) ||
      (conditions.averageResponseTime && conditions.averageResponseTime > this.config.triggers.onResponseTimeThreshold);

    if (!shouldRefresh) {
      return results;
    }

    console.log('🔄 Triggering conditional cache refresh due to system conditions...');

    // Refresh all caches when conditions are met
    const refreshPromises = [
      this.refreshBlogPostsCache(),
      this.refreshHealthChecksCache(),
      this.refreshDiagnosticsCache()
    ];

    const refreshResults = await Promise.allSettled(refreshPromises);
    
    refreshResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const cacheTypes = ['blogPosts', 'healthChecks', 'diagnostics'];
        results.push({
          cacheType: cacheTypes[index],
          success: false,
          message: `Conditional refresh failed: ${result.reason}`,
          duration: 0,
          timestamp: new Date()
        });
      }
    });

    return results;
  }

  /**
   * Force refresh all caches
   */
  async forceRefreshAll(): Promise<CacheRefreshResult[]> {
    console.log('🔄 Force refreshing all caches...');
    
    const refreshPromises = [
      this.refreshBlogPostsCache(),
      this.refreshHealthChecksCache(),
      this.refreshDiagnosticsCache()
    ];

    const refreshResults = await Promise.allSettled(refreshPromises);
    const results: CacheRefreshResult[] = [];
    
    refreshResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const cacheTypes = ['blogPosts', 'healthChecks', 'diagnostics'];
        results.push({
          cacheType: cacheTypes[index],
          success: false,
          message: `Force refresh failed: ${result.reason}`,
          duration: 0,
          timestamp: new Date()
        });
      }
    });

    return results;
  }

  /**
   * Add result to history
   */
  private addToHistory(result: CacheRefreshResult): void {
    this.refreshHistory.push(result);
    
    // Keep only the most recent 100 results
    if (this.refreshHistory.length > 100) {
      this.refreshHistory = this.refreshHistory.slice(-100);
    }
  }

  /**
   * Get cache refresh status
   */
  getStatus(): {
    isRunning: boolean;
    config: CacheRefreshConfig;
    recentResults: CacheRefreshResult[];
    statistics: {
      totalRefreshes: number;
      successRate: number;
      averageDuration: number;
      refreshesByType: { [key: string]: number };
    };
  } {
    const last24h = this.refreshHistory.filter(r => 
      r.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const successRate = last24h.length > 0 
      ? (last24h.filter(r => r.success).length / last24h.length) * 100 
      : 0;

    const averageDuration = last24h.length > 0
      ? last24h.reduce((sum, r) => sum + r.duration, 0) / last24h.length
      : 0;

    const refreshesByType: { [key: string]: number } = {};
    last24h.forEach(r => {
      refreshesByType[r.cacheType] = (refreshesByType[r.cacheType] || 0) + 1;
    });

    return {
      isRunning: this.isRunning,
      config: this.config,
      recentResults: this.refreshHistory.slice(-10),
      statistics: {
        totalRefreshes: this.refreshHistory.length,
        successRate: Math.round(successRate),
        averageDuration: Math.round(averageDuration),
        refreshesByType
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CacheRefreshConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Restart if running and intervals changed
    if (this.isRunning && (
      oldConfig.intervals.blogPosts !== this.config.intervals.blogPosts ||
      oldConfig.intervals.healthChecks !== this.config.intervals.healthChecks ||
      oldConfig.intervals.diagnostics !== this.config.intervals.diagnostics
    )) {
      this.stop();
      setTimeout(() => this.start(), 1000);
    }

    console.log('⚙️ Cache refresh system configuration updated');
  }
}

// Global cache refresh system instance
let globalCacheRefreshSystem: CacheRefreshSystem | null = null;

/**
 * Get or create the global cache refresh system instance
 */
export function getGlobalCacheRefreshSystem(): CacheRefreshSystem {
  if (!globalCacheRefreshSystem) {
    globalCacheRefreshSystem = new CacheRefreshSystem();
  }
  return globalCacheRefreshSystem;
}
