import { unifiedBlogService } from '@/lib/blog/unified-blog-service';

export interface SyncEvent {
  type: 'create' | 'update' | 'delete';
  postId: string;
  slug?: string;
  timestamp: string;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  pendingOperations: number;
  errors: string[];
}

class RealTimeSyncManager {
  private static instance: RealTimeSyncManager;
  private syncStatus: SyncStatus = {
    isConnected: true,
    lastSync: null,
    pendingOperations: 0,
    errors: []
  };
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private eventListeners: Set<(event: SyncEvent) => void> = new Set();

  static getInstance(): RealTimeSyncManager {
    if (!RealTimeSyncManager.instance) {
      RealTimeSyncManager.instance = new RealTimeSyncManager();
    }
    return RealTimeSyncManager.instance;
  }

  // Subscribe to sync status changes
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Subscribe to sync events
  onSyncEvent(callback: (event: SyncEvent) => void): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  // Notify all listeners of status change
  private notifyStatusChange(): void {
    this.listeners.forEach(callback => {
      try {
        callback({ ...this.syncStatus });
      } catch (error) {
        console.error('Error in sync status callback:', error);
      }
    });
  }

  // Notify all listeners of sync event
  private notifyEvent(event: SyncEvent): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in sync event callback:', error);
      }
    });
  }

  // Handle incoming sync events
  async handleSyncEvent(event: SyncEvent): Promise<void> {
    try {
      this.syncStatus.pendingOperations++;
      this.notifyStatusChange();

      // Invalidate cache based on event type
      await unifiedBlogService.invalidateCache('all');

      // Update last sync time
      this.syncStatus.lastSync = event.timestamp;
      this.syncStatus.pendingOperations = Math.max(0, this.syncStatus.pendingOperations - 1);
      
      // Clear old errors on successful sync
      if (this.syncStatus.errors.length > 0) {
        this.syncStatus.errors = [];
      }

      this.notifyStatusChange();
      this.notifyEvent(event);

    } catch (error) {
      this.syncStatus.pendingOperations = Math.max(0, this.syncStatus.pendingOperations - 1);
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      this.syncStatus.errors.push(errorMessage);
      
      // Keep only last 5 errors
      if (this.syncStatus.errors.length > 5) {
        this.syncStatus.errors = this.syncStatus.errors.slice(-5);
      }

      this.notifyStatusChange();
      console.error('Sync error:', error);
    }
  }

  // Optimistic update for admin operations
  async optimisticUpdate(operation: () => Promise<any>, rollback?: () => Promise<any>): Promise<any> {
    try {
      this.syncStatus.pendingOperations++;
      this.notifyStatusChange();

      const result = await operation();

      // Invalidate cache after successful operation
      await unifiedBlogService.invalidateCache('all');

      this.syncStatus.pendingOperations = Math.max(0, this.syncStatus.pendingOperations - 1);
      this.syncStatus.lastSync = new Date().toISOString();
      this.notifyStatusChange();

      return result;

    } catch (error) {
      this.syncStatus.pendingOperations = Math.max(0, this.syncStatus.pendingOperations - 1);
      
      // Attempt rollback if provided
      if (rollback) {
        try {
          await rollback();
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown operation error';
      this.syncStatus.errors.push(errorMessage);
      
      if (this.syncStatus.errors.length > 5) {
        this.syncStatus.errors = this.syncStatus.errors.slice(-5);
      }

      this.notifyStatusChange();
      throw error;
    }
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Force sync check
  async forceSyncCheck(): Promise<void> {
    try {
      const healthCheck = await unifiedBlogService.healthCheck();
      this.syncStatus.isConnected = healthCheck.status === 'healthy';
      
      if (this.syncStatus.isConnected) {
        // Clear cache to force fresh data
        await unifiedBlogService.invalidateCache('all');
        this.syncStatus.lastSync = new Date().toISOString();
        
        // Clear errors on successful connection
        this.syncStatus.errors = [];
      } else {
        this.syncStatus.errors.push(healthCheck.message);
      }

      this.notifyStatusChange();
    } catch (error) {
      this.syncStatus.isConnected = false;
      const errorMessage = error instanceof Error ? error.message : 'Connection check failed';
      this.syncStatus.errors.push(errorMessage);
      this.notifyStatusChange();
    }
  }

  // Initialize sync manager
  async initialize(): Promise<void> {
    // Perform initial health check
    await this.forceSyncCheck();

    // Set up periodic health checks (every 30 seconds)
    setInterval(() => {
      this.forceSyncCheck();
    }, 30000);

    console.log('Real-time sync manager initialized');
  }

  // Cleanup
  destroy(): void {
    this.listeners.clear();
    this.eventListeners.clear();
  }
}

export const realTimeSyncManager = RealTimeSyncManager.getInstance();
export default realTimeSyncManager;