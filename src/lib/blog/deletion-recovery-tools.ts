/**
 * Deletion Recovery Tools for Administrators
 * 
 * Provides administrative tools to retry failed deletions, manage queues,
 * and diagnose deletion issues for system maintenance and recovery.
 */

import { blogDeletionService, DeletionResult } from './blog-deletion-service';
import { offlineDeletionQueue, QueuedDeletion } from './offline-deletion-queue';
import { deletionAuditLogger } from './deletion-audit-logger';
import { deletionMonitoringService } from './deletion-monitoring';
import { bulkDeletionManager } from './bulk-deletion-manager';

export interface RecoveryOperation {
  id: string;
  type: 'retry_failed' | 'retry_queued' | 'bulk_retry' | 'queue_cleanup' | 'diagnostic';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
  results: Array<{
    identifier: string;
    success: boolean;
    error?: string;
    duration?: number;
  }>;
  metadata: {
    initiatedBy: string;
    reason: string;
    parameters?: Record<string, any>;
  };
}

export interface DiagnosticResult {
  id: string;
  timestamp: string;
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'critical';
    components: {
      deletionService: 'healthy' | 'degraded' | 'critical';
      auditLogger: 'healthy' | 'degraded' | 'critical';
      offlineQueue: 'healthy' | 'degraded' | 'critical';
      monitoring: 'healthy' | 'degraded' | 'critical';
    };
  };
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    description: string;
    suggestedFix: string;
    autoFixable: boolean;
  }>;
  statistics: {
    queueSize: number;
    failedDeletions: number;
    averageResponseTime: number;
    errorRate: number;
    oldestQueuedItem?: string;
  };
  recommendations: string[];
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  skipValidation?: boolean;
  continueOnError?: boolean;
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Administrative deletion recovery tools
 */
export class DeletionRecoveryTools {
  private static instance: DeletionRecoveryTools;
  private activeOperations: Map<string, RecoveryOperation> = new Map();
  private operationHistory: Map<string, RecoveryOperation> = new Map();
  private readonly maxHistorySize = 100;

  private constructor() {
    // Cleanup old operations periodically
    setInterval(() => this.cleanupOldOperations(), 60 * 60 * 1000); // Every hour
  }

  static getInstance(): DeletionRecoveryTools {
    if (!DeletionRecoveryTools.instance) {
      DeletionRecoveryTools.instance = new DeletionRecoveryTools();
    }
    return DeletionRecoveryTools.instance;
  }

