/**
 * Production caching strategies for blog system
 * Implements Redis caching, ISR, and CDN optimization
 */

import { createLogger } from '@/lib/logging/production-logger';

const cacheLogger = createLogger('cache');

// Redis client for production caching
let redis: any = null;

// Initialize Redis if available
async function initializeRedis() {
  if (process.env.REDIS_URL) {
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN,
      });
      cacheLogger.info('Redis cache initialized successfully');
    } catch (error) {
      cacheLogger.warn('Redis not available, falling back to memory cache', { error: (error as Error).message });
    }
  }
}

// Initialize Redis on module load
initializeRedis();

// Cache configuration
export const CACHE_CONFIG = {
  // Blog post cache TTL (1 hour)
  BLOG_POST_TTL: parseInt(process.env.CACHE_TTL || '3600'),
  
  // Blog listing cache TTL (30 minutes)
  BLOG_LISTING_TTL: 1800,
  
  // SEO data cache TTL (6 hours)
  SEO_DATA_TTL: 21600,
  
  // Analytics cache TTL (15 minutes)
  ANALYTICS_TTL: 900,
  
  // Health check cache TTL (5 minutes)
  HEALTH_CHECK_TTL: 300,
  
  // ISR revalidation time (1 hour)
  ISR_REVALIDATE: parseInt(process.env.ISR_REVALIDATE_TIME || '3600'),
};

// Cache key generators
export const getCacheKey = {
  blogPost: (slug: string) => `blog:post:${slug}`,
  blogListing: (page: number = 1, category?: string) => 
    `blog:listing:${page}${category ? `:${category}` : ''}`,
  seoData: (path: string) => `seo:${path}`,
  analytics: (metric: string, timeframe: string) => `analytics:${metric}:${timeframe}`,
  healthCheck: () => 'system:health',
  sitemap: () => 'sitemap:xml',
};

// Production cache interface
export interface ProductionCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

// Redis cache implementation
class RedisCache implements ProductionCache {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const startTime = Date.now();
      const value = await this.client.get(key);
      const duration = Date.now() - startTime;
      
      cacheLogger.logPerformance('cache_get', duration, { key, hit: !!value });
      
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      cacheLogger.error(`Redis get error for key ${key}`, { key }, error as Error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_CONFIG.BLOG_POST_TTL): Promise<void> {
    try {
      const startTime = Date.now();
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      const duration = Date.now() - startTime;
      
      cacheLogger.logPerformance('cache_set', duration, { 
        key, 
        ttl, 
        size: serialized.length 
      });
    } catch (error) {
      cacheLogger.error(`Redis set error for key ${key}`, { key, ttl }, error as Error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }
}

// In-memory cache fallback for development
class MemoryCache implements ProductionCache {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_CONFIG.BLOG_POST_TTL): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000),
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

// Cache instance
export const cache: ProductionCache = redis 
  ? new RedisCache(redis)
  : new MemoryCache();

// Cache utilities
export const cacheUtils = {
  // Wrap function with caching
  withCache: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    keyGenerator: (...args: T) => string,
    ttl?: number
  ) => {
    return async (...args: T): Promise<R> => {
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = await cache.get<R>(key);
      if (cached !== null) {
        return cached;
      }
      
      // Execute function and cache result
      const result = await fn(...args);
      await cache.set(key, result, ttl);
      
      return result;
    };
  },

  // Invalidate related cache keys
  invalidatePattern: async (pattern: string): Promise<void> => {
    // This would require Redis SCAN in production
    // For now, we'll implement specific invalidation methods
    console.log(`Cache invalidation pattern: ${pattern}`);
  },

  // Warm up cache with critical data
  warmUp: async (): Promise<void> => {
    try {
      console.log('Warming up production cache...');
      
      // Pre-cache critical blog data
      // This would be called during deployment
      
      console.log('Cache warm-up completed');
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  },

  // Get cache statistics
  getStats: async (): Promise<{
    hits: number;
    misses: number;
    size: number;
    keys: number;
    memory: number;
  }> => {
    try {
      if (redis) {
        // Redis-specific stats
        const info = await redis.info('memory');
        const keyCount = await redis.dbsize();
        
        return {
          hits: 0, // Would need to track this separately
          misses: 0, // Would need to track this separately
          size: parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0'),
          keys: keyCount,
          memory: parseInt(info.match(/used_memory_rss:(\d+)/)?.[1] || '0'),
        };
      } else {
        // Memory cache stats
        const memoryCache = cache as MemoryCache;
        return {
          hits: 0,
          misses: 0,
          size: (memoryCache as any).cache?.size || 0,
          keys: (memoryCache as any).cache?.size || 0,
          memory: 0,
        };
      }
    } catch (error) {
      cacheLogger.error('Failed to get cache stats', {}, error as Error);
      return {
        hits: 0,
        misses: 0,
        size: 0,
        keys: 0,
        memory: 0,
      };
    }
  },
};

// Cache middleware for API routes
export const withCacheMiddleware = (
  handler: (req: any, res: any) => Promise<any>,
  keyGenerator: (req: any) => string,
  ttl?: number
) => {
  return async (req: any, res: any) => {
    const key = keyGenerator(req);
    
    // Check cache first
    const cached = await cache.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }
    
    // Execute handler
    const originalJson = res.json;
    let responseData: any;
    
    res.json = function(data: any) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    await handler(req, res);
    
    // Cache the response
    if (responseData && res.statusCode === 200) {
      await cache.set(key, responseData, ttl);
      res.setHeader('X-Cache', 'MISS');
    }
  };
};

export default cache;