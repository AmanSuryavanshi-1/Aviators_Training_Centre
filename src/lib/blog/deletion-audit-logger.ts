/**
 * Deletion Audit Logger
 * 
 * Comprehensive logging and audit trail system for blog post deletions.
 * Tracks all deletion attempts, successes, failures, and user actions.
 */

import { DeletionAuditLog, DeletionEvent, DeletionMetrics } from '@/lib/types/blog';

export interface AuditLogOptions {
  userId?: string;
  userEmail?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
  includeMetadata?: boolean;
}

export interface AuditQueryOptions {
  userId?: string;
  postId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'action' | 'userId';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Deletion audit logging service
 */
export class DeletionAuditLogger {
  private static instance: DeletionAuditLogger;
  private auditLogs: Map<string, DeletionAuditLog> = new Map();
  private deletionEvents: Map<string, DeletionEvent[]> = new Map();
  private maxLogsPerPost = 100;
  private maxTotalLogs = 10000;

  private constructor() {
    // Initialize cleanup interval (every hour)
    setInterval(() => this.cleanupOldLogs(), 60 * 60 * 1000);
  }

  static getInstance(): DeletionAuditLogger {
    if (!DeletionAuditLogger.instance) {
      DeletionAuditLogger.instance = new DeletionAuditLogger();
    }
    return DeletionAuditLogger.instance;
  }

  /**
   * Log deletion initiation
   */
  async logDeletionInitiated(
    postId: string,
    postTitle: string,
    postSlug: string,
    options: AuditLogOptions = {}
  ): Promise<string> {
    const eventId = this.generateEventId();
    const timestamp = new Date().toISOString();

    const auditLog: DeletionAuditLog = {
      eventId,
      postId,
      postTitle,
      postSlug,
      userId: options.userId || 'anonymous',
      userEmail: options.userEmail,
      action: 'delete_initiated',
      timestamp,
      metadata: {
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        requestId: options.requestId
      }
    };

    // Store audit log
    this.auditLogs.set(eventId, auditLog);

    // Create deletion event
    const deletionEvent: DeletionEvent = {
      id: eventId,
      postId,
      slug: postSlug,
      title: postTitle,
      initiatedBy: options.userId || 'anonymous',
      timestamp,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3
    };

    // Store deletion event
    const events = this.deletionEvents.get(postId) || [];
    events.push(deletionEvent);
    this.deletionEvents.set(postId, events);

    console.log('📝 Deletion initiated logged:', {
      eventId,
      postId,
      postTitle,
      userId: options.userId
    });

    return eventId;
  }

  /**
   * Log successful deletion
   */
  async logDeletionSuccess(
    eventId: string,
    postId: string,
    duration?: number,
    cacheInvalidated?: boolean,
    options: AuditLogOptions = {}
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const auditLog: DeletionAuditLog = {
      eventId,
      postId,
      postTitle: this.getPostTitleFromEvent(eventId) || 'Unknown',
      postSlug: this.getPostSlugFromEvent(eventId) || 'unknown',
      userId: options.userId || 'anonymous',
      userEmail: options.userEmail,
      action: 'delete_success',
      timestamp,
      metadata: {
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        requestId: options.requestId,
        duration: duration?.toString(),
        cacheInvalidated: cacheInvalidated?.toString()
      }
    };

    this.auditLogs.set(`${eventId}_success`, auditLog);

    // Update deletion event
    this.updateDeletionEventStatus(postId, eventId, 'success', undefined, duration);

    console.log('✅ Deletion success logged:', {
      eventId,
      postId,
      duration,
      cacheInvalidated
    });
  }

