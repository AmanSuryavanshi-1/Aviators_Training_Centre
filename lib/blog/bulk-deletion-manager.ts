/**
 * Bulk Deletion Manager
 * 
 * Manages multiple post deletions with progress tracking,
 * error handling, and batch processing capabilities.
 */

import { blogDeletionService, DeletionResult, BulkDeletionOptions } from './blog-deletion-service';
import { deletionAuditLogger } from './deletion-audit-logger';

export interface BulkDeletionProgress {
  id: string;
  totalPosts: number;
  processedPosts: number;
  successfulDeletions: number;
  failedDeletions: number;
  currentPost?: {
    id: string;
    title: string;
    slug: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  startTime: string;
  endTime?: string;
  estimatedTimeRemaining?: number;
  errors: Array<{
    postId: string;
    error: string;
    retryable: boolean;
  }>;
  results: DeletionResult[];
}

export interface BulkDeletionRequest {
  identifiers: string[];
  options?: BulkDeletionOptions;
  userId?: string;
  requestId?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface BulkDeletionStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalPostsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
}

/**
 * Bulk deletion manager with progress tracking
 */
export class BulkDeletionManager {
  private static instance: BulkDeletionManager;
  private activeOperations: Map<string, BulkDeletionProgress> = new Map();
  private operationHistory: Map<string, BulkDeletionProgress> = new Map();
  private maxConcurrentOperations = 3;
  private maxHistorySize = 100;

  private constructor() {
    // Cleanup old operations every hour
    setInterval(() => this.cleanupOldOperations(), 60 * 60 * 1000);
  }

  static getInstance(): BulkDeletionManager {
    if (!BulkDeletionManager.instance) {
      BulkDeletionManager.instance = new BulkDeletionManager();
    }
    return BulkDeletionManager.instance;
  }

  /**
   * Start a bulk deletion operation
   */
  async startBulkDeletion(request: BulkDeletionRequest): Promise<string> {
    // Check concurrent operation limit
    if (this.activeOperations.size >= this.maxConcurrentOperations) {
      throw new Error(`Maximum concurrent operations (${this.maxConcurrentOperations}) reached. Please wait for existing operations to complete.`);
    }

    const operationId = request.requestId || this.generateOperationId();
    const startTime = new Date().toISOString();

    // Initialize progress tracking
    const progress: BulkDeletionProgress = {
      id: operationId,
      totalPosts: request.identifiers.length,
      processedPosts: 0,
      successfulDeletions: 0,
      failedDeletions: 0,
      status: 'pending',
      startTime,
      errors: [],
      results: []
    };

    this.activeOperations.set(operationId, progress);

    // Start processing asynchronously
    this.processBulkDeletion(operationId, request).catch(error => {
      console.error(`Bulk deletion operation ${operationId} failed:`, error);
      progress.status = 'failed';
      progress.endTime = new Date().toISOString();
    });

    console.log(`🚀 Started bulk deletion operation ${operationId} for ${request.identifiers.length} posts`);
    return operationId;
  }

