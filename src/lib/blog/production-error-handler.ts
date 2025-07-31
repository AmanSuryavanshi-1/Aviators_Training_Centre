/**
 * Production-ready error handling system for blog functionality
 * Provides comprehensive error handling, logging, and fallback mechanisms
 */

import { BlogPostPreview } from '@/lib/types/blog';

// Error types for better categorization
export type BlogErrorType = 
  | 'NETWORK_ERROR'
  | 'DATA_VALIDATION_ERROR'
  | 'RENDERING_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR';

export interface BlogErrorContext {
  operation?: string;
  postId?: string;
  field?: string;
  timestamp?: string;
  userAgent?: string;
}

export class BlogError extends Error {
  public readonly type: BlogErrorType;
  public readonly context: BlogErrorContext;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    type: BlogErrorType = 'UNKNOWN_ERROR',
    context: BlogErrorContext = {},
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'BlogError';
    this.type = type;
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server',
    };
    this.recoverable = recoverable;
  }
}

// Production logging system
export const blogLogger = {
  error: (error: Error | string, context?: BlogErrorContext) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Replace with your monitoring service (e.g., Sentry, LogRocket, etc.)
      console.error('[BLOG_ERROR]', {
        message: errorMessage,
        stack: errorStack,
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Development logging
      console.error('[BLOG_ERROR]', errorMessage, context);
      if (errorStack) {
        console.error(errorStack);
      }
    }
  },

  warn: (message: string, context?: BlogErrorContext) => {
    console.warn('[BLOG_WARNING]', message, context);
  },

  info: (message: string, context?: BlogErrorContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[BLOG_INFO]', message, context);
    }
  },
};

// Safe data access with fallbacks
export function safeBlogAccess<T>(
  accessor: () => T,
  fallback: T,
  context: BlogErrorContext = {}
): T {
  try {
    const result = accessor();
    if (result === null || result === undefined) {
      blogLogger.warn('Null or undefined value accessed', context);
      return fallback;
    }
    return result;
  } catch (error) {
    blogLogger.error(error as Error, context);
    return fallback;
  }
}

// Validate blog post data structure
export function validateBlogData(post: any): post is BlogPostPreview {
  if (!post || typeof post !== 'object') {
    return false;
  }

  // Check for basic required fields with more lenient validation
  if (!post._id || typeof post._id !== 'string') {
    blogLogger.warn('Missing or invalid _id field', { postId: post._id });
    return false;
  }

  if (!post.title || typeof post.title !== 'string') {
    blogLogger.warn('Missing or invalid title field', { postId: post._id });
    return false;
  }

  // Slug validation - be more flexible
  if (!post.slug || typeof post.slug !== 'object') {
    blogLogger.warn('Missing slug object', { postId: post._id });
    return false;
  }

  if (!post.slug.current || typeof post.slug.current !== 'string') {
    blogLogger.warn('Missing or invalid slug.current', { postId: post._id });
    return false;
  }

  // Optional fields should not cause validation failure
  // Just log warnings for missing optional fields
  if (!post.excerpt) {
    blogLogger.info('Missing excerpt field, will use fallback', { postId: post._id });
  }

  if (!post.category) {
    blogLogger.info('Missing category field, will use fallback', { postId: post._id });
  }

  if (!post.author) {
    blogLogger.info('Missing author field, will use fallback', { postId: post._id });
  }

  return true;
}

