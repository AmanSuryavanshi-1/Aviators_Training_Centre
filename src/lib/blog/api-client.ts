import { BlogAPIResponse, QueryOptions } from '../types/blog';
import { BlogRetryHandler, BlogCircuitBreaker, safeBlogOperation } from './error-handling';

// Enhanced API client with retry logic and exponential backoff
export class BlogAPIClient {
  private static instance: BlogAPIClient;
  private circuitBreaker: BlogCircuitBreaker;
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private constructor() {
    this.circuitBreaker = new BlogCircuitBreaker(5, 60000, 2);
  }

  static getInstance(): BlogAPIClient {
    if (!BlogAPIClient.instance) {
      BlogAPIClient.instance = new BlogAPIClient();
    }
    return BlogAPIClient.instance;
  }

  // Enhanced fetch with retry logic and caching
  async fetchWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      cacheKey?: string;
      cacheTTL?: number;
      maxRetries?: number;
      retryDelay?: number;
      shouldRetry?: (error: Error) => boolean;
    }
  ): Promise<BlogAPIResponse<T>> {
    const {
      operationName,
      cacheKey,
      cacheTTL = 300000, // 5 minutes default
      maxRetries = 3,
      retryDelay = 1000,
      shouldRetry = (error: Error) => this.isRetryableError(error),
    } = options;

    // Check cache first
    if (cacheKey && this.isCacheValid(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      return {
        success: true,
        data: cached.data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: true,
        },
      };
    }

    try {
      const result = await safeBlogOperation(
        () => BlogRetryHandler.withRetry(operation, {
          maxRetries,
          delay: retryDelay,
          shouldRetry,
          onRetry: (attempt, error) => {
            console.warn(`Retrying ${operationName} (attempt ${attempt}):`, error.message);
          },
        }),
        {
          operationName,
          component: 'BlogAPIClient',
          circuitBreaker: this.circuitBreaker,
        }
      );

      // Cache successful results
      if (cacheKey && result) {
        this.requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTTL,
        });
      }

      return {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: this.getErrorCode(error),
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
  }

  // Check if error is retryable
  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
    ];

    const errorMessage = error.message.toLowerCase();
    
    // Network errors
    if (retryableErrors.some(code => errorMessage.includes(code.toLowerCase()))) {
      return true;
    }

    // HTTP status codes that are retryable
    if (error.message.includes('500') || error.message.includes('502') || 
        error.message.includes('503') || error.message.includes('504')) {
      return true;
    }

    // Rate limiting
    if (error.message.includes('429')) {
      return true;
    }

    return false;
  }

  // Get error code from error
  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('404')) return 'NOT_FOUND';
      if (error.message.includes('403')) return 'FORBIDDEN';
      if (error.message.includes('401')) return 'UNAUTHORIZED';
      if (error.message.includes('429')) return 'RATE_LIMITED';
      if (error.message.includes('500')) return 'SERVER_ERROR';
      if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
      if (error.message.includes('network')) return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  // Check if cached data is still valid
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.requestCache.get(cacheKey);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < cached.ttl;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.requestCache.keys()) {
        if (key.includes(pattern)) {
          this.requestCache.delete(key);
        }
      }
    } else {
      this.requestCache.clear();
    }
  }

  // Get cache stats
  getCacheStats(): {
    size: number;
    keys: string[];
    hitRate: number;
  } {
    return {
      size: this.requestCache.size,
      keys: Array.from(this.requestCache.keys()),
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    };
  }

  // Health check
  async healthCheck(): Promise<{
    healthy: boolean;
    circuitBreakerState: string;
    cacheSize: number;
    lastError?: string;
  }> {
    try {
      // Simple health check operation
      await this.fetchWithRetry(
        () => Promise.resolve('ok'),
        {
          operationName: 'health_check',
          maxRetries: 1,
        }
      );

      return {
        healthy: true,
        circuitBreakerState: this.circuitBreaker.getState(),
        cacheSize: this.requestCache.size,
      };
    } catch (error) {
      return {
        healthy: false,
        circuitBreakerState: this.circuitBreaker.getState(),
        cacheSize: this.requestCache.size,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
export const blogAPIClient = BlogAPIClient.getInstance();

// Enhanced fetch function with automatic retry and error handling
export async function enhancedFetch<T>(
  url: string,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await BlogRetryHandler.withRetry(
      async () => {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        return res;
      },
      {
        maxRetries: retries,
        delay: retryDelay,
        shouldRetry: (error: Error) => {
          // Don't retry client errors (4xx)
          if (error.message.includes('4')) {
            return false;
          }
          return true;
        },
      }
    );

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

// Batch request handler for multiple API calls
export class BatchRequestHandler {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private processing = false;
  private batchSize = 5;
  private batchDelay = 100; // ms

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9);
      this.queue.push({ id, operation, resolve, reject });
      
      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      // Process batch concurrently
      const promises = batch.map(async (item) => {
        try {
          const result = await item.operation();
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      });
      
      await Promise.allSettled(promises);
      
      // Small delay between batches to prevent overwhelming the server
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }
    
    this.processing = false;
  }
}

// Global batch handler instance
export const batchRequestHandler = new BatchRequestHandler();
