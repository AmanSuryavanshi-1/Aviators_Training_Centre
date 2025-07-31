/**
 * Performance optimization configuration
 */

export const PERFORMANCE_CONFIG = {
  // Cache settings
  CACHE_TTL: {
    BLOG_POSTS: 5 * 60 * 1000, // 5 minutes
    STATIC_CONTENT: 24 * 60 * 60 * 1000, // 24 hours
    API_RESPONSES: 2 * 60 * 1000, // 2 minutes
  },

  // Image optimization
  IMAGE_QUALITY: 85,
  IMAGE_FORMATS: ['webp', 'avif'],

  // Bundle optimization
  CHUNK_SIZE_LIMIT: 244 * 1024, // 244KB

  // API rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // Database query optimization
  QUERY_TIMEOUT: 10000, // 10 seconds
  MAX_QUERY_RESULTS: 50,
} as const;

export type PerformanceConfig = typeof PERFORMANCE_CONFIG;
