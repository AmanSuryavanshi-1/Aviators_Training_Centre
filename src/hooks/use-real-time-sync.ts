'use client';

import { useState, useEffect, useCallback } from 'react';
import { realTimeSyncManager, SyncStatus, SyncEvent } from '@/lib/sync/real-time-sync';

export function useRealTimeSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(realTimeSyncManager.getStatus());
  const [recentEvents, setRecentEvents] = useState<SyncEvent[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simple connection check for the simple blog service
    const checkConnection = async () => {
      try {
        const { simpleBlogService } = await import('@/lib/blog/simple-blog-service');
        await simpleBlogService.getAllPosts({ limit: 1 });
        setIsConnected(true);
      } catch (error) {
        console.warn('Connection check failed:', error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const forceSyncCheck = useCallback(async () => {
    await realTimeSyncManager.forceSyncCheck();
  }, []);

  const optimisticUpdate = useCallback(async (
    operation: () => Promise<any>,
    rollback?: () => Promise<any>
  ) => {
    return realTimeSyncManager.optimisticUpdate(operation, rollback);
  }, []);

  return {
    syncStatus,
    recentEvents,
    forceSyncCheck,
    optimisticUpdate,
    isConnected,
    isPending: syncStatus.pendingOperations > 0,
    hasErrors: syncStatus.errors.length > 0,
    lastSync: syncStatus.lastSync
  };
}

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(realTimeSyncManager.getStatus());

  useEffect(() => {
    const unsubscribe = realTimeSyncManager.onStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  return syncStatus;
}
