import { enhancedClient } from '@/lib/sanity/client';

// Audit log entry interface
export interface AutomationAuditLog {
  _type: 'automationAuditLog';
  type: 
    | 'webhook_received'
    | 'webhook_unauthorized'
    | 'content_validation'
    | 'content_sanitization'
    | 'draft_created'
    | 'draft_updated'
    | 'draft_approved'
    | 'draft_rejected'
    | 'editor_notification'
    | 'webhook_error'
    | 'system_error'
    | 'retry_attempt'
    | 'fallback_triggered';
  automationId?: string;
  status: 'success' | 'failed' | 'processing' | 'warning';
  timestamp: string;
  error?: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  retryCount?: number;
}

// Audit log summary interface
export interface AuditLogSummary {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  processingCount: number;
  recentLogs: AutomationAuditLog[];
  errorSummary: Array<{
    error: string;
    count: number;
    lastOccurrence: string;
  }>;
  automationSummary: Array<{
    automationId: string;
    totalActions: number;
    successRate: number;
    lastActivity: string;
  }>;
}

// Performance metrics interface
export interface AutomationPerformanceMetrics {
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  totalWebhooksReceived: number;
  totalDraftsCreated: number;
  totalDraftsApproved: number;
  totalDraftsRejected: number;
  averageValidationScore: number;
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
  timeRangeMetrics: {
    last24Hours: AutomationPerformanceMetrics;
    last7Days: AutomationPerformanceMetrics;
    last30Days: AutomationPerformanceMetrics;
  };
}

/**
 * Logs an automation action to the audit trail
 */
export async function logAutomationAction(logEntry: Omit<AutomationAuditLog, '_type'>): Promise<void> {
  try {
    const auditLogEntry: AutomationAuditLog = {
      _type: 'automationAuditLog',
      ...logEntry
    };

    // Create the audit log entry in Sanity
    await enhancedClient.create(auditLogEntry);

    // Also log to console for immediate debugging
    const logLevel = logEntry.status === 'failed' ? 'error' : 
                    logEntry.status === 'warning' ? 'warn' : 'info';
    
    console[logLevel](`[N8N Automation] ${logEntry.type}:`, {
      automationId: logEntry.automationId,
      status: logEntry.status,
      timestamp: logEntry.timestamp,
      error: logEntry.error,
      metadata: logEntry.metadata
    });

  } catch (error) {
    // If audit logging fails, at least log to console
    console.error('Failed to create audit log entry:', error);
    console.error('Original log entry:', logEntry);
  }
}

/**
 * Retrieves audit logs with filtering and pagination
 */
