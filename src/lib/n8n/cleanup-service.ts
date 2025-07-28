import { cleanupOldAuditLogs, logAutomationAction } from './audit-logger';
import { errorMonitor } from './error-monitoring';
import { cleanupOldNotifications } from './notifications';

/**
 * Comprehensive cleanup service for automation system
 */
export class AutomationCleanupService {
  private isRunning = false;
  private lastCleanup: Date | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private config: {
      auditLogRetentionDays: number;
      errorRetentionDays: number;
      notificationRetentionDays: number;
      cleanupIntervalHours: number;
      enableAutoCleanup: boolean;
    } = {
      auditLogRetentionDays: 90,
      errorRetentionDays: 180,
      notificationRetentionDays: 30,
      cleanupIntervalHours: 24,
      enableAutoCleanup: true
    }
  ) {}

  /**
   * Starts the automatic cleanup service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    if (!this.config.enableAutoCleanup) {
      console.log('Auto cleanup is disabled');
      return;
    }

    this.isRunning = true;
    console.log('Starting automation cleanup service...');

    // Run initial cleanup
    this.performCleanup().catch(error => {
      console.error('Initial cleanup failed:', error);
    });

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(
      () => {
        this.performCleanup().catch(error => {
          console.error('Scheduled cleanup failed:', error);
        });
      },
      this.config.cleanupIntervalHours * 60 * 60 * 1000
    );

    console.log(`Cleanup service started with ${this.config.cleanupIntervalHours}h interval`);
  }

  /**
   * Stops the automatic cleanup service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Cleanup service is not running');
      return;
    }

    this.isRunning = false;

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log('Cleanup service stopped');
  }

  /**
   * Performs a comprehensive cleanup of all automation data
   */
  async performCleanup(): Promise<{
    auditLogsDeleted: number;
    errorsDeleted: number;
    notificationsDeleted: number;
    totalDuration: number;
    success: boolean;
    errors: string[];
  }> {
    const startTime = Date.now();
    const cleanupId = `cleanup_${Date.now()}`;
    const errors: string[] = [];
    
    let auditLogsDeleted = 0;
    let errorsDeleted = 0;
    let notificationsDeleted = 0;

    try {
      console.log('Starting comprehensive cleanup...');

      await logAutomationAction({
        type: 'system_error', // Using system_error as closest match for system operations
        status: 'processing',
        timestamp: new Date().toISOString(),
        metadata: {
          action: 'cleanup_started',
          cleanupId,
          config: this.config
        }
      });

      // Cleanup audit logs
      try {
        console.log('Cleaning up old audit logs...');
        auditLogsDeleted = await cleanupOldAuditLogs(this.config.auditLogRetentionDays);
        console.log(`Deleted ${auditLogsDeleted} old audit logs`);
      } catch (error) {
        const errorMsg = `Audit log cleanup failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Cleanup error monitoring data
      try {
        console.log('Cleaning up old error data...');
        errorsDeleted = await errorMonitor.cleanupOldErrors();
        console.log(`Deleted ${errorsDeleted} old error records`);
      } catch (error) {
        const errorMsg = `Error data cleanup failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Cleanup old notifications
      try {
        console.log('Cleaning up old notifications...');
        notificationsDeleted = await cleanupOldNotifications(this.config.notificationRetentionDays);
        console.log(`Deleted ${notificationsDeleted} old notifications`);
      } catch (error) {
        const errorMsg = `Notification cleanup failed: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      const totalDuration = Date.now() - startTime;
      const success = errors.length === 0;
      this.lastCleanup = new Date();

      // Log cleanup completion
      await logAutomationAction({
        type: 'system_error',
        status: success ? 'success' : 'warning',
        timestamp: new Date().toISOString(),
        error: errors.length > 0 ? errors.join('; ') : undefined,
        metadata: {
          action: 'cleanup_completed',
          cleanupId,
          auditLogsDeleted,
          errorsDeleted,
          notificationsDeleted,
          totalDuration,
          success,
          errors: errors.length > 0 ? errors : undefined
        }
      });

      console.log(`Cleanup completed in ${totalDuration}ms:`, {
        auditLogsDeleted,
        errorsDeleted,
        notificationsDeleted,
        success,
        errors: errors.length
      });

      return {
        auditLogsDeleted,
        errorsDeleted,
        notificationsDeleted,
        totalDuration,
        success,
        errors
      };

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMsg = `Cleanup service failed: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);

      await logAutomationAction({
        type: 'system_error',
        status: 'failed',
        error: errorMsg,
        timestamp: new Date().toISOString(),
        metadata: {
          action: 'cleanup_failed',
          cleanupId,
          totalDuration,
          partialResults: {
            auditLogsDeleted,
            errorsDeleted,
            notificationsDeleted
          }
        }
      });

      console.error('Cleanup service failed:', error);

      return {
        auditLogsDeleted,
        errorsDeleted,
        notificationsDeleted,
        totalDuration,
        success: false,
        errors
      };
    }
  }

  /**
   * Gets cleanup service status
   */
  getStatus(): {
    isRunning: boolean;
    lastCleanup: Date | null;
    nextCleanup: Date | null;
    config: typeof this.config;
  } {
    const nextCleanup = this.lastCleanup && this.isRunning
      ? new Date(this.lastCleanup.getTime() + this.config.cleanupIntervalHours * 60 * 60 * 1000)
      : null;

    return {
      isRunning: this.isRunning,
      lastCleanup: this.lastCleanup,
      nextCleanup,
      config: this.config
    };
  }

  /**
   * Updates cleanup configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    console.log('Cleanup service configuration updated:', {
      old: oldConfig,
      new: this.config
    });

    // Restart service if interval changed and service is running
    if (this.isRunning && oldConfig.cleanupIntervalHours !== this.config.cleanupIntervalHours) {
      console.log('Restarting cleanup service with new interval...');
      this.stop();
      this.start();
    }

    // Stop service if auto cleanup was disabled
    if (this.isRunning && !this.config.enableAutoCleanup) {
      console.log('Auto cleanup disabled, stopping service...');
      this.stop();
    }

    // Start service if auto cleanup was enabled
    if (!this.isRunning && this.config.enableAutoCleanup) {
      console.log('Auto cleanup enabled, starting service...');
      this.start();
    }
  }

  /**
   * Forces an immediate cleanup (useful for manual triggers)
   */
  async forceCleanup(): Promise<ReturnType<typeof this.performCleanup>> {
    console.log('Force cleanup triggered...');
    return await this.performCleanup();
  }

  /**
   * Estimates the amount of data that would be cleaned up
   */
  async estimateCleanup(): Promise<{
    estimatedAuditLogs: number;
    estimatedErrors: number;
    estimatedNotifications: number;
    totalEstimatedSize: string;
  }> {
    try {
      // This would query the databases to estimate cleanup size
      // For now, we'll return placeholder estimates
      
      const estimatedAuditLogs = 0; // Would query audit logs older than retention period
      const estimatedErrors = 0;   // Would query error records older than retention period
      const estimatedNotifications = 0; // Would query notifications older than retention period
      
      // Rough size estimation (assuming average record sizes)
      const avgAuditLogSize = 1024; // 1KB per audit log
      const avgErrorSize = 2048;    // 2KB per error record
      const avgNotificationSize = 512; // 512B per notification
      
      const totalBytes = 
        (estimatedAuditLogs * avgAuditLogSize) +
        (estimatedErrors * avgErrorSize) +
        (estimatedNotifications * avgNotificationSize);
      
      const totalEstimatedSize = this.formatBytes(totalBytes);

      return {
        estimatedAuditLogs,
        estimatedErrors,
        estimatedNotifications,
        totalEstimatedSize
      };

    } catch (error) {
      console.error('Error estimating cleanup size:', error);
      return {
        estimatedAuditLogs: 0,
        estimatedErrors: 0,
        estimatedNotifications: 0,
        totalEstimatedSize: '0 B'
      };
    }
  }

  /**
   * Formats bytes into human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Global cleanup service instance
export const cleanupService = new AutomationCleanupService();

// Auto-start cleanup service in production
if (process.env.NODE_ENV === 'production') {
  // Start cleanup service after a short delay to allow system initialization
  setTimeout(() => {
    cleanupService.start();
  }, 30000); // 30 second delay
}

/**
 * Manual cleanup function for API endpoints
 */
export async function performManualCleanup(options?: {
  auditLogRetentionDays?: number;
  errorRetentionDays?: number;
  notificationRetentionDays?: number;
}): Promise<ReturnType<typeof cleanupService.performCleanup>> {
  if (options) {
    // Temporarily update config for this cleanup
    const originalConfig = cleanupService.getStatus().config;
    cleanupService.updateConfig(options);
    
    try {
      const result = await cleanupService.forceCleanup();
      // Restore original config
      cleanupService.updateConfig(originalConfig);
      return result;
    } catch (error) {
      // Restore original config even if cleanup fails
      cleanupService.updateConfig(originalConfig);
      throw error;
    }
  }

  return await cleanupService.forceCleanup();
}

/**
 * Gets comprehensive cleanup statistics
 */
export async function getCleanupStatistics(): Promise<{
  serviceStatus: ReturnType<typeof cleanupService.getStatus>;
  estimatedCleanup: Awaited<ReturnType<typeof cleanupService.estimateCleanup>>;
  recentCleanups: Array<{
    timestamp: string;
    auditLogsDeleted: number;
    errorsDeleted: number;
    notificationsDeleted: number;
    duration: number;
    success: boolean;
  }>;
}> {
  const serviceStatus = cleanupService.getStatus();
  const estimatedCleanup = await cleanupService.estimateCleanup();
  
  // Get recent cleanup logs from audit system
  // This would query the audit logs for recent cleanup operations
  const recentCleanups: Array<{
    timestamp: string;
    auditLogsDeleted: number;
    errorsDeleted: number;
    notificationsDeleted: number;
    duration: number;
    success: boolean;
  }> = [];

  return {
    serviceStatus,
    estimatedCleanup,
    recentCleanups
  };
}