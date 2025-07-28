/**
 * Optimistic UI Manager
 * 
 * Manages optimistic UI updates for deletion operations with rollback
 * capability and smooth state transitions.
 */

import { BlogPost, BlogPostPreview } from '@/lib/types/blog';

export interface OptimisticUpdate {
  id: string;
  type: 'delete' | 'bulk_delete' | 'restore';
  timestamp: string;
  postIds: string[];
  originalData: Map<string, BlogPost | BlogPostPreview>;
  status: 'pending' | 'confirmed' | 'rolled_back' | 'failed';
  rollbackReason?: string;
  metadata?: {
    userId?: string;
    requestId?: string;
    bulkOperationId?: string;
  };
}

export interface UIState {
  deletedPosts: Set<string>;
  pendingDeletions: Set<string>;
  failedDeletions: Set<string>;
  restoredPosts: Set<string>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
}

export interface StateTransition {
  from: 'normal' | 'pending' | 'deleted' | 'failed' | 'restored';
  to: 'normal' | 'pending' | 'deleted' | 'failed' | 'restored';
  postId: string;
  timestamp: string;
  reason?: string;
}

export interface RollbackOptions {
  reason: string;
  notifyUser?: boolean;
  restoreToOriginalState?: boolean;
  showErrorMessage?: boolean;
}

/**
 * Optimistic UI manager for deletion operations
 */
export class OptimisticUIManager {
  private static instance: OptimisticUIManager;
  private uiState: UIState = {
    deletedPosts: new Set(),
    pendingDeletions: new Set(),
    failedDeletions: new Set(),
    restoredPosts: new Set(),
    optimisticUpdates: new Map()
  };
  private stateTransitions: StateTransition[] = [];
  private subscribers: Map<string, (state: UIState) => void> = new Map();
  private maxTransitionHistory = 1000;

  private constructor() {
    // Cleanup old transitions periodically
    setInterval(() => this.cleanupOldTransitions(), 60 * 60 * 1000);
  }

  static getInstance(): OptimisticUIManager {
    if (!OptimisticUIManager.instance) {
      OptimisticUIManager.instance = new OptimisticUIManager();
    }
    return OptimisticUIManager.instance;
  }

  /**
   * Apply optimistic deletion update
   */
  applyOptimisticDeletion(
    postId: string,
    originalData: BlogPost | BlogPostPreview,
    metadata?: {
      userId?: string;
      requestId?: string;
      bulkOperationId?: string;
    }
  ): string {
    const updateId = this.generateUpdateId();
    const timestamp = new Date().toISOString();

    // Create optimistic update record
    const update: OptimisticUpdate = {
      id: updateId,
      type: 'delete',
      timestamp,
      postIds: [postId],
      originalData: new Map([[postId, originalData]]),
      status: 'pending',
      metadata
    };

    // Update UI state
    this.uiState.pendingDeletions.add(postId);
    this.uiState.optimisticUpdates.set(updateId, update);

    // Record state transition
    this.recordStateTransition({
      from: 'normal',
      to: 'pending',
      postId,
      timestamp,
      reason: 'Optimistic deletion applied'
    });

    // Notify subscribers
    this.notifySubscribers();

    console.log('🎯 Applied optimistic deletion:', {
      updateId,
      postId,
      postTitle: originalData.title
    });

    return updateId;
  }

  /**
   * Apply optimistic bulk deletion update
   */
  applyOptimisticBulkDeletion(
    posts: Array<{ id: string; data: BlogPost | BlogPostPreview }>,
    metadata?: {
      userId?: string;
      requestId?: string;
      bulkOperationId?: string;
    }
  ): string {
    const updateId = this.generateUpdateId();
    const timestamp = new Date().toISOString();

    // Create optimistic update record
    const originalData = new Map(posts.map(p => [p.id, p.data]));
    const postIds = posts.map(p => p.id);

    const update: OptimisticUpdate = {
      id: updateId,
      type: 'bulk_delete',
      timestamp,
      postIds,
      originalData,
      status: 'pending',
      metadata
    };

    // Update UI state
    postIds.forEach(postId => {
      this.uiState.pendingDeletions.add(postId);
      this.recordStateTransition({
        from: 'normal',
        to: 'pending',
        postId,
        timestamp,
        reason: 'Optimistic bulk deletion applied'
      });
    });

    this.uiState.optimisticUpdates.set(updateId, update);

    // Notify subscribers
    this.notifySubscribers();

    console.log('🎯 Applied optimistic bulk deletion:', {
      updateId,
      postCount: postIds.length
    });

    return updateId;
  }