export async function getAuditLogs(options: {
  automationId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<AutomationAuditLog[]> {
  try {
    const {
      automationId,
      type,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = options;

    // Build the query conditions
    const conditions: string[] = ['_type == "automationAuditLog"'];
    const params: Record<string, any> = {};

    if (automationId) {
      conditions.push('automationId == $automationId');
      params.automationId = automationId;
    }

    if (type) {
      conditions.push('type == $type');
      params.type = type;
    }

    if (status) {
      conditions.push('status == $status');
      params.status = status;
    }

    if (startDate) {
      conditions.push('timestamp >= $startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('timestamp <= $endDate');
      params.endDate = endDate;
    }

    const query = `*[${conditions.join(' && ')}] | order(timestamp desc) [${offset}...${offset + limit}]`;

    const logs = await enhancedClient.fetch<AutomationAuditLog[]>(query, params);
    return logs;

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error(`Failed to fetch audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets a summary of audit logs for dashboard display
 */
export async function getAuditLogSummary(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<AuditLogSummary> {
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const startDateISO = startDate.toISOString();

    // Get all logs within the time range
    const logs = await enhancedClient.fetch<AutomationAuditLog[]>(
      `*[_type == "automationAuditLog" && timestamp >= $startDate] | order(timestamp desc)`,
      { startDate: startDateISO }
    );

    // Calculate summary statistics
    const totalLogs = logs.length;
    const successCount = logs.filter(log => log.status === 'success').length;
    const failureCount = logs.filter(log => log.status === 'failed').length;
    const warningCount = logs.filter(log => log.status === 'warning').length;
    const processingCount = logs.filter(log => log.status === 'processing').length;

    // Get recent logs (last 10)
    const recentLogs = logs.slice(0, 10);

    // Analyze errors
    const errorMap = new Map<string, { count: number; lastOccurrence: string }>();
    logs.filter(log => log.error).forEach(log => {
      const error = log.error!;
      const existing = errorMap.get(error);
      if (existing) {
        existing.count++;
        if (log.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = log.timestamp;
        }
      } else {
        errorMap.set(error, { count: 1, lastOccurrence: log.timestamp });
      }
    });

    const errorSummary = Array.from(errorMap.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyze automation performance
    const automationMap = new Map<string, { totalActions: number; successCount: number; lastActivity: string }>();
    logs.filter(log => log.automationId).forEach(log => {
      const automationId = log.automationId!;
      const existing = automationMap.get(automationId);
      if (existing) {
        existing.totalActions++;
        if (log.status === 'success') {
          existing.successCount++;
        }
        if (log.timestamp > existing.lastActivity) {
          existing.lastActivity = log.timestamp;
        }
      } else {
        automationMap.set(automationId, {
          totalActions: 1,
          successCount: log.status === 'success' ? 1 : 0,
          lastActivity: log.timestamp
        });
      }
    });

    const automationSummary = Array.from(automationMap.entries())
      .map(([automationId, data]) => ({
        automationId,
        totalActions: data.totalActions,
        successRate: data.totalActions > 0 ? (data.successCount / data.totalActions) * 100 : 0,
        lastActivity: data.lastActivity
      }))
      .sort((a, b) => b.totalActions - a.totalActions)
      .slice(0, 10);

    return {
      totalLogs,
      successCount,
      failureCount,
      warningCount,
      processingCount,
      recentLogs,
      errorSummary,
      automationSummary
    };

  } catch (error) {
    console.error('Error generating audit log summary:', error);
    throw new Error(`Failed to generate audit log summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets performance metrics for automation system
 */
export async function getAutomationPerformanceMetrics(): Promise<AutomationPerformanceMetrics> {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all logs from the last 30 days
    const logs = await enhancedClient.fetch<AutomationAuditLog[]>(
      `*[_type == "automationAuditLog" && timestamp >= $startDate] | order(timestamp desc)`,
      { startDate: last30Days.toISOString() }
    );

    // Calculate overall metrics
    const totalWebhooksReceived = logs.filter(log => log.type === 'webhook_received').length;
    const totalDraftsCreated = logs.filter(log => log.type === 'draft_created').length;
    const totalDraftsApproved = logs.filter(log => log.type === 'draft_approved').length;
    const totalDraftsRejected = logs.filter(log => log.type === 'draft_rejected').length;

    const successfulActions = logs.filter(log => log.status === 'success').length;
    const failedActions = logs.filter(log => log.status === 'failed').length;
    const totalActions = logs.length;

    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;
    const errorRate = totalActions > 0 ? (failedActions / totalActions) * 100 : 0;

    // Calculate average processing time
    const logsWithDuration = logs.filter(log => log.duration && log.duration > 0);
    const averageProcessingTime = logsWithDuration.length > 0 
      ? logsWithDuration.reduce((sum, log) => sum + log.duration!, 0) / logsWithDuration.length
      : 0;

    // Calculate average validation score
    const validationLogs = logs.filter(log => 
      log.type === 'content_validation' && 
      log.metadata?.score !== undefined
    );
    const averageValidationScore = validationLogs.length > 0
      ? validationLogs.reduce((sum, log) => sum + log.metadata!.score, 0) / validationLogs.length
      : 0;

    // Analyze common errors
    const errorMap = new Map<string, number>();
    logs.filter(log => log.error).forEach(log => {
      const error = log.error!;
      errorMap.set(error, (errorMap.get(error) || 0) + 1);
    });

    const commonErrors = Array.from(errorMap.entries())
      .map(([error, count]) => ({
        error,
        count,
        percentage: totalActions > 0 ? (count / totalActions) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Helper function to calculate metrics for a specific time range
    const calculateTimeRangeMetrics = (hours: number): AutomationPerformanceMetrics => {
      const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
      const rangeLogs = logs.filter(log => new Date(log.timestamp) >= cutoff);
      
      const rangeSuccessful = rangeLogs.filter(log => log.status === 'success').length;
      const rangeFailed = rangeLogs.filter(log => log.status === 'failed').length;
      const rangeTotal = rangeLogs.length;
      
      return {
        averageProcessingTime: 0, // Simplified for time range metrics
        successRate: rangeTotal > 0 ? (rangeSuccessful / rangeTotal) * 100 : 0,
        errorRate: rangeTotal > 0 ? (rangeFailed / rangeTotal) * 100 : 0,
        totalWebhooksReceived: rangeLogs.filter(log => log.type === 'webhook_received').length,
        totalDraftsCreated: rangeLogs.filter(log => log.type === 'draft_created').length,
        totalDraftsApproved: rangeLogs.filter(log => log.type === 'draft_approved').length,
        totalDraftsRejected: rangeLogs.filter(log => log.type === 'draft_rejected').length,
        averageValidationScore: 0, // Simplified for time range metrics
        commonErrors: [],
        timeRangeMetrics: {} as any // Avoid infinite recursion
      };
    };

    return {
      averageProcessingTime,
      successRate,
      errorRate,
      totalWebhooksReceived,
      totalDraftsCreated,
      totalDraftsApproved,
      totalDraftsRejected,
      averageValidationScore,
      commonErrors,
      timeRangeMetrics: {
        last24Hours: calculateTimeRangeMetrics(24),
        last7Days: calculateTimeRangeMetrics(24 * 7),
        last30Days: calculateTimeRangeMetrics(24 * 30)
      }
    };

  } catch (error) {
    console.error('Error calculating automation performance metrics:', error);
    throw new Error(`Failed to calculate performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cleans up old audit logs to prevent database bloat
 */
export async function cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    // Find old logs to delete
    const oldLogs = await enhancedClient.fetch<{ _id: string }[]>(
      `*[_type == "automationAuditLog" && timestamp < $cutoffDate]._id`,
      { cutoffDate: cutoffISO }
    );

    // Delete old logs in batches
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < oldLogs.length; i += batchSize) {
      const batch = oldLogs.slice(i, i + batchSize);
      const deletePromises = batch.map(log => enhancedClient.delete(log._id));
      
      await Promise.all(deletePromises);
      deletedCount += batch.length;
      
      // Log progress for large cleanups
      if (oldLogs.length > batchSize) {
        console.log(`Cleaned up ${deletedCount}/${oldLogs.length} old audit logs`);
      }
    }

    // Log the cleanup action
    await logAutomationAction({
      type: 'system_error', // Using system_error as closest match
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        action: 'cleanup_old_audit_logs',
        deletedCount,
        retentionDays,
        cutoffDate: cutoffISO
      }
    });

    return deletedCount;

  } catch (error) {
    console.error('Error cleaning up old audit logs:', error);
    
    // Log the cleanup failure
    await logAutomationAction({
      type: 'system_error',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      metadata: {
        action: 'cleanup_old_audit_logs',
        retentionDays
      }
    });

    throw new Error(`Failed to cleanup old audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exports audit logs for external analysis or compliance
 */
export async function exportAuditLogs(options: {
  startDate?: string;
  endDate?: string;
  automationId?: string;
  format?: 'json' | 'csv';
} = {}): Promise<string> {
  try {
    const { startDate, endDate, automationId, format = 'json' } = options;

    // Build query conditions
    const conditions: string[] = ['_type == "automationAuditLog"'];
    const params: Record<string, any> = {};

    if (startDate) {
      conditions.push('timestamp >= $startDate');
      params.startDate = startDate;
    }

    if (endDate) {
      conditions.push('timestamp <= $endDate');
      params.endDate = endDate;
    }

    if (automationId) {
      conditions.push('automationId == $automationId');
      params.automationId = automationId;
    }

    const query = `*[${conditions.join(' && ')}] | order(timestamp desc)`;
    const logs = await enhancedClient.fetch<AutomationAuditLog[]>(query, params);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      // Convert to CSV format
      const headers = ['timestamp', 'type', 'automationId', 'status', 'error', 'metadata'];
      const csvRows = [headers.join(',')];
      
      logs.forEach(log => {
        const row = [
          log.timestamp,
          log.type,
          log.automationId || '',
          log.status,
          log.error || '',
          JSON.stringify(log.metadata || {}).replace(/"/g, '""')
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      });
      
      return csvRows.join('\n');
    }

    throw new Error(`Unsupported export format: ${format}`);

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw new Error(`Failed to export audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
