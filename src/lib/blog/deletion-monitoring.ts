/**
 * Deletion Operation Monitoring and Alerting
 * 
 * Monitors deletion operations for health, performance, and failure patterns.
 * Provides alerting for critical issues and performance degradation.
 */

import { DeletionMetrics, DeletionEvent, DeletionAuditLog } from '@/lib/types/blog';
import { deletionAuditLogger } from './deletion-audit-logger';
import { offlineDeletionQueue } from './offline-deletion-queue';

export interface MonitoringAlert {
  id: string;
  type: 'error_rate' | 'performance' | 'queue_size' | 'network' | 'critical_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
  acknowledged?: boolean;
  resolvedAt?: string;
}

export interface MonitoringThresholds {
  errorRatePercent: number;
  averageResponseTimeMs: number;
  queueSizeLimit: number;
  consecutiveFailures: number;
  offlineQueueAge: number; // minutes
}

export interface DeletionHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  errorRate: number;
  averageResponseTime: number;
  queueHealth: {
    size: number;
    oldestAge: number;
    processingRate: number;
  };
  recentFailures: number;
  networkStatus: 'online' | 'offline' | 'unstable';
  lastChecked: string;
  alerts: MonitoringAlert[];
}

export interface PerformanceMetrics {
  successRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // deletions per minute
  errorsByCategory: Record<string, number>;
  retryRate: number;
  cacheInvalidationRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Deletion monitoring service
 */
export class DeletionMonitoringService {
  private static instance: DeletionMonitoringService;
  private alerts: Map<string, MonitoringAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly monitoringIntervalMs = 60000; // 1 minute
  private readonly alertRetentionDays = 7;
  
  private thresholds: MonitoringThresholds = {
    errorRatePercent: 10, // Alert if error rate > 10%
    averageResponseTimeMs: 5000, // Alert if avg response time > 5s
    queueSizeLimit: 100, // Alert if queue size > 100
    consecutiveFailures: 5, // Alert after 5 consecutive failures
    offlineQueueAge: 30 // Alert if oldest queued item > 30 minutes
  };

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): DeletionMonitoringService {
    if (!DeletionMonitoringService.instance) {
      DeletionMonitoringService.instance = new DeletionMonitoringService();
    }
    return DeletionMonitoringService.instance;
  }

  /**
   * Get current deletion health status
   */
  async getDeletionHealthStatus(): Promise<DeletionHealthStatus> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent metrics
    const metrics = deletionAuditLogger.getDeletionMetrics({
      start: oneHourAgo,
      end: now
    });

    // Get queue stats
    const queueStats = offlineDeletionQueue.getQueueStats();
    
    // Calculate error rate
    const errorRate = metrics.totalDeletions > 0 
      ? (metrics.failedDeletions / metrics.totalDeletions) * 100 
      : 0;

    // Calculate queue age
    const oldestAge = queueStats.oldestQueuedAt 
      ? (Date.now() - new Date(queueStats.oldestQueuedAt).getTime()) / (1000 * 60)
      : 0;

    // Get recent failures
    const recentEvents = deletionAuditLogger.getAllDeletionEvents()
      .filter(event => 
        new Date(event.timestamp) > oneHourAgo && 
        event.status === 'failed'
      );