  /**
   * Confirm optimistic update (deletion was successful)
   */
  confirmOptimisticUpdate(updateId: string): boolean {
    const update = this.uiState.optimisticUpdates.get(updateId);
    if (!update) {
      console.warn(`Optimistic update ${updateId} not found`);
      return false;
    }

    const timestamp = new Date().toISOString();

    // Update status
    update.status = 'confirmed';

    // Move posts from pending to deleted
    update.postIds.forEach(postId => {
      this.uiState.pendingDeletions.delete(postId);
      this.uiState.deletedPosts.add(postId);
      this.uiState.failedDeletions.delete(postId);

      this.recordStateTransition({
        from: 'pending',
        to: 'deleted',
        postId,
        timestamp,
        reason: 'Deletion confirmed'
      });
    });

    // Notify subscribers
    this.notifySubscribers();

    console.log('✅ Confirmed optimistic update:', {
      updateId,
      postCount: update.postIds.length
    });

    // Clean up confirmed update after delay
    setTimeout(() => {
      this.uiState.optimisticUpdates.delete(updateId);
      this.notifySubscribers();
    }, 30000); // Keep for 30 seconds for debugging

    return true;
  }

  /**
   * Rollback optimistic update (deletion failed)
   */
  rollbackOptimisticUpdate(updateId: string, options: RollbackOptions): boolean {
    const update = this.uiState.optimisticUpdates.get(updateId);
    if (!update) {
      console.warn(`Optimistic update ${updateId} not found`);
      return false;
    }

    const timestamp = new Date().toISOString();

    // Update status and reason
    update.status = 'rolled_back';
    update.rollbackReason = options.reason;

    // Restore posts to original state
    update.postIds.forEach(postId => {
      this.uiState.pendingDeletions.delete(postId);
      this.uiState.deletedPosts.delete(postId);
      
      if (options.restoreToOriginalState) {
        this.uiState.failedDeletions.delete(postId);
        this.uiState.restoredPosts.add(postId);
        
        this.recordStateTransition({
          from: 'pending',
          to: 'restored',
          postId,
          timestamp,
          reason: `Rollback: ${options.reason}`
        });
      } else {
        this.uiState.failedDeletions.add(postId);
        
        this.recordStateTransition({
          from: 'pending',
          to: 'failed',
          postId,
          timestamp,
          reason: `Failed: ${options.reason}`
        });
      }
    });

    // Notify subscribers
    this.notifySubscribers();

    console.log('🔄 Rolled back optimistic update:', {
      updateId,
      reason: options.reason,
      postCount: update.postIds.length,
      restoreToOriginal: options.restoreToOriginalState
    });

    // Show user notification if requested
    if (options.notifyUser && typeof window !== 'undefined') {
      this.showUserNotification(
        options.showErrorMessage ? 'error' : 'warning',
        `Deletion failed: ${options.reason}`,
        update.postIds.length > 1 
          ? `${update.postIds.length} posts were restored`
          : 'Post was restored'
      );
    }

    return true;
  }

  /**
   * Get current UI state
   */
  getUIState(): UIState {
    return {
      deletedPosts: new Set(this.uiState.deletedPosts),
      pendingDeletions: new Set(this.uiState.pendingDeletions),
      failedDeletions: new Set(this.uiState.failedDeletions),
      restoredPosts: new Set(this.uiState.restoredPosts),
      optimisticUpdates: new Map(this.uiState.optimisticUpdates)
    };
  }

  /**
   * Check if a post is in a specific state
   */
  isPostInState(postId: string, state: 'pending' | 'deleted' | 'failed' | 'restored'): boolean {
    switch (state) {
      case 'pending':
        return this.uiState.pendingDeletions.has(postId);
      case 'deleted':
        return this.uiState.deletedPosts.has(postId);
      case 'failed':
        return this.uiState.failedDeletions.has(postId);
      case 'restored':
        return this.uiState.restoredPosts.has(postId);
      default:
        return false;
    }
  }

  /**
   * Get post state
   */
  getPostState(postId: string): 'normal' | 'pending' | 'deleted' | 'failed' | 'restored' {
    if (this.uiState.pendingDeletions.has(postId)) return 'pending';
    if (this.uiState.deletedPosts.has(postId)) return 'deleted';
    if (this.uiState.failedDeletions.has(postId)) return 'failed';
    if (this.uiState.restoredPosts.has(postId)) return 'restored';
    return 'normal';
  }

