/**
 * Enhanced Sanity-Only Blog Client - Safe for browser use
 * This client fetches blog data exclusively from Sanity CMS via the new API endpoints
 * with comprehensive error handling, retry logic, and user feedback
 */

import { BlogPost, BlogPostPreview, BlogCategory, BlogAuthor } from '@/lib/types/blog';
import { ErrorInfo } from '@/components/shared/ErrorDisplay';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: any;
}

interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

// Enhanced client-side Sanity-only Blog API
export class SanityBlogClient {
  private static baseUrl = '/api/blog';
  private static defaultTimeout = 10000; // 10 seconds
  private static defaultRetries = 3;
  private static defaultRetryDelay = 1000; // 1 second

  /**
   * Enhanced fetch with timeout, retries, and proper error handling
   */
  private static async enhancedFetch<T>(
    url: string, 
    options: RequestInit & RequestOptions = {}
  ): Promise<{ data: T | null; error: ErrorInfo | null }> {
    const { 
      timeout = this.defaultTimeout, 
      retries = this.defaultRetries, 
      retryDelay = this.defaultRetryDelay,
      signal,
      ...fetchOptions 
    } = options;

    let lastError: ErrorInfo | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create timeout controller
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

        // Combine signals if provided
        const combinedSignal = signal ? 
          this.combineAbortSignals([signal, timeoutController.signal]) : 
          timeoutController.signal;

        const response = await fetch(url, {
          ...fetchOptions,
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          lastError = {
            type: response.status >= 500 ? 'server' : 
                  response.status === 404 ? 'server' :
                  response.status === 401 || response.status === 403 ? 'permission' :
                  'validation',
            message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            code: errorData.error?.code || `HTTP_${response.status}`,
            details: `URL: ${url}\nStatus: ${response.status}\nResponse: ${JSON.stringify(errorData, null, 2)}`,
            retryable: response.status >= 500 || response.status === 429,
            actionable: true
          };

          // Don't retry for client errors (4xx) except 429 (rate limit)
          if (response.status < 500 && response.status !== 429) {
            break;
          }
        } else {
          const data: ApiResponse<T> = await response.json();
          
          if (!data.success) {
            lastError = {
              type: 'server',
              message: data.error?.message || 'API request failed',
              code: data.error?.code || 'API_ERROR',
              details: `URL: ${url}\nResponse: ${JSON.stringify(data, null, 2)}`,
              retryable: true,
              actionable: true
            };
          } else {
            return { data: data.data || null, error: null };
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = {
              type: signal?.aborted ? 'unknown' : 'timeout',
              message: signal?.aborted ? 'Request was cancelled' : 'Request timed out',
              code: signal?.aborted ? 'REQUEST_CANCELLED' : 'TIMEOUT_ERROR',
              details: `URL: ${url}\nTimeout: ${timeout}ms\nAttempt: ${attempt + 1}/${retries + 1}`,
              retryable: !signal?.aborted,
              actionable: true
            };
          } else if (error.message.includes('fetch')) {
            lastError = {
              type: 'network',
              message: 'Network connection failed. Please check your internet connection.',
              code: 'NETWORK_ERROR',
              details: `URL: ${url}\nError: ${error.message}\nAttempt: ${attempt + 1}/${retries + 1}`,
              retryable: true,
              actionable: true
            };
          } else {
            lastError = {
              type: 'unknown',
              message: error.message || 'An unexpected error occurred',
              code: 'UNKNOWN_ERROR',
              details: `URL: ${url}\nError: ${error.message}\nStack: ${error.stack}\nAttempt: ${attempt + 1}/${retries + 1}`,
              retryable: true,
              actionable: true
            };
          }
        } else {
          lastError = {
            type: 'unknown',
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            details: `URL: ${url}\nError: ${JSON.stringify(error)}\nAttempt: ${attempt + 1}/${retries + 1}`,
            retryable: true,
            actionable: false
          };
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries && lastError?.retryable) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }

    return { data: null, error: lastError };
  }

