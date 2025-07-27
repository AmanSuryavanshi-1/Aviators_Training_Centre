/**
 * Production caching configuration and strategies
 * Optimized for Vercel deployment with Redis support
 */

export interface CacheConfig {
  // Cache TTL settings (in seconds)
  blogPostTTL: number;
  blogListingTTL: number;
  seoDataTTL: number;
  analyticsTTL: number;
  healthCheckTTL: number;
  
  // ISR settings
  isrRevalidateTime: number;
  
  // Redis settings
  redisMaxRetries: number;
  redisRetryDelay: number;
  enableRedisCluster: boolean;
  
  // Compression settings
  enableCompression: boolean;
  compressionLevel: number;
  
  // Cache size limits
  maxCacheSize: string;
  
  // Feature flags
  enableCachePreloading: boolean;
  enableCacheMetrics: boolean;
}

// Production cache configuration
export const PRODUCTION_CACHE_CONFIG: CacheConfig = {
  // Cache TTL settings
  blogPostTTL: parseInt(process.env.BLOG_POST_CACHE_TTL || '3600'), // 1 hour
  blogListingTTL: parseInt(process.env.BLOG_LISTING_CACHE_TTL || '1800'), // 30 minutes
  seoDataTTL: parseInt(process.env.SEO_DATA_CACHE_TTL || '21600'), // 6 hours
  analyticsTTL: parseInt(process.env.ANALYTICS_CACHE_TTL || '900'), // 15 minutes
  healthCheckTTL: parseInt(process.env.HEALTH_CHECK_CACHE_TTL || '300'), // 5 minutes
  
  // ISR settings
  isrRevalidateTime: parseInt(process.env.ISR_REVALIDATE_TIME || '3600'), // 1 hour
  
  // Redis settings
  redisMaxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  redisRetryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
  enableRedisCluster: process.env.ENABLE_REDIS_CLUSTER === 'true',
  
  // Compression settings
  enableCompression: process.env.ENABLE_CACHE_COMPRESSION === 'true',
  compressionLevel: parseInt(process.env.CACHE_COMPRESSION_LEVEL || '6'),
  
  // Cache size limits
  maxCacheSize: process.env.CACHE_MAX_SIZE || '100MB',
  
  // Feature flags
  enableCachePreloading: process.env.ENABLE_CACHE_PRELOADING === 'true',
  enableCacheMetrics: process.env.ENABLE_CACHE_METRICS !== 'false',
};

// Cache key strategies for different environments
export const getCacheKeyStrategy = () => {
  const environment = process.env.NODE_ENV || 'development';
  const version = process.env.npm_package_version || '1.0.0';
  
  return {
    prefix: `blog:${environment}:${version}`,
    
    // Blog-specific keys
    blogPost: (slug: string) => `${getCacheKeyStrategy().prefix}:post:${slug}`,
    blogListing: (page: number = 1, category?: string, featured?: boolean) => 
      `${getCacheKeyStrategy().prefix}:listing:${page}${category ? `:cat:${category}` : ''}${featured ? ':featured' : ''}`,
    
    // SEO keys
    seoData: (path: string) => `${getCacheKeyStrategy().prefix}:seo:${path.replace(/\//g, ':')}`,
    sitemap: () => `${getCacheKeyStrategy().prefix}:sitemap`,
    robotsTxt: () => `${getCacheKeyStrategy().prefix}:robots`,
    
    // Analytics keys
    analytics: (metric: string, timeframe: string) => 
      `${getCacheKeyStrategy().prefix}:analytics:${metric}:${timeframe}`,
    
    // System keys
    healthCheck: () => `${getCacheKeyStrategy().prefix}:health`,
    metrics: () => `${getCacheKeyStrategy().prefix}:metrics`,
    
    // User-specific keys
    userSession: (userId: string) => `${getCacheKeyStrategy().prefix}:session:${userId}`,
    userPreferences: (userId: string) => `${getCacheKeyStrategy().prefix}:prefs:${userId}`,
  };
};

// Cache invalidation patterns
export const CACHE_INVALIDATION_PATTERNS = {
  // Invalidate all blog content
  allBlogContent: () => `${getCacheKeyStrategy().prefix}:*`,
  
  // Invalidate specific blog post and related content
  blogPost: (slug: string) => [
    getCacheKeyStrategy().blogPost(slug),
    `${getCacheKeyStrategy().prefix}:listing:*`, // Invalidate all listings
    getCacheKeyStrategy().sitemap(),
  ],
  
  // Invalidate blog listings
  blogListings: () => `${getCacheKeyStrategy().prefix}:listing:*`,
  
  // Invalidate SEO data
  seoData: (path?: string) => path 
    ? getCacheKeyStrategy().seoData(path)
    : `${getCacheKeyStrategy().prefix}:seo:*`,
  
  // Invalidate analytics
  analytics: () => `${getCacheKeyStrategy().prefix}:analytics:*`,
};

// Cache warming strategies
export const CACHE_WARMING_STRATEGIES = {
  // Critical pages to pre-cache
  criticalPages: [
    '/',
    '/blog',
    '/courses',
    '/about',
    '/contact',
  ],
  
  // Blog content to pre-cache
  blogContent: {
    // Pre-cache first 3 pages of blog listings
    listingPages: 3,
    
    // Pre-cache featured posts
    featuredPosts: true,
    
    // Pre-cache recent posts (last 10)
    recentPosts: 10,
  },
  
  // SEO data to pre-cache
  seoData: {
    // Pre-cache sitemap
    sitemap: true,
    
    // Pre-cache robots.txt
    robotsTxt: true,
    
    // Pre-cache critical page SEO data
    criticalPagesSeo: true,
  },
};

// Performance monitoring thresholds
export const CACHE_PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (in milliseconds)
  cacheHit: 50, // Cache hit should be under 50ms
  cacheMiss: 200, // Cache miss should be under 200ms
  cacheSet: 100, // Cache set should be under 100ms
  
  // Cache hit ratio thresholds
  minHitRatio: 0.8, // Minimum 80% hit ratio
  targetHitRatio: 0.9, // Target 90% hit ratio
  
  // Memory usage thresholds
  maxMemoryUsage: 0.8, // Maximum 80% memory usage
  
  // Connection thresholds
  maxConnections: 100, // Maximum Redis connections
  connectionTimeout: 5000, // 5 second connection timeout
};

export default PRODUCTION_CACHE_CONFIG;