// Main blog API exports
export {
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllBlogCategories,
  getAllCourses,
  getRelatedBlogPosts,
  getAllBlogPostSlugs,
  BlogAPIError,
  BLOG_QUERIES,
} from './api';

// CTA routing and intelligent recommendations
export {
  intelligentCTARouter,
  IntelligentCTARouter,
  generateCTAContent,
  validateCTAPlacement,
} from './cta-routing';

// Import for internal use
import { intelligentCTARouter } from './cta-routing';

// Analytics and tracking
export {
  trackCTAInteraction,
  syncOfflineAnalytics,
  initializeAnalytics,
  getCTAPerformanceMetrics,
  getABTestVariant,
} from './analytics';

// Error handling and fallback mechanisms
export {
  BlogErrorBoundary,
  BlogFallbackProvider,
  BlogRetryHandler,
  BlogCircuitBreaker,
  blogCircuitBreakers,
  safeBlogOperation,
  BlogHealthChecker,
} from './error-handling';

// Utility functions
export {
  getImageUrl,
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
  validateBlogPost,
  validateBlogPostPreview,
  sanitizeBlogPost,
  sanitizeBlogPostPreview,
  sanitizeCourse,
  sanitizeBlogCategory,
  calculateReadingTime,
  extractTextFromPortableText,
  generateSlug,
  formatDate,
  generateBlogBreadcrumbs,
  generateBlogPostStructuredData,
  generateCacheTags,
  isContentStale,
  measurePerformance,
} from './utils';

// Type exports
export type {
  BlogPost,
  BlogPostPreview,
  BlogCategory,
  Course,
  BlogAuthor,
  CTAPlacement,
  IntelligentCTARouting,
  SEOEnhancement,
  BlogListingData,
  BlogPostPageData,
  BlogSearchParams,
  BlogSearchResult,
  CTAInteraction,
  CTAPerformanceMetrics,
  BlogAPIResponse,
  PaginatedResponse,
  QueryOptions,
  BlogError,
  SanityDocument,
  SanityImage,
  CreateBlogPost,
  UpdateBlogPost,
  PartialBy,
  RequiredBy,
} from '../types/blog';

// Re-export Sanity client utilities for backward compatibility
export { client, urlFor, enhancedClient } from '../sanity/client';

// Enhanced wrapper functions for backward compatibility with existing code
import {
  getAllBlogPosts as apiGetAllBlogPosts,
  getBlogPostBySlug as apiGetBlogPostBySlug,
  getAllBlogCategories as apiGetAllBlogCategories,
  getAllCourses as apiGetAllCourses,
  getRelatedBlogPosts as apiGetRelatedBlogPosts,
  getAllBlogPostSlugs as apiGetAllBlogPostSlugs,
} from './api';

import {
  BlogFallbackProvider,
  safeBlogOperation,
  blogCircuitBreakers,
  BlogErrorBoundary,
} from './error-handling';

import { BlogPost, BlogPostPreview, Course, BlogCategory } from '../types/blog';