  /**
   * Log deletion failure
   */
  async logDeletionFailure(
    eventId: string,
    postId: string,
    error: {
      code: string;
      message: string;
      category: string;
      retryable: boolean;
    },
    retryCount?: number,
    options: AuditLogOptions = {}
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const auditLog: DeletionAuditLog = {
      eventId,
      postId,
      postTitle: this.getPostTitleFromEvent(eventId) || 'Unknown',
      postSlug: this.getPostSlugFromEvent(eventId) || 'unknown',
      userId: options.userId || 'anonymous',
      userEmail: options.userEmail,
      action: 'delete_failed',
      timestamp,
      metadata: {
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        requestId: options.requestId,
        retryCount: retryCount?.toString()
      },
      error: {
        code: error.code,
        message: error.message,
        category: error.category as any,
        retryable: error.retryable
      }
    };

    this.auditLogs.set(`${eventId}_failed_${Date.now()}`, auditLog);

    // Update deletion event
    this.updateDeletionEventStatus(postId, eventId, 'failed', error);

    console.log('❌ Deletion failure logged:', {
      eventId,
      postId,
      error: error.code,
      retryCount
    });
  }

  /**
   * Log deletion retry
   */
  async logDeletionRetry(
    eventId: string,
    postId: string,
    retryCount: number,
    previousError?: {
      code: string;
      message: string;
      category: string;
    },
    options: AuditLogOptions = {}
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const auditLog: DeletionAuditLog = {
      eventId,
      postId,
      postTitle: this.getPostTitleFromEvent(eventId) || 'Unknown',
      postSlug: this.getPostSlugFromEvent(eventId) || 'unknown',
      userId: options.userId || 'anonymous',
      userEmail: options.userEmail,
      action: 'delete_retried',
      timestamp,
      metadata: {
        userAgent: options.userAgent,
        ipAddress: options.ipAddress,
        sessionId: options.sessionId,
        requestId: options.requestId,
        retryCount: retryCount.toString(),
        previousError: previousError ? JSON.stringify(previousError) : undefined
      }
    };

    this.auditLogs.set(`${eventId}_retry_${retryCount}`, auditLog);

    // Update deletion event
    this.updateDeletionEventStatus(postId, eventId, 'retrying', previousError);

    console.log('🔄 Deletion retry logged:', {
      eventId,
      postId,
      retryCount,
      previousError: previousError?.code
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  getAuditLogs(options: AuditQueryOptions = {}): DeletionAuditLog[] {
    let logs = Array.from(this.auditLogs.values());

    // Apply filters
    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    if (options.postId) {
      logs = logs.filter(log => log.postId === options.postId);
    }

    if (options.action) {
      logs = logs.filter(log => log.action === options.action);
    }

    if (options.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= options.startDate!);
    }

    if (options.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= options.endDate!);
    }

    // Sort logs
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';
    
    logs.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    return logs.slice(offset, offset + limit);
  }

  /**
   * Get deletion events for a specific post
   */
  getDeletionEvents(postId: string): DeletionEvent[] {
    return this.deletionEvents.get(postId) || [];
  }

  /**
   * Get all deletion events
   */
  getAllDeletionEvents(): DeletionEvent[] {
    const allEvents: DeletionEvent[] = [];
    this.deletionEvents.forEach(events => allEvents.push(...events));
    return allEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get deletion metrics and statistics
   */
  getDeletionMetrics(timeRange?: { start: Date; end: Date }): DeletionMetrics {
    const logs = this.getAuditLogs({
      startDate: timeRange?.start,
      endDate: timeRange?.end
    });

    const totalDeletions = logs.filter(log => log.action === 'delete_initiated').length;
    const successfulDeletions = logs.filter(log => log.action === 'delete_success').length;
    const failedDeletions = logs.filter(log => log.action === 'delete_failed').length;

    // Calculate average response time
    const successLogs = logs.filter(log => 
      log.action === 'delete_success' && log.metadata.duration
    );
    const averageResponseTime = successLogs.length > 0
      ? successLogs.reduce((sum, log) => 
          sum + (parseInt(log.metadata.duration || '0') || 0), 0
        ) / successLogs.length
      : 0;

    // Group errors by category
    const errorsByCategory: Record<string, number> = {};
    logs.filter(log => log.action === 'delete_failed' && log.error).forEach(log => {
      const category = log.error!.category;
      errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
    });

    // Calculate retry rate
    const retryLogs = logs.filter(log => log.action === 'delete_retried');
    const retryRate = totalDeletions > 0 ? (retryLogs.length / totalDeletions) * 100 : 0;

    // Calculate cache invalidation success rate
    const cacheSuccessLogs = logs.filter(log => 
      log.action === 'delete_success' && 
      log.metadata.cacheInvalidated === 'true'
    );
    const cacheInvalidationSuccessRate = successfulDeletions > 0
      ? (cacheSuccessLogs.length / successfulDeletions) * 100
      : 0;

    return {
      totalDeletions,
      successfulDeletions,
      failedDeletions,
      averageResponseTime,
      errorsByCategory,
      retryRate,
      cacheInvalidationSuccessRate,
      timeRange: {
        start: timeRange?.start.toISOString() || new Date(0).toISOString(),
        end: timeRange?.end.toISOString() || new Date().toISOString()
      }
    };
  }

  /**
   * Export audit logs for compliance or analysis
   */
  exportAuditLogs(options: AuditQueryOptions = {}): {
    logs: DeletionAuditLog[];
    metadata: {
      exportedAt: string;
      totalLogs: number;
      filters: AuditQueryOptions;
    };
  } {
    const logs = this.getAuditLogs(options);
    
    return {
      logs,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalLogs: logs.length,
        filters: options
      }
    };
  }

  /**
   * Clear audit logs (with optional retention period)
   */
  clearAuditLogs(olderThanDays?: number): number {
    let deletedCount = 0;
    
    if (olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      for (const [key, log] of this.auditLogs.entries()) {
        if (new Date(log.timestamp) < cutoffDate) {
          this.auditLogs.delete(key);
          deletedCount++;
        }
      }
      
      // Also clean deletion events
      for (const [postId, events] of this.deletionEvents.entries()) {
        const filteredEvents = events.filter(event => 
          new Date(event.timestamp) >= cutoffDate
        );
        
        if (filteredEvents.length === 0) {
          this.deletionEvents.delete(postId);
        } else {
          this.deletionEvents.set(postId, filteredEvents);
        }
      }
    } else {
      deletedCount = this.auditLogs.size;
      this.auditLogs.clear();
      this.deletionEvents.clear();
    }

    console.log(`🧹 Cleared ${deletedCount} audit logs`);
    return deletedCount;
  }

  /**
   * Private helper methods
   */
  private updateDeletionEventStatus(
    postId: string,
    eventId: string,
    status: DeletionEvent['status'],
    error?: any,
    duration?: number
  ): void {
    const events = this.deletionEvents.get(postId) || [];
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      event.status = status;
      if (error) {
        event.error = error;
      }
      if (duration) {
        event.duration = duration;
      }
      if (status === 'retrying') {
        event.retryCount++;
      }
    }
  }