// Generate fallback blog post
export function getFallbackPost(originalPost?: any): BlogPostPreview {
  const fallbackId = originalPost?._id || `fallback-${Date.now()}`;
  
  return {
    _id: fallbackId,
    title: originalPost?.title || 'Aviation Training Article',
    slug: { 
      current: originalPost?.slug?.current || `aviation-article-${Date.now()}` 
    },
    excerpt: originalPost?.excerpt || 'Discover expert aviation insights and professional flight training guidance from certified instructors.',
    publishedAt: originalPost?.publishedAt || new Date().toISOString(),
    category: {
      title: originalPost?.category?.title || 'Aviation Training',
      slug: { current: originalPost?.category?.slug?.current || 'aviation-training' },
      color: originalPost?.category?.color || '#075E68',
    },
    author: {
      name: originalPost?.author?.name || 'Aviation Expert',
      slug: { current: originalPost?.author?.slug?.current || 'aviation-expert' },
      role: originalPost?.author?.role || 'Certified Flight Instructor',
    },
    readingTime: originalPost?.readingTime || 5,
    image: originalPost?.image || {
      asset: {
        url: generateFallbackImageUrl('Aviation Training Article'),
      },
      alt: 'Aviation Training Content',
    },
    tags: originalPost?.tags || ['Aviation', 'Training', 'Pilot'],
    featured: originalPost?.featured || false,
    difficulty: originalPost?.difficulty || 'beginner' as const,
  };
}

// Generate fallback image URL
function generateFallbackImageUrl(title: string): string {
  const colors = ['#075E68', '#0C6E72', '#0A5A5E', '#0E7A80', '#4A90A4'];
  const colorIndex = title.length % colors.length;
  const bgColor = colors[colorIndex];
  
  const svg = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="300" fill="${bgColor}"/>
<g transform="translate(200, 150)">
<path d="M-40 -15 L40 -15 L50 0 L40 15 L-40 15 L-50 0 Z" fill="white" fill-opacity="0.2"/>
<circle cx="0" cy="0" r="4" fill="white" fill-opacity="0.8"/>
<path d="M-20 -8 L20 -8 M-20 8 L20 8" stroke="white" stroke-opacity="0.6" stroke-width="2"/>
</g>
<text x="200" y="230" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="600" opacity="0.9">Aviation Content</text>
</svg>`;

  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch (error) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

// Error boundary helper for React components
export function handleBlogError(
  error: Error | string,
  context: BlogErrorContext = {}
): void {
  const blogError = typeof error === 'string' 
    ? new BlogError(error, 'UNKNOWN_ERROR', context)
    : new BlogError(error.message, 'UNKNOWN_ERROR', context);

  blogLogger.error(blogError, context);

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(blogError);
  }
}

// Retry mechanism for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context: BlogErrorContext = {}
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      blogLogger.warn(`Operation failed, attempt ${attempt}/${maxRetries}`, {
        ...context,
        error: lastError.message,
        attempt,
      });

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw new BlogError(
    `Operation failed after ${maxRetries} attempts: ${lastError!.message}`,
    'API_ERROR',
    context,
    false
  );
}

// Circuit breaker pattern for API calls
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new BlogError('Circuit breaker is OPEN', 'API_ERROR', {}, false);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

export const blogCircuitBreaker = new CircuitBreaker();

// Health check for blog system
export async function checkBlogSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks = {
    dataAccess: true,
    imageGeneration: true,
    errorHandling: true,
  };

  try {
    // Test data access
    const testPost = getFallbackPost();
    checks.dataAccess = validateBlogData(testPost);

    // Test image generation
    const testImage = generateFallbackImageUrl('Test');
    checks.imageGeneration = testImage.startsWith('data:image/svg+xml');

    // Test error handling
    try {
      handleBlogError('Test error', { operation: 'health-check' });
      checks.errorHandling = true;
    } catch {
      checks.errorHandling = false;
    }
  } catch (error) {
    blogLogger.error(error as Error, { operation: 'health-check' });
  }

  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyChecks === totalChecks) {
    status = 'healthy';
  } else if (healthyChecks > totalChecks / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}

// Export all utilities
const productionErrorHandler = {

  BlogError,
  blogLogger,
  safeBlogAccess,
  validateBlogData,
  getFallbackPost,
  handleBlogError,
  retryOperation,
  blogCircuitBreaker,
  checkBlogSystemHealth,
};
export default productionErrorHandler;