// Enhanced wrapper functions that maintain backward compatibility
export async function getAllBlogPostsCompat(options?: {
  useCache?: boolean;
  revalidate?: number;
  limit?: number;
  featured?: boolean;
  category?: string;
}): Promise<BlogPost[]> {
  return safeBlogOperation(
    async () => {
      const response = await apiGetAllBlogPosts({
        limit: options?.limit,
        featured: options?.featured,
        category: options?.category,
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 3600,
          tags: ['blog-posts'],
        } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch blog posts');
      }

      // Convert BlogPostPreview[] to BlogPost[] for backward compatibility
      return response.data.map(preview => ({
        ...preview,
        _type: 'post' as const,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '',
        body: [],
        ctaPlacements: [],
        difficulty: preview.difficulty || 'beginner',
        contentType: 'guide' as const,
        enableComments: true,
        enableSocialSharing: true,
        enableNewsletterSignup: true,
        viewCount: 0,
        shareCount: 0,
        engagementScore: 0,
        category: {
          ...preview.category,
          _id: 'category-' + preview.category.slug.current,
          _type: 'category' as const,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '',
          description: '',
        },
        author: {
          ...preview.author,
          _id: 'author-' + preview.author.slug.current,
          _type: 'author' as const,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '',
        },
        seoEnhancement: {
          seoTitle: preview.title,
          seoDescription: preview.excerpt,
          focusKeyword: '',
        },
      } as BlogPost));
    },
    {
      operationName: 'getAllBlogPostsCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchPosts,
      fallback: () => BlogFallbackProvider.getFallbackBlogPosts(options?.limit || 10).map(preview => ({
        ...preview,
        _type: 'post' as const,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _rev: '',
        body: [],
        ctaPlacements: [],
        difficulty: preview.difficulty || 'beginner',
        contentType: 'guide' as const,
        enableComments: true,
        enableSocialSharing: true,
        enableNewsletterSignup: true,
        viewCount: 0,
        shareCount: 0,
        engagementScore: 0,
        category: {
          ...preview.category,
          _id: 'category-' + preview.category.slug.current,
          _type: 'category' as const,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '',
          description: '',
        },
        author: {
          ...preview.author,
          _id: 'author-' + preview.author.slug.current,
          _type: 'author' as const,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          _rev: '',
        },
        seoEnhancement: {
          seoTitle: preview.title,
          seoDescription: preview.excerpt,
          focusKeyword: '',
        },
      } as BlogPost)),
      retryOptions: {
        maxRetries: 3,
        delay: 1000,
        shouldRetry: (error) => !error.message.includes('Invalid'),
      },
    }
  );
}

export async function getBlogPostBySlugCompat(slug: string, options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogPost | null> {
  const result = await safeBlogOperation(
    async () => {
      const response = await apiGetBlogPostBySlug(slug, {
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 3600,
          tags: [`blog-post-${slug}`],
        } : undefined,
      });

      if (!response.success) {
        if (response.error?.code === 'INVALID_SLUG') {
          return null;
        }
        throw new Error(response.error?.message || 'Failed to fetch blog post');
      }

      return response.data;
    },
    {
      operationName: 'getBlogPostBySlugCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchSinglePost,
      fallback: () => BlogFallbackProvider.getFallbackBlogPost(slug),
      retryOptions: {
        maxRetries: 2,
        delay: 500,
        shouldRetry: (error) => !error.message.includes('Invalid') && !error.message.includes('not found'),
      },
    }
  );
  
  return result || null;
}