  /**
   * Get original data for a post (if available)
   */
  getOriginalPostData(postId: string): BlogPost | BlogPostPreview | null {
    for (const update of this.uiState.optimisticUpdates.values()) {
      const data = update.originalData.get(postId);
      if (data) return data;
    }
    return null;
  }

  /**
   * Clear post from all states (reset to normal)
   */
  clearPostState(postId: string): void {
    const currentState = this.getPostState(postId);
    
    this.uiState.pendingDeletions.delete(postId);
    this.uiState.deletedPosts.delete(postId);
    this.uiState.failedDeletions.delete(postId);
    this.uiState.restoredPosts.delete(postId);

    if (currentState !== 'normal') {
      this.recordStateTransition({
        from: currentState,
        to: 'normal',
        postId,
        timestamp: new Date().toISOString(),
        reason: 'State cleared'
      });
    }

    this.notifySubscribers();
  }

  /**
   * Clear all failed deletions
   */
  clearFailedDeletions(): number {
    const count = this.uiState.failedDeletions.size;
    const timestamp = new Date().toISOString();

    this.uiState.failedDeletions.forEach(postId => {
      this.recordStateTransition({
        from: 'failed',
        to: 'normal',
        postId,
        timestamp,
        reason: 'Failed deletions cleared'
      });
    });

    this.uiState.failedDeletions.clear();
    this.notifySubscribers();

    console.log(`🧹 Cleared ${count} failed deletions`);
    return count;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(subscriberId: string, callback: (state: UIState) => void): void {
    this.subscribers.set(subscriberId, callback);
    console.log(`📡 Subscribed to UI state changes: ${subscriberId}`);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(subscriberId: string): boolean {
    const removed = this.subscribers.delete(subscriberId);
    if (removed) {
      console.log(`📡 Unsubscribed from UI state changes: ${subscriberId}`);
    }
    return removed;
  }

  /**
   * Get state transition history
   */
  getStateTransitions(postId?: string, limit: number = 50): StateTransition[] {
    let transitions = this.stateTransitions;
    
    if (postId) {
      transitions = transitions.filter(t => t.postId === postId);
    }

    return transitions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get optimistic update by ID
   */
  getOptimisticUpdate(updateId: string): OptimisticUpdate | undefined {
    return this.uiState.optimisticUpdates.get(updateId);
  }

  /**
   * Get all active optimistic updates
   */
  getActiveOptimisticUpdates(): OptimisticUpdate[] {
    return Array.from(this.uiState.optimisticUpdates.values())
      .filter(update => update.status === 'pending');
  }

  /**
   * Private helper methods
   */
  private generateUpdateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private recordStateTransition(transition: StateTransition): void {
    this.stateTransitions.push(transition);
    
    // Limit transition history size
    if (this.stateTransitions.length > this.maxTransitionHistory) {
      this.stateTransitions = this.stateTransitions.slice(-this.maxTransitionHistory);
    }
  }

  private notifySubscribers(): void {
    const state = this.getUIState();
    this.subscribers.forEach((callback, subscriberId) => {
      try {
        callback(state);
      } catch (error) {
        console.error(`Error notifying subscriber ${subscriberId}:`, error);
      }
    });
  }

  private showUserNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ): void {
    // This would integrate with your notification system
    // For now, just log to console
    console.log(`🔔 ${type.toUpperCase()}: ${title} - ${message}`);
    
    // In a real implementation, you might dispatch a custom event
    // or call a toast notification service
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('optimistic-ui-notification', {
        detail: { type, title, message }
      }));
    }
  }

  private cleanupOldTransitions(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const originalLength = this.stateTransitions.length;
    
    this.stateTransitions = this.stateTransitions.filter(
      transition => new Date(transition.timestamp).getTime() > cutoffTime
    );

    const cleaned = originalLength - this.stateTransitions.length;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old state transitions`);
    }
  }

  /**
   * Reset all state (for testing or emergency cleanup)
   */
  resetState(): void {
    this.uiState = {
      deletedPosts: new Set(),
      pendingDeletions: new Set(),
      failedDeletions: new Set(),
      restoredPosts: new Set(),
      optimisticUpdates: new Map()
    };
    this.stateTransitions = [];
    this.notifySubscribers();
    
    console.log('🔄 UI state reset');
  }
}

// Export singleton instance
export const optimisticUIManager = OptimisticUIManager.getInstance();