  /**
   * Retry all failed deletions from a specific time period
   */
  async retryFailedDeletions(
    timeRange: { start: Date; end: Date },
    options: RetryOptions = {},
    adminUserId: string,
    reason: string = 'Administrative retry of failed deletions'
  ): Promise<string> {
    const operationId = this.generateOperationId();
    
    console.log('🔄 Starting failed deletion retry operation:', {
      operationId,
      timeRange,
      adminUserId
    });

    // Get failed deletions from audit log
    const failedLogs = deletionAuditLogger.getAuditLogs({
      action: 'delete_failed',
      startDate: timeRange.start,
      endDate: timeRange.end,
      limit: 1000
    });

    // Extract unique post identifiers
    const failedIdentifiers = Array.from(
      new Set(failedLogs.map(log => log.postId))
    );

    // Create recovery operation
    const operation: RecoveryOperation = {
      id: operationId,
      type: 'retry_failed',
      status: 'pending',
      startedAt: new Date().toISOString(),
      progress: {
        total: failedIdentifiers.length,
        processed: 0,
        successful: 0,
        failed: 0
      },
      results: [],
      metadata: {
        initiatedBy: adminUserId,
        reason,
        parameters: { timeRange, options }
      }
    };

    this.activeOperations.set(operationId, operation);

    // Start processing asynchronously
    this.processRetryOperation(operationId, failedIdentifiers, options).catch(error => {
      console.error(`Recovery operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    });

    return operationId;
  }

  /**
   * Retry all queued deletions
   */
  async retryQueuedDeletions(
    options: RetryOptions = {},
    adminUserId: string,
    reason: string = 'Administrative retry of queued deletions'
  ): Promise<string> {
    const operationId = this.generateOperationId();
    
    console.log('🔄 Starting queued deletion retry operation:', {
      operationId,
      adminUserId
    });

    // Get all queued deletions
    const queuedDeletions = offlineDeletionQueue.getAllQueuedDeletions();
    const identifiers = queuedDeletions.map(deletion => deletion.identifier);

    // Create recovery operation
    const operation: RecoveryOperation = {
      id: operationId,
      type: 'retry_queued',
      status: 'pending',
      startedAt: new Date().toISOString(),
      progress: {
        total: identifiers.length,
        processed: 0,
        successful: 0,
        failed: 0
      },
      results: [],
      metadata: {
        initiatedBy: adminUserId,
        reason,
        parameters: { options }
      }
    };

    this.activeOperations.set(operationId, operation);

    // Process queued deletions
    this.processQueuedRetryOperation(operationId, queuedDeletions, options).catch(error => {
      console.error(`Recovery operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    });

    return operationId;
  }

  /**
   * Bulk retry specific post identifiers
   */
  async bulkRetryDeletions(
    identifiers: string[],
    options: RetryOptions = {},
    adminUserId: string,
    reason: string = 'Administrative bulk retry'
  ): Promise<string> {
    const operationId = this.generateOperationId();
    
    console.log('🔄 Starting bulk retry operation:', {
      operationId,
      count: identifiers.length,
      adminUserId
    });

    // Create recovery operation
    const operation: RecoveryOperation = {
      id: operationId,
      type: 'bulk_retry',
      status: 'pending',
      startedAt: new Date().toISOString(),
      progress: {
        total: identifiers.length,
        processed: 0,
        successful: 0,
        failed: 0
      },
      results: [],
      metadata: {
        initiatedBy: adminUserId,
        reason,
        parameters: { options }
      }
    };

    this.activeOperations.set(operationId, operation);

    // Start processing
    this.processRetryOperation(operationId, identifiers, options).catch(error => {
      console.error(`Recovery operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    });

    return operationId;
  }

  /**
   * Clean up offline deletion queue
   */
  async cleanupOfflineQueue(
    adminUserId: string,
    options: {
      removeFailedOnly?: boolean;
      olderThanHours?: number;
      maxItems?: number;
    } = {}
  ): Promise<string> {
    const operationId = this.generateOperationId();
    
    console.log('🧹 Starting queue cleanup operation:', {
      operationId,
      options,
      adminUserId
    });

    const operation: RecoveryOperation = {
      id: operationId,
      type: 'queue_cleanup',
      status: 'running',
      startedAt: new Date().toISOString(),
      progress: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0
      },
      results: [],
      metadata: {
        initiatedBy: adminUserId,
        reason: 'Queue cleanup operation',
        parameters: options
      }
    };

    this.activeOperations.set(operationId, operation);

    try {
      let removedCount = 0;

      if (options.removeFailedOnly) {
        removedCount = offlineDeletionQueue.clearFailedDeletions();
      } else {
        removedCount = offlineDeletionQueue.clearAllDeletions();
      }

      operation.progress.total = removedCount;
      operation.progress.processed = removedCount;
      operation.progress.successful = removedCount;
      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();

      console.log('✅ Queue cleanup completed:', {
        operationId,
        removedCount
      });

    } catch (error) {
      console.error(`Queue cleanup operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    }

    return operationId;
  }

  /**
   * Run comprehensive system diagnostics
   */
  async runDiagnostics(adminUserId: string): Promise<DiagnosticResult> {
    const diagnosticId = this.generateOperationId();
    
    console.log('🔍 Running system diagnostics:', {
      diagnosticId,
      adminUserId
    });

    const timestamp = new Date().toISOString();
    const issues: DiagnosticResult['issues'] = [];
    const recommendations: string[] = [];

    // Check deletion service health
    const deletionServiceHealth = await this.checkDeletionServiceHealth();
    
    // Check audit logger health
    const auditLoggerHealth = await this.checkAuditLoggerHealth();
    
    // Check offline queue health
    const offlineQueueHealth = await this.checkOfflineQueueHealth();
    
    // Check monitoring service health
    const monitoringHealth = await this.checkMonitoringHealth();

    // Get system statistics
    const queueStats = offlineDeletionQueue.getQueueStats();
    const healthStatus = await deletionMonitoringService.getDeletionHealthStatus();

    // Analyze issues and generate recommendations
    if (queueStats.totalQueued > 100) {
      issues.push({
        severity: 'high',
        component: 'offline_queue',
        description: `Large offline queue: ${queueStats.totalQueued} items`,
        suggestedFix: 'Process offline queue or investigate network connectivity',
        autoFixable: true
      });
      recommendations.push('Consider processing the offline deletion queue');
    }

    if (healthStatus.errorRate > 10) {
      issues.push({
        severity: 'high',
        component: 'deletion_service',
        description: `High error rate: ${healthStatus.errorRate.toFixed(1)}%`,
        suggestedFix: 'Investigate common error causes and fix underlying issues',
        autoFixable: false
      });
      recommendations.push('Review error logs and address common failure causes');
    }

    if (healthStatus.averageResponseTime > 5000) {
      issues.push({
        severity: 'medium',
        component: 'deletion_service',
        description: `Slow response time: ${healthStatus.averageResponseTime}ms`,
        suggestedFix: 'Optimize deletion performance or check network connectivity',
        autoFixable: false
      });
      recommendations.push('Investigate performance bottlenecks');
    }

    // Determine overall system health
    const componentHealths = [
      deletionServiceHealth,
      auditLoggerHealth,
      offlineQueueHealth,
      monitoringHealth
    ];

    let overall: DiagnosticResult['systemHealth']['overall'] = 'healthy';
    if (componentHealths.some(h => h === 'critical')) {
      overall = 'critical';
    } else if (componentHealths.some(h => h === 'degraded')) {
      overall = 'degraded';
    }

    const result: DiagnosticResult = {
      id: diagnosticId,
      timestamp,
      systemHealth: {
        overall,
        components: {
          deletionService: deletionServiceHealth,
          auditLogger: auditLoggerHealth,
          offlineQueue: offlineQueueHealth,
          monitoring: monitoringHealth
        }
      },
      issues,
      statistics: {
        queueSize: queueStats.totalQueued,
        failedDeletions: queueStats.failedCount,
        averageResponseTime: healthStatus.averageResponseTime,
        errorRate: healthStatus.errorRate,
        oldestQueuedItem: queueStats.oldestQueuedAt
      },
      recommendations
    };

    console.log('✅ System diagnostics completed:', {
      diagnosticId,
      overall,
      issueCount: issues.length
    });

    return result;
  }

  /**
   * Get recovery operation status
   */
  getOperationStatus(operationId: string): RecoveryOperation | null {
    return this.activeOperations.get(operationId) || this.operationHistory.get(operationId) || null;
  }

  /**
   * Get all active recovery operations
   */
  getActiveOperations(): RecoveryOperation[] {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Get recovery operation history
   */
  getOperationHistory(limit: number = 20): RecoveryOperation[] {
    return Array.from(this.operationHistory.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Cancel an active recovery operation
   */
  cancelOperation(operationId: string, adminUserId: string): boolean {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.status !== 'running') {
      return false;
    }

    operation.status = 'cancelled';
    operation.completedAt = new Date().toISOString();
    
    // Move to history
    this.operationHistory.set(operationId, operation);
    this.activeOperations.delete(operationId);

    console.log('❌ Recovery operation cancelled:', {
      operationId,
      cancelledBy: adminUserId
    });

    return true;
  }

  /**
   * Auto-fix detected issues
   */
  async autoFixIssues(
    diagnosticResult: DiagnosticResult,
    adminUserId: string
  ): Promise<{
    fixed: number;
    failed: number;
    results: Array<{
      issue: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const autoFixableIssues = diagnosticResult.issues.filter(issue => issue.autoFixable);
    const results: Array<{ issue: string; success: boolean; error?: string }> = [];
    
    let fixed = 0;
    let failed = 0;

    console.log('🔧 Starting auto-fix for issues:', {
      totalIssues: autoFixableIssues.length,
      adminUserId
    });

    for (const issue of autoFixableIssues) {
      try {
        let success = false;

        switch (issue.component) {
          case 'offline_queue':
            if (issue.description.includes('Large offline queue')) {
              // Process the offline queue
              await offlineDeletionQueue.processQueue();
              success = true;
            }
            break;
          
          default:
            console.warn('No auto-fix available for issue:', issue.description);
        }

        results.push({
          issue: issue.description,
          success
        });

        if (success) {
          fixed++;
        } else {
          failed++;
        }

      } catch (error) {
        console.error('Auto-fix failed for issue:', issue.description, error);
        results.push({
          issue: issue.description,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    console.log('✅ Auto-fix completed:', { fixed, failed });

    return { fixed, failed, results };
  }

  /**
   * Private helper methods
   */
  private async processRetryOperation(
    operationId: string,
    identifiers: string[],
    options: RetryOptions
  ): Promise<void> {
    const operation = this.activeOperations.get(operationId);
    if (!operation) return;

    operation.status = 'running';
    const batchSize = options.batchSize || 5;

    try {
      // Process in batches
      const batches = this.createBatches(identifiers, batchSize);

      for (const batch of batches) {
        // Check if operation was cancelled
        if (operation.status === 'cancelled') {
          return;
        }

        const batchPromises = batch.map(async (identifier) => {
          const startTime = Date.now();
          
          try {
            const result = await blogDeletionService.deletePost(identifier, {
              retryAttempts: options.maxRetries || 3,
              retryDelay: options.retryDelay || 1000,
              validateBeforeDelete: !options.skipValidation
            });

            const duration = Date.now() - startTime;

            operation.progress.processed++;
            
            if (result.success) {
              operation.progress.successful++;
            } else {
              operation.progress.failed++;
            }

            operation.results.push({
              identifier,
              success: result.success,
              error: result.error?.message,
              duration
            });

            return result;

          } catch (error) {
            const duration = Date.now() - startTime;
            operation.progress.processed++;
            operation.progress.failed++;

            operation.results.push({
              identifier,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              duration
            });

            return { success: false, error };
          }
        });

        await Promise.all(batchPromises);

        // Small delay between batches
        if (operation.status === 'running') {
          await this.sleep(1000);
        }
      }

      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();

      console.log('✅ Recovery operation completed:', {
        operationId,
        processed: operation.progress.processed,
        successful: operation.progress.successful,
        failed: operation.progress.failed
      });

      // Move to history after delay
      setTimeout(() => {
        this.operationHistory.set(operationId, operation);
        this.activeOperations.delete(operationId);
      }, 30000);

    } catch (error) {
      console.error(`Recovery operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    }
  }

  private async processQueuedRetryOperation(
    operationId: string,
    queuedDeletions: QueuedDeletion[],
    options: RetryOptions
  ): Promise<void> {
    const operation = this.activeOperations.get(operationId);
    if (!operation) return;

    operation.status = 'running';

    try {
      // Process the offline queue
      const result = await offlineDeletionQueue.processQueue();

      operation.progress.processed = result.processed;
      operation.progress.successful = result.successful;
      operation.progress.failed = result.failed;

      // Add individual results
      result.errors.forEach(error => {
        operation.results.push({
          identifier: error.identifier,
          success: false,
          error: error.error
        });
      });

      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();

      console.log('✅ Queued retry operation completed:', {
        operationId,
        processed: result.processed,
        successful: result.successful,
        failed: result.failed
      });

    } catch (error) {
      console.error(`Queued retry operation ${operationId} failed:`, error);
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
    }
  }

  private async checkDeletionServiceHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    // Mock health check - in real implementation, test actual service
    try {
      // Could test with a dummy operation or check service availability
      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  private async checkAuditLoggerHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      // Test audit logger functionality
      const recentLogs = deletionAuditLogger.getAuditLogs({ limit: 1 });
      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  private async checkOfflineQueueHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const stats = offlineDeletionQueue.getQueueStats();
      
      if (stats.totalQueued > 500) {
        return 'critical';
      } else if (stats.totalQueued > 100) {
        return 'degraded';
      }
      
      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  private async checkMonitoringHealth(): Promise<'healthy' | 'degraded' | 'critical'> {
    try {
      const healthStatus = await deletionMonitoringService.getDeletionHealthStatus();
      
      if (healthStatus.overall === 'unhealthy') {
        return 'critical';
      } else if (healthStatus.overall === 'degraded') {
        return 'degraded';
      }
      
      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  private generateOperationId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    let cleanedCount = 0;
    for (const [id, operation] of this.operationHistory.entries()) {
      if (new Date(operation.startedAt).getTime() < cutoffTime) {
        this.operationHistory.delete(id);
        cleanedCount++;
      }
    }

    // Limit history size
    if (this.operationHistory.size > this.maxHistorySize) {
      const operations = Array.from(this.operationHistory.entries())
        .sort(([, a], [, b]) => 
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
      
      const toKeep = operations.slice(0, this.maxHistorySize);
      this.operationHistory.clear();
      
      toKeep.forEach(([id, operation]) => {
        this.operationHistory.set(id, operation);
      });
      
      cleanedCount += operations.length - toKeep.length;
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old recovery operations`);
    }
  }
}

// Export singleton instance
export const deletionRecoveryTools = DeletionRecoveryTools.getInstance();