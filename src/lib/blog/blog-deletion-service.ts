/**
 * Enhanced Blog Deletion Service
 * 
 * Provides robust blog post deletion with comprehensive error handling,
 * retry logic, validation, and detailed feedback.
 */

import { BlogAPIResponse, BlogPost, BlogError } from '@/lib/types/blog';
import { sanityBlogService } from './sanity-blog-service';
// Cache invalidation will be handled by enhanced cache service
import { enhancedDeletionClient } from './enhanced-deletion-client';
import { enhancedCacheInvalidationService } from '@/lib/cache/enhanced-cache-invalidation';
import { deletionAuditLogger } from './deletion-audit-logger';
import { offlineDeletionQueue } from './offline-deletion-queue';
import { unifiedBlogService } from './unified-blog-service';

// Deletion-specific types
export interface DeletionOptions {
  retryAttempts?: number;
  retryDelay?: number;
  skipCacheInvalidation?: boolean;
  confirmationRequired?: boolean;
  validateBeforeDelete?: boolean;
}

export interface DeletionResult {
  success: boolean;
  postId?: string;
  slug?: string;
  title?: string;
  error?: DeletionError;
  retryable?: boolean;
  cacheInvalidated?: boolean;
  timestamp: string;
  retryCount?: number;
  validationPassed?: boolean;
}

export interface BulkDeletionOptions extends DeletionOptions {
  continueOnError?: boolean;
  maxConcurrent?: number;
}

export interface BulkDeletionResult {
  success: boolean;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: DeletionResult[];
  timestamp: string;
}

export interface ValidationResult {
  valid: boolean;
  postExists: boolean;
  hasPermission: boolean;
  canDelete: boolean;
  warnings: string[];
  errors: string[];
  postData?: BlogPost;
}

export interface DeletionError {
  code: string;
  message: string;
  category: 'network' | 'permission' | 'validation' | 'server' | 'unknown';
  retryable: boolean;
  suggestedAction?: string;
  originalError?: any;
}

// Error recovery strategies
interface ErrorRecoveryStrategy {
  errorType: string;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  userNotification: boolean;
  queueForLater: boolean;
}

const RECOVERY_STRATEGIES: Record<string, ErrorRecoveryStrategy> = {
  'NETWORK_ERROR': {
    errorType: 'network',
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    userNotification: true,
    queueForLater: true
  },
  'PERMISSION_ERROR': {
    errorType: 'permission',
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    userNotification: true,
    queueForLater: false
  },
  'VALIDATION_ERROR': {
    errorType: 'validation',
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    userNotification: true,
    queueForLater: false
  },
  'SERVER_ERROR': {
    errorType: 'server',
    maxRetries: 2,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
    userNotification: true,
    queueForLater: false
  },
  'SANITY_ERROR': {
    errorType: 'server',
    maxRetries: 3,
    retryDelay: 1500,
    backoffMultiplier: 2,
    userNotification: true,
    queueForLater: true
  }
};

export class BlogDeletionService {
  private static instance: BlogDeletionService;
  private deletionQueue: Map<string, DeletionResult> = new Map();
  private activeOperations: Set<string> = new Set();

  private constructor() {}

  static getInstance(): BlogDeletionService {
    if (!BlogDeletionService.instance) {
      BlogDeletionService.instance = new BlogDeletionService();
    }
    return BlogDeletionService.instance;
  }

  /**
   * Delete a single blog post with comprehensive error handling
   */
  async deletePost(
    identifier: string, 
    options: DeletionOptions = {}
  ): Promise<DeletionResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Prevent duplicate operations
    if (this.activeOperations.has(identifier)) {
      return {
        success: false,
        error: {
          code: 'OPERATION_IN_PROGRESS',
          message: 'Deletion operation already in progress for this post',
          category: 'validation',
          retryable: false,
          suggestedAction: 'Wait for the current operation to complete'
        },
        timestamp,
        retryable: false
      };
    }

    this.activeOperations.add(identifier);

