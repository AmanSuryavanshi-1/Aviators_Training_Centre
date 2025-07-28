/**
 * Offline Deletion Queue
 * 
 * Handles deletion operations that fail due to network issues by queuing them
 * for automatic processing when connectivity is restored.
 */

import { DeletionOptions, DeletionResult } from './blog-deletion-service';

export interface QueuedDeletion {
  id: string;
  identifier: string; // post ID or slug
  postTitle?: string;
  postSlug?: string;
  options: DeletionOptions;
  queuedAt: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  lastError?: {
    code: string;
    message: string;
    category: string;
  };
  priority: 'low' | 'normal' | 'high';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface QueueProcessingResult {
  processed: number;
  successful: number;
  failed: number;
  remaining: number;
  errors: Array<{
    queueId: string;
    identifier: string;
    error: string;
  }>;
}

export interface QueueStats {
  totalQueued: number;
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  completedCount: number;
  oldestQueuedAt?: string;
  averageProcessingTime: number;
}

/**
 * Offline deletion queue service
 */
export class OfflineDeletionQueue {
  private static instance: OfflineDeletionQueue;
  private queue: Map<string, QueuedDeletion> = new Map();
  private processing: Set<string> = new Set();
  private isOnline = true;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly maxQueueSize = 1000;
  private readonly processingIntervalMs = 30000; // 30 seconds
  private readonly maxRetryDelay = 300000; // 5 minutes

  private constructor() {
    this.initializeNetworkMonitoring();
    this.startProcessingLoop();
    this.loadQueueFromStorage();
  }

  static getInstance(): OfflineDeletionQueue {
    if (!OfflineDeletionQueue.instance) {
      OfflineDeletionQueue.instance = new OfflineDeletionQueue();
    }
    return OfflineDeletionQueue.instance;
  }

  /**
   * Add a deletion to the offline queue
   */
  async queueDeletion(
    identifier: string,
    options: DeletionOptions = {},
    metadata: {
      postTitle?: string;
      postSlug?: string;
      userId?: string;
      priority?: 'low' | 'normal' | 'high';
      reason?: string;
    } = {}
  ): Promise<string> {
    // Check queue size limit
    if (this.queue.size >= this.maxQueueSize) {
      throw new Error(`Queue is full (${this.maxQueueSize} items). Cannot add more deletions.`);
    }

    const queueId = this.generateQueueId();
    const queuedDeletion: QueuedDeletion = {
      id: queueId,
      identifier,
      postTitle: metadata.postTitle,
      postSlug: metadata.postSlug,
      options: {
        retryAttempts: 3,
        retryDelay: 1000,
        skipCacheInvalidation: false,
        validateBeforeDelete: true,
        ...options
      },
      queuedAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 5,
      priority: metadata.priority || 'normal',
      userId: metadata.userId,
      metadata: {
        reason: metadata.reason || 'Network failure',
        originalTimestamp: new Date().toISOString()
      }
    };

    this.queue.set(queueId, queuedDeletion);
    this.saveQueueToStorage();

    console.log('📥 Deletion queued for offline processing:', {
      queueId,
      identifier,
      postTitle: metadata.postTitle,
      priority: queuedDeletion.priority,
      queueSize: this.queue.size
    });

    // Try immediate processing if online
    if (this.isOnline) {
      this.processQueue();
    }

    return queueId;
  }

  /**
   * Remove a deletion from the queue
   */
  removeDeletion(queueId: string): boolean {
    const removed = this.queue.delete(queueId);
    if (removed) {
      this.processing.delete(queueId);
      this.saveQueueToStorage();
      console.log('🗑️ Deletion removed from queue:', queueId);
    }
    return removed;
  }

  /**
   * Get queued deletion by ID
   */
  getQueuedDeletion(queueId: string): QueuedDeletion | undefined {
    return this.queue.get(queueId);
  }