  /**
   * Get progress for a specific operation
   */
  getProgress(operationId: string): BulkDeletionProgress | null {
    return this.activeOperations.get(operationId) || this.operationHistory.get(operationId) || null;
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): BulkDeletionProgress[] {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Get operation history
   */
  getOperationHistory(limit: number = 20): BulkDeletionProgress[] {
    return Array.from(this.operationHistory.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  /**
   * Cancel an active operation
   */
  cancelOperation(operationId: string): boolean {
    const progress = this.activeOperations.get(operationId);
    if (!progress) {
      return false;
    }

    if (progress.status === 'processing') {
      progress.status = 'cancelled';
      progress.endTime = new Date().toISOString();
      
      // Move to history
      this.operationHistory.set(operationId, progress);
      this.activeOperations.delete(operationId);
      
      console.log(`❌ Cancelled bulk deletion operation ${operationId}`);
      return true;
    }

    return false;
  }

  /**
   * Get bulk deletion statistics
   */
  getStats(): BulkDeletionStats {
    const allOperations = [
      ...Array.from(this.activeOperations.values()),
      ...Array.from(this.operationHistory.values())
    ];

    const completedOperations = allOperations.filter(op => op.status === 'completed');
    const totalPostsProcessed = allOperations.reduce((sum, op) => sum + op.processedPosts, 0);
    
    const totalProcessingTime = completedOperations.reduce((sum, op) => {
      if (op.endTime) {
        return sum + (new Date(op.endTime).getTime() - new Date(op.startTime).getTime());
      }
      return sum;
    }, 0);

    const averageProcessingTime = completedOperations.length > 0 
      ? totalProcessingTime / completedOperations.length 
      : 0;

    const totalSuccessful = allOperations.reduce((sum, op) => sum + op.successfulDeletions, 0);
    const successRate = totalPostsProcessed > 0 ? (totalSuccessful / totalPostsProcessed) * 100 : 0;

    return {
      totalRequests: allOperations.length,
      activeRequests: this.activeOperations.size,
      completedRequests: completedOperations.length,
      totalPostsProcessed,
      averageProcessingTime,
      successRate
    };
  }

  /**
   * Retry failed deletions from a previous operation
   */
  async retryFailedDeletions(operationId: string): Promise<string> {
    const originalOperation = this.getProgress(operationId);
    if (!originalOperation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    const failedResults = originalOperation.results.filter(result => !result.success);
    if (failedResults.length === 0) {
      throw new Error(`No failed deletions found in operation ${operationId}`);
    }

    const retryIdentifiers = failedResults
      .map(result => result.postId || result.slug)
      .filter(Boolean) as string[];

    return this.startBulkDeletion({
      identifiers: retryIdentifiers,
      options: {
        retryAttempts: 3,
        continueOnError: true,
        validateBeforeDelete: true
      },
      requestId: `retry_${operationId}_${Date.now()}`
    });
  }

  /**
   * Process bulk deletion with progress tracking
   */
  private async processBulkDeletion(operationId: string, request: BulkDeletionRequest): Promise<void> {
    const progress = this.activeOperations.get(operationId);
    if (!progress) return;

    try {
      progress.status = 'processing';
      
      const options: BulkDeletionOptions = {
        retryAttempts: 2,
        retryDelay: 1000,
        continueOnError: true,
        maxConcurrent: 3,
        validateBeforeDelete: true,
        ...request.options
      };

      // Log bulk deletion initiation
      const auditEventId = await deletionAuditLogger.logDeletionInitiated(
        `bulk_${operationId}`,
        `Bulk deletion of ${request.identifiers.length} posts`,
        operationId,
        {
          userId: request.userId || 'system',
          requestId: operationId
        }
      );

      // Process posts in batches
      const batchSize = options.maxConcurrent || 3;
      const batches = this.createBatches(request.identifiers, batchSize);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        // Check if operation was cancelled
        if (progress.status === 'cancelled') {
          console.log(`Operation ${operationId} was cancelled`);
          return;
        }

        const batch = batches[batchIndex];
        const batchPromises = batch.map(async (identifier) => {
          // Update current post info
          progress.currentPost = {
            id: identifier,
            title: 'Processing...',
            slug: identifier
          };

          const result = await blogDeletionService.deletePost(identifier, options);
          
          // Update progress
          progress.processedPosts++;
          progress.results.push(result);
          
          if (result.success) {
            progress.successfulDeletions++;
          } else {
            progress.failedDeletions++;
            if (result.error) {
              progress.errors.push({
                postId: identifier,
                error: result.error.message,
                retryable: result.error.retryable
              });
            }
          }

          // Update estimated time remaining
          const elapsed = Date.now() - new Date(progress.startTime).getTime();
          const avgTimePerPost = elapsed / progress.processedPosts;
          const remainingPosts = progress.totalPosts - progress.processedPosts;
          progress.estimatedTimeRemaining = Math.round(avgTimePerPost * remainingPosts);

          return result;
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);

        // Small delay between batches to prevent overwhelming the system
        if (batchIndex < batches.length - 1) {
          await this.sleep(500);
        }
      }

      // Mark operation as completed
      progress.status = 'completed';
      progress.endTime = new Date().toISOString();
      progress.currentPost = undefined;
      progress.estimatedTimeRemaining = 0;

      // Log completion
      const duration = new Date(progress.endTime).getTime() - new Date(progress.startTime).getTime();
      await deletionAuditLogger.logDeletionSuccess(
        auditEventId,
        `bulk_${operationId}`,
        duration,
        true,
        {
          userId: request.userId || 'system',
          requestId: operationId
        }
      );

      console.log(`✅ Bulk deletion operation ${operationId} completed:`, {
        totalPosts: progress.totalPosts,
        successful: progress.successfulDeletions,
        failed: progress.failedDeletions,
        duration
      });

      // Move to history after a delay
      setTimeout(() => {
        this.operationHistory.set(operationId, progress);
        this.activeOperations.delete(operationId);
      }, 30000); // Keep in active for 30 seconds for immediate access

    } catch (error) {
      console.error(`Bulk deletion operation ${operationId} failed:`, error);
      progress.status = 'failed';
      progress.endTime = new Date().toISOString();
      progress.errors.push({
        postId: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: false
      });
    }
  }

  /**
   * Utility methods
   */
  private generateOperationId(): string {
    return `bulk_del_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupOldOperations(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    let cleanedCount = 0;
    for (const [id, operation] of this.operationHistory.entries()) {
      if (new Date(operation.startTime).getTime() < cutoffTime) {
        this.operationHistory.delete(id);
        cleanedCount++;
      }
    }

    // Limit history size
    if (this.operationHistory.size > this.maxHistorySize) {
      const operations = Array.from(this.operationHistory.entries())
        .sort(([, a], [, b]) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      
      const toKeep = operations.slice(0, this.maxHistorySize);
      this.operationHistory.clear();
      
      toKeep.forEach(([id, operation]) => {
        this.operationHistory.set(id, operation);
      });
      
      cleanedCount += operations.length - toKeep.length;
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old bulk deletion operations`);
    }
  }
}

// Export singleton instance
export const bulkDeletionManager = BulkDeletionManager.getInstance();