    // Determine network status
    const networkStatus = offlineDeletionQueue.isNetworkOnline() 
      ? (queueStats.pendingCount > 0 ? 'unstable' : 'online')
      : 'offline';

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (errorRate > this.thresholds.errorRatePercent || 
        metrics.averageResponseTime > this.thresholds.averageResponseTimeMs ||
        queueStats.totalQueued > this.thresholds.queueSizeLimit) {
      overall = 'unhealthy';
    } else if (errorRate > this.thresholds.errorRatePercent / 2 ||
               metrics.averageResponseTime > this.thresholds.averageResponseTimeMs / 2 ||
               networkStatus === 'unstable') {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      errorRate,
      averageResponseTime: metrics.averageResponseTime,
      queueHealth: {
        size: queueStats.totalQueued,
        oldestAge,
        processingRate: this.calculateProcessingRate()
      },
      recentFailures: recentEvents.length,
      networkStatus,
      lastChecked: new Date().toISOString(),
      alerts: Array.from(this.alerts.values())
        .filter(alert => !alert.acknowledged)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    };
  }

  /**
   * Get detailed performance metrics
   */
  async getPerformanceMetrics(timeRange?: {
    start: Date;
    end: Date;
  }): Promise<PerformanceMetrics> {
    const range = timeRange || {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      end: new Date()
    };

    const metrics = deletionAuditLogger.getDeletionMetrics(range);
    const auditLogs = deletionAuditLogger.getAuditLogs({
      startDate: range.start,
      endDate: range.end,
      limit: 1000
    });

    // Calculate success rate
    const successRate = metrics.totalDeletions > 0 
      ? (metrics.successfulDeletions / metrics.totalDeletions) * 100 
      : 100;

    // Calculate response time percentiles
    const responseTimes = auditLogs
      .filter(log => log.action === 'delete_success' && log.metadata.duration)
      .map(log => parseInt(log.metadata.duration || '0'))
      .sort((a, b) => a - b);

    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    // Calculate throughput (deletions per minute)
    const timeRangeMinutes = (range.end.getTime() - range.start.getTime()) / (1000 * 60);
    const throughput = timeRangeMinutes > 0 ? metrics.totalDeletions / timeRangeMinutes : 0;

    return {
      successRate,
      averageResponseTime: metrics.averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      throughput,
      errorsByCategory: metrics.errorsByCategory,
      retryRate: metrics.retryRate,
      cacheInvalidationRate: metrics.cacheInvalidationSuccessRate,
      timeRange: {
        start: range.start.toISOString(),
        end: range.end.toISOString()
      }
    };
  }

  /**
   * Check for issues and generate alerts
   */
  async checkForIssues(): Promise<MonitoringAlert[]> {
    const newAlerts: MonitoringAlert[] = [];
    const healthStatus = await this.getDeletionHealthStatus();

    // Check error rate
    if (healthStatus.errorRate > this.thresholds.errorRatePercent) {
      const alert = this.createAlert(
        'error_rate',
        'high',
        'High Deletion Error Rate',
        `Deletion error rate is ${healthStatus.errorRate.toFixed(1)}%, exceeding threshold of ${this.thresholds.errorRatePercent}%`,
        { errorRate: healthStatus.errorRate, threshold: this.thresholds.errorRatePercent }
      );
      newAlerts.push(alert);
    }

    // Check response time
    if (healthStatus.averageResponseTime > this.thresholds.averageResponseTimeMs) {
      const alert = this.createAlert(
        'performance',
        'medium',
        'Slow Deletion Performance',
        `Average deletion response time is ${healthStatus.averageResponseTime}ms, exceeding threshold of ${this.thresholds.averageResponseTimeMs}ms`,
        { responseTime: healthStatus.averageResponseTime, threshold: this.thresholds.averageResponseTimeMs }
      );
      newAlerts.push(alert);
    }

    // Check queue size
    if (healthStatus.queueHealth.size > this.thresholds.queueSizeLimit) {
      const alert = this.createAlert(
        'queue_size',
        'high',
        'Large Deletion Queue',
        `Offline deletion queue has ${healthStatus.queueHealth.size} items, exceeding threshold of ${this.thresholds.queueSizeLimit}`,
        { queueSize: healthStatus.queueHealth.size, threshold: this.thresholds.queueSizeLimit }
      );
      newAlerts.push(alert);
    }

    // Check queue age
    if (healthStatus.queueHealth.oldestAge > this.thresholds.offlineQueueAge) {
      const alert = this.createAlert(
        'queue_size',
        'medium',
        'Stale Queued Deletions',
        `Oldest queued deletion is ${Math.round(healthStatus.queueHealth.oldestAge)} minutes old, exceeding threshold of ${this.thresholds.offlineQueueAge} minutes`,
        { queueAge: healthStatus.queueHealth.oldestAge, threshold: this.thresholds.offlineQueueAge }
      );
      newAlerts.push(alert);
    }

    // Check network status
    if (healthStatus.networkStatus === 'offline') {
      const alert = this.createAlert(
        'network',
        'critical',
        'Network Offline',
        'Deletion service is offline - queued deletions cannot be processed',
        { networkStatus: healthStatus.networkStatus }
      );
      newAlerts.push(alert);
    }

    // Check for consecutive failures
    const recentFailures = await this.getConsecutiveFailures();
    if (recentFailures >= this.thresholds.consecutiveFailures) {
      const alert = this.createAlert(
        'critical_failure',
        'critical',
        'Consecutive Deletion Failures',
        `${recentFailures} consecutive deletion failures detected - system may be experiencing critical issues`,
        { consecutiveFailures: recentFailures, threshold: this.thresholds.consecutiveFailures }
      );
      newAlerts.push(alert);
    }

    // Store new alerts
    newAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });

    // Clean up old alerts
    this.cleanupOldAlerts();

    return newAlerts;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log('✅ Alert acknowledged:', alertId);
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date().toISOString();
      console.log('✅ Alert resolved:', alertId);
      return true;
    }
    return false;
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): MonitoringAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): MonitoringAlert[] {
    return this.getAllAlerts().filter(alert => !alert.resolvedAt);
  }

  /**
   * Update monitoring thresholds
   */
  updateThresholds(newThresholds: Partial<MonitoringThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Monitoring thresholds updated:', this.thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): MonitoringThresholds {
    return { ...this.thresholds };
  }

  /**
   * Generate monitoring report
   */
  async generateMonitoringReport(): Promise<{
    healthStatus: DeletionHealthStatus;
    performanceMetrics: PerformanceMetrics;
    alerts: MonitoringAlert[];
    recommendations: string[];
  }> {
    const healthStatus = await this.getDeletionHealthStatus();
    const performanceMetrics = await this.getPerformanceMetrics();
    const alerts = this.getActiveAlerts();
    const recommendations = this.generateRecommendations(healthStatus, performanceMetrics);

    return {
      healthStatus,
      performanceMetrics,
      alerts,
      recommendations
    };
  }

  /**
   * Private helper methods
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        const newAlerts = await this.checkForIssues();
        if (newAlerts.length > 0) {
          console.log(`🚨 Generated ${newAlerts.length} new monitoring alerts`);
          // In a real implementation, you might send notifications here
          this.sendAlertNotifications(newAlerts);
        }
      } catch (error) {
        console.error('Error in monitoring check:', error);
      }
    }, this.monitoringIntervalMs);

    console.log('📊 Deletion monitoring started');
  }

  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📊 Deletion monitoring stopped');
    }
  }

  private createAlert(
    type: MonitoringAlert['type'],
    severity: MonitoringAlert['severity'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): MonitoringAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      data,
      acknowledged: false
    };
  }

  private async getConsecutiveFailures(): Promise<number> {
    const recentEvents = deletionAuditLogger.getAllDeletionEvents()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20); // Check last 20 events

    let consecutiveFailures = 0;
    for (const event of recentEvents) {
      if (event.status === 'failed') {
        consecutiveFailures++;
      } else if (event.status === 'success') {
        break;
      }
    }

    return consecutiveFailures;
  }

  private calculateProcessingRate(): number {
    // Mock calculation - in a real implementation, track actual processing rate
    const queueStats = offlineDeletionQueue.getQueueStats();
    return queueStats.totalQueued > 0 ? 2.5 : 0; // 2.5 deletions per minute
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  private generateRecommendations(
    healthStatus: DeletionHealthStatus,
    performanceMetrics: PerformanceMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (healthStatus.errorRate > 5) {
      recommendations.push('Investigate high error rate - check network connectivity and Sanity service status');
    }

    if (healthStatus.averageResponseTime > 3000) {
      recommendations.push('Optimize deletion performance - consider reducing retry delays or improving network conditions');
    }

    if (healthStatus.queueHealth.size > 50) {
      recommendations.push('Process offline deletion queue - check network connectivity and manually trigger queue processing');
    }

    if (performanceMetrics.retryRate > 20) {
      recommendations.push('High retry rate detected - investigate underlying causes of deletion failures');
    }

    if (performanceMetrics.cacheInvalidationRate < 90) {
      recommendations.push('Cache invalidation issues detected - verify cache configuration and network connectivity');
    }

    if (healthStatus.networkStatus === 'offline') {
      recommendations.push('Network connectivity issues - check internet connection and Sanity service availability');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating normally - no immediate action required');
    }

    return recommendations;
  }

  private sendAlertNotifications(alerts: MonitoringAlert[]): void {
    // In a real implementation, send notifications via email, Slack, etc.
    alerts.forEach(alert => {
      console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.title} - ${alert.message}`);
    });
  }

  private cleanupOldAlerts(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.alertRetentionDays);

    let cleanedCount = 0;
    for (const [alertId, alert] of this.alerts.entries()) {
      if (new Date(alert.timestamp) < cutoffDate) {
        this.alerts.delete(alertId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old monitoring alerts`);
    }
  }

  /**
   * Cleanup method for graceful shutdown
   */
  destroy(): void {
    this.stopMonitoring();
    console.log('🛑 Deletion monitoring service destroyed');
  }
}

// Export singleton instance
export const deletionMonitoringService = DeletionMonitoringService.getInstance();