  /**
   * Get all queued deletions
   */
  getAllQueuedDeletions(): QueuedDeletion[] {
    return Array.from(this.queue.values()).sort((a, b) => {
      // Sort by priority first, then by queue time
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): QueueStats {
    const allDeletions = Array.from(this.queue.values());
    const pendingCount = allDeletions.filter(d => d.attempts === 0).length;
    const processingCount = this.processing.size;
    const failedCount = allDeletions.filter(d => 
      d.attempts >= d.maxAttempts && d.lastError
    ).length;
    const completedCount = 0; // Completed items are removed from queue

    const oldestQueued = allDeletions.reduce((oldest, current) => {
      const currentTime = new Date(current.queuedAt).getTime();
      const oldestTime = oldest ? new Date(oldest).getTime() : Infinity;
      return currentTime < oldestTime ? current.queuedAt : oldest;
    }, null as string | null);

    // Calculate average processing time (mock calculation)
    const averageProcessingTime = 2500; // 2.5 seconds average

    return {
      totalQueued: this.queue.size,
      pendingCount,
      processingCount,
      failedCount,
      completedCount,
      oldestQueuedAt: oldestQueued || undefined,
      averageProcessingTime
    };
  }

  /**
   * Process the deletion queue
   */
  async processQueue(): Promise<QueueProcessingResult> {
    if (!this.isOnline) {
      console.log('📴 Skipping queue processing - offline');
      return {
        processed: 0,
        successful: 0,
        failed: 0,
        remaining: this.queue.size,
        errors: []
      };
    }

    const startTime = Date.now();
    const queuedDeletions = this.getAllQueuedDeletions();
    const maxConcurrent = 3;
    const errors: Array<{ queueId: string; identifier: string; error: string }> = [];
    
    let processed = 0;
    let successful = 0;
    let failed = 0;

    console.log(`🔄 Processing deletion queue: ${queuedDeletions.length} items`);

    // Process in batches to avoid overwhelming the system
    const batches = this.createBatches(queuedDeletions, maxConcurrent);

    for (const batch of batches) {
      const batchPromises = batch.map(async (queuedDeletion) => {
        if (this.processing.has(queuedDeletion.id)) {
          return { success: false, error: 'Already processing' };
        }

        this.processing.add(queuedDeletion.id);
        
        try {
          const result = await this.processSingleDeletion(queuedDeletion);
          processed++;
          
          if (result.success) {
            successful++;
            this.queue.delete(queuedDeletion.id);
          } else {
            failed++;
            errors.push({
              queueId: queuedDeletion.id,
              identifier: queuedDeletion.identifier,
              error: result.error || 'Unknown error'
            });
          }
          
          return result;
        } catch (error) {
          processed++;
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            queueId: queuedDeletion.id,
            identifier: queuedDeletion.identifier,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        } finally {
          this.processing.delete(queuedDeletion.id);
        }
      });

      await Promise.all(batchPromises);
    }

    this.saveQueueToStorage();

    const duration = Date.now() - startTime;
    console.log(`✅ Queue processing completed:`, {
      processed,
      successful,
      failed,
      remaining: this.queue.size,
      duration: `${duration}ms`
    });

    return {
      processed,
      successful,
      failed,
      remaining: this.queue.size,
      errors
    };
  }

  /**
   * Process a single queued deletion
   */
  private async processSingleDeletion(queuedDeletion: QueuedDeletion): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Check if we should skip this deletion (too many attempts)
    if (queuedDeletion.attempts >= queuedDeletion.maxAttempts) {
      console.log(`⏭️ Skipping deletion ${queuedDeletion.id} - max attempts reached`);
      return { success: false, error: 'Max attempts reached' };
    }

    // Check if we should delay this deletion (exponential backoff)
    if (queuedDeletion.lastAttemptAt) {
      const lastAttempt = new Date(queuedDeletion.lastAttemptAt).getTime();
      const delay = Math.min(
        1000 * Math.pow(2, queuedDeletion.attempts),
        this.maxRetryDelay
      );
      
      if (Date.now() - lastAttempt < delay) {
        console.log(`⏰ Delaying deletion ${queuedDeletion.id} - backoff period`);
        return { success: false, error: 'Backoff delay' };
      }
    }

    console.log(`🔄 Processing queued deletion:`, {
      queueId: queuedDeletion.id,
      identifier: queuedDeletion.identifier,
      attempt: queuedDeletion.attempts + 1,
      maxAttempts: queuedDeletion.maxAttempts
    });

    try {
      // Update attempt tracking
      queuedDeletion.attempts++;
      queuedDeletion.lastAttemptAt = new Date().toISOString();

      // Import the deletion service dynamically to avoid circular dependencies
      const { blogDeletionService } = await import('./blog-deletion-service');
      
      // Attempt the deletion
      const result = await blogDeletionService.deletePost(
        queuedDeletion.identifier,
        queuedDeletion.options
      );

      if (result.success) {
        console.log(`✅ Queued deletion successful:`, {
          queueId: queuedDeletion.id,
          identifier: queuedDeletion.identifier,
          postTitle: queuedDeletion.postTitle
        });
        return { success: true };
      } else {
        const error = result.error!;
        queuedDeletion.lastError = {
          code: error.code,
          message: error.message,
          category: error.category
        };

        console.log(`❌ Queued deletion failed:`, {
          queueId: queuedDeletion.id,
          identifier: queuedDeletion.identifier,
          error: error.code,
          attempt: queuedDeletion.attempts,
          retryable: error.retryable
        });

        // If error is not retryable, mark as failed
        if (!error.retryable) {
          queuedDeletion.attempts = queuedDeletion.maxAttempts;
        }

        return { success: false, error: error.message };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      queuedDeletion.lastError = {
        code: 'PROCESSING_ERROR',
        message: errorMessage,
        category: 'unknown'
      };

      console.error(`💥 Error processing queued deletion:`, {
        queueId: queuedDeletion.id,
        identifier: queuedDeletion.identifier,
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Clear failed deletions from the queue
   */
  clearFailedDeletions(): number {
    let clearedCount = 0;
    
    for (const [queueId, deletion] of this.queue.entries()) {
      if (deletion.attempts >= deletion.maxAttempts && deletion.lastError) {
        this.queue.delete(queueId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      this.saveQueueToStorage();
      console.log(`🧹 Cleared ${clearedCount} failed deletions from queue`);
    }

    return clearedCount;
  }

  /**
   * Clear all deletions from the queue
   */
  clearAllDeletions(): number {
    const count = this.queue.size;
    this.queue.clear();
    this.processing.clear();
    this.saveQueueToStorage();
    
    console.log(`🧹 Cleared all ${count} deletions from queue`);
    return count;
  }

  /**
   * Set online/offline status manually
   */
  setOnlineStatus(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;
    
    console.log(`🌐 Network status changed: ${isOnline ? 'online' : 'offline'}`);
    
    // If we just came online, process the queue
    if (!wasOnline && isOnline && this.queue.size > 0) {
      console.log('🔄 Network restored - processing queued deletions');
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Get current online status
   */
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Private helper methods
   */
  private initializeNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Browser environment
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.setOnlineStatus(true);
      });
      
      window.addEventListener('offline', () => {
        this.setOnlineStatus(false);
      });
    } else {
      // Server environment - assume online
      this.isOnline = true;
    }
  }

  private startProcessingLoop(): void {
    this.processingInterval = setInterval(() => {
      if (this.isOnline && this.queue.size > 0) {
        this.processQueue().catch(error => {
          console.error('Error in queue processing loop:', error);
        });
      }
    }, this.processingIntervalMs);
  }

  private stopProcessingLoop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private generateQueueId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private saveQueueToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const queueData = Array.from(this.queue.entries());
        localStorage.setItem('blog_deletion_queue', JSON.stringify(queueData));
      } catch (error) {
        console.warn('Failed to save queue to localStorage:', error);
      }
    }
  }

  private loadQueueFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('blog_deletion_queue');
        if (stored) {
          const queueData = JSON.parse(stored) as Array<[string, QueuedDeletion]>;
          this.queue = new Map(queueData);
          console.log(`📥 Loaded ${this.queue.size} deletions from storage`);
        }
      } catch (error) {
        console.warn('Failed to load queue from localStorage:', error);
      }
    }
  }

  /**
   * Cleanup method for graceful shutdown
   */
  destroy(): void {
    this.stopProcessingLoop();
    this.saveQueueToStorage();
    console.log('🛑 Offline deletion queue destroyed');
  }
}

// Export singleton instance
export const offlineDeletionQueue = OfflineDeletionQueue.getInstance();