  private getPostTitleFromEvent(eventId: string): string | null {
    const events = Array.from(this.deletionEvents.values()).flat();
    const event = events.find(e => e.id === eventId);
    return event?.title || null;
  }

  private getPostSlugFromEvent(eventId: string): string | null {
    const events = Array.from(this.deletionEvents.values()).flat();
    const event = events.find(e => e.id === eventId);
    return event?.slug || null;
  }

  private generateEventId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private cleanupOldLogs(): void {
    // Remove logs older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    let cleanedCount = 0;
    
    for (const [key, log] of this.auditLogs.entries()) {
      if (new Date(log.timestamp) < ninetyDaysAgo) {
        this.auditLogs.delete(key);
        cleanedCount++;
      }
    }

    // Limit total logs to prevent memory issues
    if (this.auditLogs.size > this.maxTotalLogs) {
      const logs = Array.from(this.auditLogs.entries())
        .sort(([, a], [, b]) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      
      // Keep only the most recent logs
      const logsToKeep = logs.slice(0, this.maxTotalLogs);
      this.auditLogs.clear();
      
      logsToKeep.forEach(([key, log]) => {
        this.auditLogs.set(key, log);
      });
      
      cleanedCount += logs.length - logsToKeep.length;
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Automatic cleanup removed ${cleanedCount} old audit logs`);
    }
  }
}

// Export singleton instance
export const deletionAuditLogger = DeletionAuditLogger.getInstance();