  /**
   * Combine multiple AbortSignals
   */
  private static combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }
    
    return controller.signal;
  }

  static async getAllPostPreviews(options?: RequestOptions): Promise<BlogPostPreview[]> {
    const { data, error } = await this.enhancedFetch<BlogPostPreview[]>(`${this.baseUrl}/posts`, options);
    
    if (error) {
      console.error('Failed to fetch posts:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async getFeaturedPosts(options?: RequestOptions): Promise<BlogPostPreview[]> {
    const { data, error } = await this.enhancedFetch<BlogPostPreview[]>(`${this.baseUrl}/posts?featured=true`, options);
    
    if (error) {
      console.error('Failed to fetch featured posts:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async getPostBySlug(slug: string, options?: RequestOptions): Promise<BlogPost | null> {
    const { data, error } = await this.enhancedFetch<BlogPost>(`${this.baseUrl}/posts/${encodeURIComponent(slug)}`, options);
    
    if (error) {
      // Return null for 404 errors (post not found)
      if (error.code === 'HTTP_404') {
        return null;
      }
      console.error('Failed to fetch post by slug:', error);
      throw new Error(error.message);
    }
    
    return data || null;
  }

  static async getPostsByCategory(categorySlug: string, options?: RequestOptions): Promise<BlogPostPreview[]> {
    const { data, error } = await this.enhancedFetch<BlogPostPreview[]>(`${this.baseUrl}/posts?category=${encodeURIComponent(categorySlug)}`, options);
    
    if (error) {
      console.error('Failed to fetch category posts:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async getAllCategories(options?: RequestOptions): Promise<BlogCategory[]> {
    const { data, error } = await this.enhancedFetch<BlogCategory[]>(`${this.baseUrl}/categories`, options);
    
    if (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async getAllAuthors(options?: RequestOptions): Promise<BlogAuthor[]> {
    const { data, error } = await this.enhancedFetch<BlogAuthor[]>(`${this.baseUrl}/authors`, options);
    
    if (error) {
      console.error('Failed to fetch authors:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async getAllSlugs(options?: RequestOptions): Promise<string[]> {
    const { data, error } = await this.enhancedFetch<any[]>(`${this.baseUrl}/slugs`, options);
    
    if (error) {
      console.error('Failed to fetch slugs:', error);
      throw new Error(error.message);
    }
    
    return (data || []).map((item: any) => item.params?.slug || item.slug);
  }

  static async getRelatedPosts(currentPostId: string, limit: number = 3, options?: RequestOptions): Promise<BlogPostPreview[]> {
    const { data, error } = await this.enhancedFetch<BlogPostPreview[]>(`${this.baseUrl}/posts/${encodeURIComponent(currentPostId)}/related?limit=${limit}`, options);
    
    if (error) {
      console.error('Failed to fetch related posts:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  }

  static async searchPosts(query: string, options?: RequestOptions): Promise<BlogPostPreview[]> {
    try {
      // For now, get all posts and filter client-side
      // In the future, this could be enhanced with a dedicated search endpoint
      const posts = await this.getAllPostPreviews(options);
      const searchTerm = query.toLowerCase();
      return posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching posts:', error);
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  static async createPost(postData: {
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    category: string;
    author?: string;
    tags?: string[];
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  }, options?: RequestOptions): Promise<{ success: boolean; post?: any; error?: ErrorInfo }> {
    const { data, error } = await this.enhancedFetch<any>(`${this.baseUrl}/posts`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (error) {
      console.error('Failed to create post:', error);
      return { success: false, error };
    }

    return { success: true, post: data };
  }

  static async updatePost(id: string, updateData: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    author?: string;
    tags?: string[];
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  }, options?: RequestOptions): Promise<{ success: boolean; post?: any; error?: ErrorInfo }> {
    const { data, error } = await this.enhancedFetch<any>(`${this.baseUrl}/posts/id/${encodeURIComponent(id)}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (error) {
      console.error('Failed to update post:', error);
      return { success: false, error };
    }

    return { success: true, post: data };
  }

  static async deletePost(id: string, options?: RequestOptions): Promise<{ success: boolean; error?: ErrorInfo }> {
    const { data, error } = await this.enhancedFetch<any>(`${this.baseUrl}/posts/id/${encodeURIComponent(id)}`, {
      ...options,
      method: 'DELETE',
    });

    if (error) {
      console.error('Failed to delete post:', error);
      return { success: false, error };
    }

    return { success: true };
  }

  static async getHealthStatus(options?: RequestOptions): Promise<{
    healthy: boolean;
    source: string;
    total: number;
    timestamp: string;
    error?: ErrorInfo;
  }> {
    const { data, error } = await this.enhancedFetch<any>(`${this.baseUrl}/health`, options);
    
    if (error) {
      console.error('Health check failed:', error);
      return {
        healthy: false,
        source: 'sanity',
        total: 0,
        timestamp: new Date().toISOString(),
        error
      };
    }

    return {
      healthy: data?.data?.status === 'healthy' || false,
      source: 'sanity',
      total: data?.data?.metrics?.posts?.count || 0,
      timestamp: data?.data?.timestamp || new Date().toISOString()
    };
  }

  /**
   * Test connection to Sanity CMS with detailed diagnostics
   */
  static async testConnection(options?: RequestOptions): Promise<{
    connected: boolean;
    latency: number;
    error?: ErrorInfo;
    details?: any;
  }> {
    const startTime = Date.now();
    
    const { data, error } = await this.enhancedFetch<any>(`${this.baseUrl}/health`, {
      ...options,
      timeout: 5000, // Shorter timeout for connection test
    });
    
    const latency = Date.now() - startTime;

    if (error) {
      return {
        connected: false,
        latency,
        error,
        details: {
          timestamp: new Date().toISOString(),
          testDuration: latency
        }
      };
    }

    return {
      connected: true,
      latency,
      details: {
        status: data?.data?.status,
        sanityStatus: data?.data?.sanity?.status,
        timestamp: data?.data?.timestamp,
        testDuration: latency
      }
    };
  }
}