    try {
      // Set default options
      const finalOptions: Required<DeletionOptions> = {
        retryAttempts: 3,
        retryDelay: 1000,
        skipCacheInvalidation: false,
        confirmationRequired: false,
        validateBeforeDelete: true,
        ...options
      };

      // Pre-deletion validation
      let validationResult: ValidationResult | null = null;
      if (finalOptions.validateBeforeDelete) {
        validationResult = await this.validateDeletion(identifier);
        if (!validationResult.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: `Validation failed: ${validationResult.errors.join(', ')}`,
              category: 'validation',
              retryable: false,
              suggestedAction: 'Fix validation errors before retrying'
            },
            timestamp,
            retryable: false,
            validationPassed: false
          };
        }
      }

      // Log deletion initiation
      const auditEventId = await deletionAuditLogger.logDeletionInitiated(
        validationResult?.postData?._id || identifier,
        validationResult?.postData?.title || 'Unknown Post',
        validationResult?.postData?.slug?.current || identifier,
        {
          userId: 'system', // In a real app, get from auth context
          requestId: `del_${Date.now()}`
        }
      );

      // Attempt deletion with retry logic
      const result = await this.attemptDeletionWithRetry(
        identifier,
        finalOptions,
        validationResult?.postData,
        auditEventId
      );

      // Log final result
      if (result.success) {
        await deletionAuditLogger.logDeletionSuccess(
          auditEventId,
          result.postId || identifier,
          Date.now() - startTime,
          result.cacheInvalidated,
          {
            userId: 'system',
            requestId: `del_${Date.now()}`
          }
        );
      } else if (result.error) {
        await deletionAuditLogger.logDeletionFailure(
          auditEventId,
          validationResult?.postData?._id || identifier,
          {
            code: result.error.code,
            message: result.error.message,
            category: result.error.category,
            retryable: result.error.retryable
          },
          result.retryCount,
          {
            userId: 'system',
            requestId: `del_${Date.now()}`
          }
        );
      }

      return {
        ...result,
        timestamp,
        validationPassed: validationResult?.valid ?? true
      };

    } catch (error) {
      console.error('Unexpected error in deletePost:', error);
      const categorizedError = this.categorizeError(error);
      
      // Queue for offline processing if it's a network error
      if (categorizedError.category === 'network' && categorizedError.retryable) {
        try {
          const queueId = await offlineDeletionQueue.queueDeletion(
            identifier,
            finalOptions,
            {
              postTitle: validationResult?.postData?.title,
              postSlug: validationResult?.postData?.slug?.current,
              userId: 'system',
              priority: 'normal',
              reason: 'Network error during deletion'
            }
          );
          
          console.log('📥 Deletion queued due to network error:', {
            identifier,
            queueId,
            error: categorizedError.message
          });
          
          return {
            success: false,
            error: {
              ...categorizedError,
              message: `Network error - deletion queued for retry (Queue ID: ${queueId})`,
              suggestedAction: 'The deletion will be automatically retried when connectivity is restored'
            },
            timestamp,
            retryable: true
          };
        } catch (queueError) {
          console.error('Failed to queue deletion:', queueError);
        }
      }
      
      return {
        success: false,
        error: categorizedError,
        timestamp,
        retryable: false
      };
    } finally {
      this.activeOperations.delete(identifier);
    }
  }

  /**
   * Validate deletion prerequisites
   */
  async validateDeletion(identifier: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: false,
      postExists: false,
      hasPermission: true, // Assume permission for now
      canDelete: false,
      warnings: [],
      errors: []
    };

    try {
      // Check if identifier is valid
      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        result.errors.push('Invalid post identifier provided');
        return result;
      }

      // Determine if identifier is ID or slug
      const isId = identifier.includes('_') || identifier.length > 20;
      let postResponse: BlogAPIResponse<BlogPost>;

      if (isId) {
        postResponse = await sanityBlogService.getPostById(identifier);
      } else {
        postResponse = await sanityBlogService.getPostBySlug(identifier);
      }

      if (!postResponse.success || !postResponse.data) {
        // Instead of treating this as a hard error, add a warning
        // The post might exist but with a different identifier format
        result.warnings.push('Post not found during validation - will attempt deletion anyway');
        result.postExists = false;
        // Still mark as valid to allow deletion attempt
        result.valid = true;
        result.canDelete = true;
        return result;
      }

      result.postExists = true;
      result.postData = postResponse.data;

      // Check if post is featured (warning)
      if (postResponse.data.featured) {
        result.warnings.push('This is a featured post - deletion will affect homepage display');
      }

      // Check if post has high engagement (mock check)
      // In a real implementation, you'd check analytics data
      if (postResponse.data.views && postResponse.data.views > 1000) {
        result.warnings.push('This post has high engagement - consider archiving instead');
      }

      result.canDelete = true;
      result.valid = result.errors.length === 0;

      return result;

    } catch (error) {
      console.error('Error validating deletion:', error);
      result.errors.push('Failed to validate deletion prerequisites');
      return result;
    }
  }

  /**
   * Attempt deletion with retry logic
   */
  private async attemptDeletionWithRetry(
    identifier: string,
    options: Required<DeletionOptions>,
    postData?: BlogPost,
    auditEventId?: string
  ): Promise<DeletionResult> {
    let lastError: DeletionError | null = null;
    let retryCount = 0;

    for (let attempt = 0; attempt <= options.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          // Log retry attempt
          if (auditEventId && lastError) {
            await deletionAuditLogger.logDeletionRetry(
              auditEventId,
              postData?._id || identifier,
              attempt,
              {
                code: lastError.code,
                message: lastError.message,
                category: lastError.category
              },
              {
                userId: 'system',
                requestId: `del_retry_${Date.now()}`
              }
            );
          }

          // Wait before retry with exponential backoff
          const delay = options.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          retryCount = attempt;
        }

        const result = await this.performDeletion(identifier, options, postData);
        
        if (result.success) {
          return {
            ...result,
            retryCount
          };
        }

        lastError = result.error!;

        // Check if error is retryable
        if (!result.retryable || attempt >= options.retryAttempts) {
          break;
        }

      } catch (error) {
        lastError = this.categorizeError(error);
        if (!lastError.retryable || attempt >= options.retryAttempts) {
          break;
        }
      }
    }

    return {
      success: false,
      error: lastError!,
      retryable: false,
      timestamp: new Date().toISOString(),
      retryCount
    };
  }

  /**
   * Perform the actual deletion operation
   */
  private async performDeletion(
    identifier: string,
    options: Required<DeletionOptions>,
    postData?: BlogPost
  ): Promise<DeletionResult> {
    try {
      // Get post data if not provided
      if (!postData) {
        const isId = identifier.includes('_') || identifier.length > 20;
        const postResponse = isId 
          ? await sanityBlogService.getPostById(identifier)
          : await sanityBlogService.getPostBySlug(identifier);

        if (!postResponse.success || !postResponse.data) {
          // Try to find the post by querying Sanity directly with different approaches
          console.log(`Post not found with identifier '${identifier}', attempting direct deletion...`);
          
          // For slugs, we'll try to query Sanity to find the actual document ID
          if (!isId) {
            try {
              // Import enhancedClient directly for querying
              const { enhancedClient } = await import('@/lib/sanity/client');
              
              // Try multiple query approaches to find the post
              const queries = [
                `*[_type == "post" && slug.current == "${identifier}"][0]._id`,
                `*[_type == "post" && slug.current match "*${identifier}*"][0]._id`,
                `*[_type == "post" && title match "*${identifier}*"][0]._id`
              ];
              
              for (const query of queries) {
                try {
                  const documentId = await enhancedClient.fetch<string>(query);
                  if (documentId) {
                    console.log(`Found document ID '${documentId}' for slug '${identifier}'`);
                    // Recursively call performDeletion with the found ID
                    return this.performDeletion(documentId, options, undefined);
                  }
                } catch (queryError) {
                  console.log(`Query failed: ${query}`);
                }
              }
            } catch (importError) {
              console.error('Failed to import enhanced client:', importError);
            }
          }
          
          // If we still can't find it, return not found error
          return {
            success: false,
            error: {
              code: 'POST_NOT_FOUND',
              message: `Post not found with identifier '${identifier}'`,
              category: 'validation',
              retryable: false,
              suggestedAction: 'Verify the post identifier is correct or check if it has already been deleted'
            },
            timestamp: new Date().toISOString(),
            retryable: false
          };
        }
        postData = postResponse.data;
      }

      // Only perform environment checks on server side
      if (typeof window === 'undefined') {
        console.log('🔍 Environment check before deletion:', {
          hasToken: !!process.env.SANITY_API_TOKEN,
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET
        });
      } else {
        throw new Error('Blog deletion service must be used on the server side. Use API endpoints from client components.');
      }

      // Perform deletion using enhanced deletion client
      const deleteResult = await enhancedDeletionClient.deleteDocument(postData._id, {
        retryAttempts: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        validateConnection: false, // We already validated
        enableCircuitBreaker: true,
        timeout: 30000
      });

      if (!deleteResult.success) {
        return {
          success: false,
          postId: postData._id,
          slug: postData.slug?.current,
          title: postData.title,
          error: deleteResult.error || {
            code: 'DELETE_FAILED',
            message: 'Failed to delete post',
            category: 'server',
            retryable: true,
            suggestedAction: 'Try again or contact support if the issue persists'
          },
          timestamp: new Date().toISOString(),
          retryable: deleteResult.error?.retryable ?? true
        };
      }

      // Handle enhanced cache invalidation with verification
      let cacheInvalidated = false;
      if (!options.skipCacheInvalidation) {
        try {
          console.log('🔄 Starting enhanced cache invalidation...');
          const cacheResult = await enhancedCacheInvalidationService.invalidatePostDeletionCache(
            postData._id,
            postData.slug?.current,
            postData.category?.slug?.current,
            {
              verify: true,
              retryAttempts: 3,
              retryDelay: 1000
            }
          );

          cacheInvalidated = cacheResult.success;
          
          if (cacheResult.success) {
            console.log('✅ Enhanced cache invalidation successful:', {
              tags: cacheResult.invalidatedTags.length,
              paths: cacheResult.invalidatedPaths.length,
              verified: cacheResult.verification?.success,
              duration: cacheResult.duration
            });
          } else {
            console.warn('⚠️ Enhanced cache invalidation failed:', cacheResult.error);
            
            // Log fallback cache invalidation failure
            console.error('❌ Enhanced cache invalidation failed, no fallback available');
          }
        } catch (cacheError) {
          console.warn('Cache invalidation failed:', cacheError);
          // Don't fail the deletion if cache invalidation fails
        }
      }

      // Clear unified blog service cache after successful deletion
      try {
        unifiedBlogService.clearCacheForPost(postData._id);
      } catch (cacheError) {
        console.warn('Failed to clear unified blog service cache:', cacheError);
      }

      return {
        success: true,
        postId: postData._id,
        slug: postData.slug?.current,
        title: postData.title,
        cacheInvalidated,
        timestamp: new Date().toISOString(),
        retryable: false
      };

    } catch (error) {
      return {
        success: false,
        error: this.categorizeError(error),
        timestamp: new Date().toISOString(),
        retryable: this.categorizeError(error).retryable
      };
    }
  }

  /**
   * Categorize errors for appropriate handling
   */
  private categorizeError(error: any): DeletionError {
    if (!error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        category: 'unknown',
        retryable: false
      };
    }

    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || 
        error.message?.includes('network') || error.message?.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        category: 'network',
        retryable: true,
        suggestedAction: 'Check your internet connection and try again',
        originalError: error
      };
    }

    // Permission errors
    if (error.statusCode === 401 || error.statusCode === 403 || 
        error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'Insufficient permissions to delete this post',
        category: 'permission',
        retryable: false,
        suggestedAction: 'Contact an administrator to verify your permissions',
        originalError: error
      };
    }

    // Validation errors
    if (error.statusCode === 400 || error.message?.includes('validation') || 
        error.message?.includes('invalid')) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Validation failed',
        category: 'validation',
        retryable: false,
        suggestedAction: 'Check the post data and try again',
        originalError: error
      };
    }

    // Server errors
    if (error.statusCode >= 500 || error.message?.includes('server')) {
      return {
        code: 'SERVER_ERROR',
        message: 'Server error occurred',
        category: 'server',
        retryable: true,
        suggestedAction: 'Try again in a few moments',
        originalError: error
      };
    }

    // Sanity-specific errors
    if (error.message?.includes('sanity') || error.message?.includes('document')) {
      return {
        code: 'SANITY_ERROR',
        message: error.message || 'Sanity CMS error',
        category: 'server',
        retryable: true,
        suggestedAction: 'Try again or check Sanity CMS status',
        originalError: error
      };
    }

    // Default unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      category: 'unknown',
      retryable: false,
      suggestedAction: 'Contact support if the issue persists',
      originalError: error
    };
  }

  /**
   * Bulk delete multiple posts
   */
  async bulkDeletePosts(
    identifiers: string[], 
    options: BulkDeletionOptions = {}
  ): Promise<BulkDeletionResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    const finalOptions: Required<BulkDeletionOptions> = {
      retryAttempts: 3,
      retryDelay: 1000,
      skipCacheInvalidation: false,
      confirmationRequired: false,
      validateBeforeDelete: true,
      continueOnError: true,
      maxConcurrent: 5,
      ...options
    };

    const results: DeletionResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Process in batches to avoid overwhelming the system
    const batches = this.createBatches(identifiers, finalOptions.maxConcurrent);

    for (const batch of batches) {
      const batchPromises = batch.map(identifier => 
        this.deletePost(identifier, finalOptions)
      );

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        results.push(result);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (!finalOptions.continueOnError) {
            // Stop processing if continueOnError is false
            break;
          }
        }
      }

      if (!finalOptions.continueOnError && failureCount > 0) {
        break;
      }
    }

    return {
      success: failureCount === 0,
      totalRequested: identifiers.length,
      successCount,
      failureCount,
      results,
      timestamp
    };
  }

  /**
   * Retry a failed deletion
   */
  async retryFailedDeletion(identifier: string): Promise<DeletionResult> {
    // Remove from queue if it exists
    this.deletionQueue.delete(identifier);
    
    // Retry with default options
    return this.deletePost(identifier, {
      retryAttempts: 3,
      validateBeforeDelete: true
    });
  }

  /**
   * Get queued deletions
   */
  getQueuedDeletions(): DeletionResult[] {
    return Array.from(this.deletionQueue.values());
  }

  /**
   * Clear deletion queue
   */
  clearQueue(): void {
    this.deletionQueue.clear();
  }

  /**
   * Get offline deletion queue statistics
   */
  getOfflineQueueStats() {
    return offlineDeletionQueue.getQueueStats();
  }

  /**
   * Get all queued offline deletions
   */
  getOfflineQueuedDeletions() {
    return offlineDeletionQueue.getAllQueuedDeletions();
  }

  /**
   * Process offline deletion queue manually
   */
  async processOfflineQueue() {
    return await offlineDeletionQueue.processQueue();
  }

  /**
   * Remove a specific deletion from offline queue
   */
  removeFromOfflineQueue(queueId: string): boolean {
    return offlineDeletionQueue.removeDeletion(queueId);
  }

  /**
   * Clear failed deletions from offline queue
   */
  clearFailedOfflineDeletions(): number {
    return offlineDeletionQueue.clearFailedDeletions();
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private generateRequestId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Export singleton instance
export const blogDeletionService = BlogDeletionService.getInstance();