export async function getAllBlogCategoriesCompat(options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogCategory[]> {
  return safeBlogOperation(
    async () => {
      const response = await apiGetAllBlogCategories({
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 7200, // 2 hours for categories
          tags: ['blog-categories'],
        } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch blog categories');
      }

      return response.data;
    },
    {
      operationName: 'getAllBlogCategoriesCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchCategories,
      fallback: () => BlogFallbackProvider.getFallbackCategories(),
      retryOptions: {
        maxRetries: 2,
        delay: 1000,
      },
    }
  );
}

export async function getAllCoursesCompat(options?: {
  useCache?: boolean;
  revalidate?: number;
  activeOnly?: boolean;
}): Promise<Course[]> {
  return safeBlogOperation(
    async () => {
      const response = await apiGetAllCourses({
        activeOnly: options?.activeOnly,
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 7200, // 2 hours for courses
          tags: ['courses'],
        } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch courses');
      }

      return response.data;
    },
    {
      operationName: 'getAllCoursesCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchCourses,
      fallback: () => BlogFallbackProvider.getFallbackCourses(),
      retryOptions: {
        maxRetries: 2,
        delay: 1000,
      },
    }
  );
}

export async function getRelatedBlogPostsCompat(
  currentPostId: string,
  categorySlug?: string,
  options?: {
    useCache?: boolean;
    revalidate?: number;
    limit?: number;
  }
): Promise<BlogPostPreview[]> {
  return safeBlogOperation(
    async () => {
      const response = await apiGetRelatedBlogPosts(currentPostId, categorySlug, {
        limit: options?.limit,
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 3600,
          tags: [`related-posts-${currentPostId}`],
        } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch related posts');
      }

      return response.data;
    },
    {
      operationName: 'getRelatedBlogPostsCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchPosts,
      fallback: () => BlogFallbackProvider.getFallbackBlogPosts(options?.limit || 3),
      retryOptions: {
        maxRetries: 2,
        delay: 500,
      },
    }
  );
}

export async function getAllBlogPostSlugsCompat(options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<Array<{ params: { slug: string } }>> {
  return safeBlogOperation(
    async () => {
      const response = await apiGetAllBlogPostSlugs({
        cache: options?.useCache ? {
          enabled: true,
          ttl: options.revalidate || 3600,
          tags: ['blog-slugs'],
        } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch blog post slugs');
      }

      return response.data;
    },
    {
      operationName: 'getAllBlogPostSlugsCompat',
      component: 'BlogAPI',
      circuitBreaker: blogCircuitBreakers.fetchPosts,
      fallback: () => [],
      retryOptions: {
        maxRetries: 2,
        delay: 500,
      },
    }
  );
}

// Enhanced intelligent CTA routing function
export async function getRecommendedCourseCompat(
  blogPost: BlogPost,
  allCourses?: Course[]
): Promise<Course | null> {
  return safeBlogOperation(
    async () => {
      return await intelligentCTARouter.getRecommendedCourse(blogPost, {
        fallbackToDefault: true,
        useCache: true,
        debugMode: process.env.NODE_ENV === 'development',
      });
    },
    {
      operationName: 'getRecommendedCourseCompat',
      component: 'CTARouting',
      circuitBreaker: blogCircuitBreakers.ctaRouting,
      fallback: () => BlogFallbackProvider.getFallbackCourse(),
      retryOptions: {
        maxRetries: 1,
        delay: 500,
      },
    }
  );
}

// Health check function for monitoring
export async function checkBlogSystemHealth(): Promise<{
  healthy: boolean;
  services: Record<string, any>;
  timestamp: string;
}> {
  try {
    const { BlogHealthChecker } = await import('./error-handling');
    const result = await BlogHealthChecker.performHealthCheck();
    return {
      healthy: result.overall,
      services: result.services,
      timestamp: result.timestamp,
    };
  } catch (error) {
    console.error('Error performing blog system health check:', error);
    return {
      healthy: false,
      services: {
        error: (error as Error).message,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Initialize blog system (useful for warming up caches, etc.)
export async function initializeBlogSystem(): Promise<void> {
  try {
    console.log('🚀 Initializing blog system...');
    
    // Warm up the intelligent CTA router cache
    await intelligentCTARouter.getCacheStatus();
    
    // Reset any error states
    BlogErrorBoundary.resetErrorCount();
    
    // Reset circuit breakers if needed
    Object.values(blogCircuitBreakers).forEach(breaker => {
      if (breaker.getState() === 'OPEN') {
        breaker.reset();
      }
    });
    
    console.log('✅ Blog system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize blog system:', error);
  }
}

// Export default object for convenience
export default {
  // API functions
  getAllBlogPosts: getAllBlogPostsCompat,
  getBlogPostBySlug: getBlogPostBySlugCompat,
  getAllBlogCategories: getAllBlogCategoriesCompat,
  getAllCourses: getAllCoursesCompat,
  getRelatedBlogPosts: getRelatedBlogPostsCompat,
  getAllBlogPostSlugs: getAllBlogPostSlugsCompat,
  getRecommendedCourse: getRecommendedCourseCompat,
  
  // Utility functions
  checkHealth: checkBlogSystemHealth,
  initialize: initializeBlogSystem,
  
  // Error handling
  ErrorBoundary: BlogErrorBoundary,
  FallbackProvider: BlogFallbackProvider,
  
  // CTA routing
  ctaRouter: intelligentCTARouter,
};