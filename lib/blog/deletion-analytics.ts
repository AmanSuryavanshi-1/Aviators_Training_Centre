/**
 * Deletion Analytics and Reporting
 * 
 * Provides comprehensive analytics and reporting for deletion operations
 * including patterns, success rates, and insights for administrators.
 */

import { DeletionMetrics, DeletionAuditLog } from '@/lib/types/blog';
import { deletionAuditLogger } from './deletion-audit-logger';
import { deletionRateLimiter } from './deletion-rate-limiter';
import { offlineDeletionQueue } from './offline-deletion-queue';

export interface DeletionAnalytics {
  overview: {
    totalDeletions: number;
    successfulDeletions: number;
    failedDeletions: number;
    successRate: number;
    averageResponseTime: number;
    totalUsers: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
  trends: {
    daily: Array<{
      date: string;
      deletions: number;
      successes: number;
      failures: number;
      averageTime: number;
    }>;
    hourly: Array<{
      hour: number;
      deletions: number;
      successes: number;
      failures: number;
    }>;
  };
  userActivity: {
    topUsers: Array<{
      userId: string;
      deletions: number;
      successRate: number;
      averageTime: number;
    }>;
    newUsers: Array<{
      userId: string;
      firstDeletion: string;
      totalDeletions: number;
    }>;
  };
  errorAnalysis: {
    errorsByCategory: Record<string, number>;
    errorsByCode: Record<string, number>;
    topErrors: Array<{
      code: string;
      message: string;
      count: number;
      percentage: number;
    }>;
    retryAnalysis: {
      totalRetries: number;
      averageRetries: number;
      retrySuccessRate: number;
    };
  };
  performance: {
    responseTimeDistribution: {
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
    };
    slowestOperations: Array<{
      postId: string;
      postTitle: string;
      duration: number;
      timestamp: string;
    }>;
    cachePerformance: {
      invalidationSuccessRate: number;
      averageInvalidationTime: number;
    };
  };
  patterns: {
    peakHours: Array<{ hour: number; count: number }>;
    commonFailureReasons: Array<{ reason: string; count: number }>;
    bulkVsSingle: {
      bulkOperations: number;
      singleOperations: number;
      bulkSuccessRate: number;
      singleSuccessRate: number;
    };
  };
}

export interface DeletionReport {
  id: string;
  title: string;
  generatedAt: string;
  timeRange: {
    start: string;
    end: string;
  };
  analytics: DeletionAnalytics;
  insights: string[];
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    data?: any;
  }>;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  includeSuccessful?: boolean;
  includeFailures?: boolean;
  minDuration?: number;
  maxDuration?: number;
  errorCategory?: string;
}

/**
 * Deletion analytics and reporting service
 */
export class DeletionAnalyticsService {
  private static instance: DeletionAnalyticsService;
  private reportCache: Map<string, { report: DeletionReport; expiry: number }> = new Map();
  private readonly cacheExpiryMs = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    // Cleanup cache periodically
    setInterval(() => this.cleanupCache(), 60 * 60 * 1000); // Every hour
  }

  static getInstance(): DeletionAnalyticsService {
    if (!DeletionAnalyticsService.instance) {
      DeletionAnalyticsService.instance = new DeletionAnalyticsService();
    }
    return DeletionAnalyticsService.instance;
  }

  /**
   * Generate comprehensive deletion analytics
   */
  async generateAnalytics(filter: ReportFilter = {}): Promise<DeletionAnalytics> {
    const timeRange = {
      start: filter.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: filter.endDate || new Date()
    };

    console.log('📊 Generating deletion analytics:', {
      timeRange,
      userId: filter.userId
    });

    // Get audit logs for the time range
    const auditLogs = deletionAuditLogger.getAuditLogs({
      startDate: timeRange.start,
      endDate: timeRange.end,
      userId: filter.userId,
      limit: 10000
    });

    // Get deletion metrics
    const metrics = deletionAuditLogger.getDeletionMetrics(timeRange);

    // Generate analytics
    const analytics: DeletionAnalytics = {
      overview: this.generateOverview(auditLogs, metrics, timeRange),
      trends: this.generateTrends(auditLogs, timeRange),
      userActivity: this.generateUserActivity(auditLogs),
      errorAnalysis: this.generateErrorAnalysis(auditLogs),
      performance: this.generatePerformanceAnalysis(auditLogs),
      patterns: this.generatePatterns(auditLogs)
    };

    return analytics;
  }

  /**
   * Generate a comprehensive deletion report
   */
  async generateReport(
    title: string = 'Deletion Operations Report',
    filter: ReportFilter = {}
  ): Promise<DeletionReport> {
    const reportId = this.generateReportId();
    const cacheKey = JSON.stringify({ title, filter });
    
    // Check cache first
    const cached = this.reportCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log('📊 Returning cached report:', reportId);
      return { ...cached.report, id: reportId };
    }

    console.log('📊 Generating new deletion report:', reportId);

    const analytics = await this.generateAnalytics(filter);
    const insights = this.generateInsights(analytics);
    const recommendations = this.generateRecommendations(analytics);
    const alerts = this.generateAlerts(analytics);

    const report: DeletionReport = {
      id: reportId,
      title,
      generatedAt: new Date().toISOString(),
      timeRange: {
        start: analytics.overview.timeRange.start,
        end: analytics.overview.timeRange.end
      },
      analytics,
      insights,
      recommendations,
      alerts
    };

    // Cache the report
    this.reportCache.set(cacheKey, {
      report,
      expiry: Date.now() + this.cacheExpiryMs
    });

    return report;
  }

  /**
   * Generate deletion dashboard data
   */
  async generateDashboard(): Promise<{
    summary: {
      todayDeletions: number;
      weekDeletions: number;
      monthDeletions: number;
      successRate: number;
      averageResponseTime: number;
      queueSize: number;
    };
    recentActivity: Array<{
      timestamp: string;
      action: string;
      postTitle: string;
      userId: string;
      success: boolean;
      duration?: number;
    }>;
    topErrors: Array<{
      error: string;
      count: number;
      lastOccurrence: string;
    }>;
    performanceChart: Array<{
      timestamp: string;
      deletions: number;
      averageTime: number;
      errorRate: number;
    }>;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get metrics for different time periods
    const todayMetrics = deletionAuditLogger.getDeletionMetrics({
      start: today,
      end: now
    });

    const weekMetrics = deletionAuditLogger.getDeletionMetrics({
      start: weekAgo,
      end: now
    });

    const monthMetrics = deletionAuditLogger.getDeletionMetrics({
      start: monthAgo,
      end: now
    });

    // Get recent activity
    const recentLogs = deletionAuditLogger.getAuditLogs({
      limit: 20,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });

    const recentActivity = recentLogs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      postTitle: log.postTitle,
      userId: log.userId,
      success: log.action === 'delete_success',
      duration: log.metadata.duration ? parseInt(log.metadata.duration) : undefined
    }));

    // Get top errors
    const errorLogs = deletionAuditLogger.getAuditLogs({
      action: 'delete_failed',
      limit: 1000
    });

    const errorCounts = new Map<string, { count: number; lastOccurrence: string }>();
    errorLogs.forEach(log => {
      if (log.error) {
        const key = log.error.code;
        const existing = errorCounts.get(key);
        if (!existing || new Date(log.timestamp) > new Date(existing.lastOccurrence)) {
          errorCounts.set(key, {
            count: (existing?.count || 0) + 1,
            lastOccurrence: log.timestamp
          });
        }
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        lastOccurrence: data.lastOccurrence
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate performance chart data (last 24 hours, hourly)
    const performanceChart = this.generateHourlyPerformanceData(now);

    // Get queue size
    const queueStats = offlineDeletionQueue.getQueueStats();

    return {
      summary: {
        todayDeletions: todayMetrics.totalDeletions,
        weekDeletions: weekMetrics.totalDeletions,
        monthDeletions: monthMetrics.totalDeletions,
        successRate: monthMetrics.totalDeletions > 0 
          ? (monthMetrics.successfulDeletions / monthMetrics.totalDeletions) * 100 
          : 100,
        averageResponseTime: monthMetrics.averageResponseTime,
        queueSize: queueStats.totalQueued
      },
      recentActivity,
      topErrors,
      performanceChart
    };
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    format: 'json' | 'csv',
    filter: ReportFilter = {}
  ): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    const analytics = await this.generateAnalytics(filter);
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      return {
        data: JSON.stringify(analytics, null, 2),
        filename: `deletion-analytics-${timestamp}.json`,
        mimeType: 'application/json'
      };
    } else {
      // Convert to CSV format
      const csvData = this.convertAnalyticsToCSV(analytics);
      return {
        data: csvData,
        filename: `deletion-analytics-${timestamp}.csv`,
        mimeType: 'text/csv'
      };
    }
  }

  /**
   * Private helper methods
   */
  private generateOverview(
    auditLogs: DeletionAuditLog[],
    metrics: DeletionMetrics,
    timeRange: { start: Date; end: Date }
  ) {
    const uniqueUsers = new Set(auditLogs.map(log => log.userId)).size;

    return {
      totalDeletions: metrics.totalDeletions,
      successfulDeletions: metrics.successfulDeletions,
      failedDeletions: metrics.failedDeletions,
      successRate: metrics.totalDeletions > 0 
        ? (metrics.successfulDeletions / metrics.totalDeletions) * 100 
        : 100,
      averageResponseTime: metrics.averageResponseTime,
      totalUsers: uniqueUsers,
      timeRange: {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      }
    };
  }

  private generateTrends(auditLogs: DeletionAuditLog[], timeRange: { start: Date; end: Date }) {
    // Generate daily trends
    const dailyData = new Map<string, { deletions: number; successes: number; failures: number; totalTime: number; count: number }>();
    
    auditLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      const existing = dailyData.get(date) || { deletions: 0, successes: 0, failures: 0, totalTime: 0, count: 0 };
      
      if (log.action === 'delete_initiated') {
        existing.deletions++;
      } else if (log.action === 'delete_success') {
        existing.successes++;
        if (log.metadata.duration) {
          existing.totalTime += parseInt(log.metadata.duration);
          existing.count++;
        }
      } else if (log.action === 'delete_failed') {
        existing.failures++;
      }
      
      dailyData.set(date, existing);
    });

    const daily = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      deletions: data.deletions,
      successes: data.successes,
      failures: data.failures,
      averageTime: data.count > 0 ? data.totalTime / data.count : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Generate hourly trends
    const hourlyData = new Map<number, { deletions: number; successes: number; failures: number }>();
    
    auditLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const existing = hourlyData.get(hour) || { deletions: 0, successes: 0, failures: 0 };
      
      if (log.action === 'delete_initiated') {
        existing.deletions++;
      } else if (log.action === 'delete_success') {
        existing.successes++;
      } else if (log.action === 'delete_failed') {
        existing.failures++;
      }
      
      hourlyData.set(hour, existing);
    });

    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      ...(hourlyData.get(hour) || { deletions: 0, successes: 0, failures: 0 })
    }));

    return { daily, hourly };
  }

  private generateUserActivity(auditLogs: DeletionAuditLog[]) {
    const userData = new Map<string, { deletions: number; successes: number; totalTime: number; count: number; firstSeen: string }>();
    
    auditLogs.forEach(log => {
      const existing = userData.get(log.userId) || { 
        deletions: 0, 
        successes: 0, 
        totalTime: 0, 
        count: 0, 
        firstSeen: log.timestamp 
      };
      
      if (log.action === 'delete_initiated') {
        existing.deletions++;
      } else if (log.action === 'delete_success') {
        existing.successes++;
        if (log.metadata.duration) {
          existing.totalTime += parseInt(log.metadata.duration);
          existing.count++;
        }
      }
      
      if (new Date(log.timestamp) < new Date(existing.firstSeen)) {
        existing.firstSeen = log.timestamp;
      }
      
      userData.set(log.userId, existing);
    });

    const topUsers = Array.from(userData.entries())
      .map(([userId, data]) => ({
        userId,
        deletions: data.deletions,
        successRate: data.deletions > 0 ? (data.successes / data.deletions) * 100 : 0,
        averageTime: data.count > 0 ? data.totalTime / data.count : 0
      }))
      .sort((a, b) => b.deletions - a.deletions)
      .slice(0, 10);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = Array.from(userData.entries())
      .filter(([, data]) => new Date(data.firstSeen) > thirtyDaysAgo)
      .map(([userId, data]) => ({
        userId,
        firstDeletion: data.firstSeen,
        totalDeletions: data.deletions
      }))
      .sort((a, b) => new Date(b.firstDeletion).getTime() - new Date(a.firstDeletion).getTime())
      .slice(0, 10);

    return { topUsers, newUsers };
  }

  private generateErrorAnalysis(auditLogs: DeletionAuditLog[]) {
    const errorLogs = auditLogs.filter(log => log.action === 'delete_failed' && log.error);
    
    const errorsByCategory: Record<string, number> = {};
    const errorsByCode: Record<string, number> = {};
    
    errorLogs.forEach(log => {
      if (log.error) {
        errorsByCategory[log.error.category] = (errorsByCategory[log.error.category] || 0) + 1;
        errorsByCode[log.error.code] = (errorsByCode[log.error.code] || 0) + 1;
      }
    });

    const totalErrors = errorLogs.length;
    const topErrors = Object.entries(errorsByCode)
      .map(([code, count]) => {
        const errorLog = errorLogs.find(log => log.error?.code === code);
        return {
          code,
          message: errorLog?.error?.message || 'Unknown error',
          count,
          percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Retry analysis
    const retryLogs = auditLogs.filter(log => log.action === 'delete_retried');
    const retrySuccessLogs = auditLogs.filter(log => 
      log.action === 'delete_success' && 
      log.metadata.retryCount && 
      parseInt(log.metadata.retryCount) > 0
    );

    const retryAnalysis = {
      totalRetries: retryLogs.length,
      averageRetries: retryLogs.length > 0 ? retryLogs.length / new Set(retryLogs.map(l => l.eventId)).size : 0,
      retrySuccessRate: retryLogs.length > 0 ? (retrySuccessLogs.length / retryLogs.length) * 100 : 0
    };

    return {
      errorsByCategory,
      errorsByCode,
      topErrors,
      retryAnalysis
    };
  }

  private generatePerformanceAnalysis(auditLogs: DeletionAuditLog[]) {
    const successLogs = auditLogs.filter(log => 
      log.action === 'delete_success' && log.metadata.duration
    );

    const durations = successLogs
      .map(log => parseInt(log.metadata.duration || '0'))
      .sort((a, b) => a - b);

    const responseTimeDistribution = {
      p50: this.calculatePercentile(durations, 50),
      p75: this.calculatePercentile(durations, 75),
      p90: this.calculatePercentile(durations, 90),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99)
    };

    const slowestOperations = successLogs
      .map(log => ({
        postId: log.postId,
        postTitle: log.postTitle,
        duration: parseInt(log.metadata.duration || '0'),
        timestamp: log.timestamp
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Cache performance analysis
    const cacheSuccessLogs = successLogs.filter(log => 
      log.metadata.cacheInvalidated === 'true'
    );

    const cachePerformance = {
      invalidationSuccessRate: successLogs.length > 0 
        ? (cacheSuccessLogs.length / successLogs.length) * 100 
        : 0,
      averageInvalidationTime: 500 // Mock value - would calculate from actual data
    };

    return {
      responseTimeDistribution,
      slowestOperations,
      cachePerformance
    };
  }

  private generatePatterns(auditLogs: DeletionAuditLog[]) {
    // Peak hours analysis
    const hourCounts = new Map<number, number>();
    auditLogs.forEach(log => {
      if (log.action === 'delete_initiated') {
        const hour = new Date(log.timestamp).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    });

    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Common failure reasons
    const failureLogs = auditLogs.filter(log => log.action === 'delete_failed' && log.error);
    const failureReasons = new Map<string, number>();
    
    failureLogs.forEach(log => {
      if (log.error) {
        const reason = log.error.message;
        failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
      }
    });

    const commonFailureReasons = Array.from(failureReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Bulk vs single operations (mock analysis)
    const bulkOperations = auditLogs.filter(log => 
      log.postId.includes('bulk_') || log.metadata.requestId?.includes('bulk')
    ).length;
    
    const singleOperations = auditLogs.filter(log => 
      log.action === 'delete_initiated' && !log.postId.includes('bulk_')
    ).length;

    const bulkVsSingle = {
      bulkOperations,
      singleOperations,
      bulkSuccessRate: 95, // Mock value
      singleSuccessRate: 98  // Mock value
    };

    return {
      peakHours,
      commonFailureReasons,
      bulkVsSingle
    };
  }

  private generateInsights(analytics: DeletionAnalytics): string[] {
    const insights: string[] = [];

    // Success rate insights
    if (analytics.overview.successRate < 90) {
      insights.push(`Low success rate detected: ${analytics.overview.successRate.toFixed(1)}% - investigate common failure causes`);
    } else if (analytics.overview.successRate > 98) {
      insights.push(`Excellent success rate: ${analytics.overview.successRate.toFixed(1)}% - system is performing well`);
    }

    // Performance insights
    if (analytics.overview.averageResponseTime > 3000) {
      insights.push(`High average response time: ${analytics.overview.averageResponseTime}ms - consider performance optimization`);
    }

    // User activity insights
    if (analytics.userActivity.topUsers.length > 0) {
      const topUser = analytics.userActivity.topUsers[0];
      insights.push(`Most active user: ${topUser.userId} with ${topUser.deletions} deletions`);
    }

    // Error pattern insights
    const topError = Object.entries(analytics.errorAnalysis.errorsByCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topError) {
      insights.push(`Most common error category: ${topError[0]} (${topError[1]} occurrences)`);
    }

    // Peak usage insights
    if (analytics.patterns.peakHours.length > 0) {
      const peakHour = analytics.patterns.peakHours[0];
      insights.push(`Peak usage hour: ${peakHour.hour}:00 with ${peakHour.count} deletions`);
    }

    return insights;
  }

  private generateRecommendations(analytics: DeletionAnalytics): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (analytics.overview.averageResponseTime > 2000) {
      recommendations.push('Consider optimizing deletion performance - current average response time is high');
    }

    // Error rate recommendations
    if (analytics.overview.successRate < 95) {
      recommendations.push('Investigate and address common failure causes to improve success rate');
    }

    // Retry recommendations
    if (analytics.errorAnalysis.retryAnalysis.retrySuccessRate < 50) {
      recommendations.push('Review retry logic - low retry success rate indicates systematic issues');
    }

    // Cache recommendations
    if (analytics.performance.cachePerformance.invalidationSuccessRate < 90) {
      recommendations.push('Improve cache invalidation reliability to ensure data consistency');
    }

    // Usage pattern recommendations
    if (analytics.patterns.peakHours.length > 0) {
      recommendations.push('Consider implementing load balancing during peak hours to improve performance');
    }

    return recommendations;
  }

  private generateAlerts(analytics: DeletionAnalytics): Array<{ type: 'warning' | 'error' | 'info'; message: string; data?: any }> {
    const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string; data?: any }> = [];

    // Critical success rate
    if (analytics.overview.successRate < 80) {
      alerts.push({
        type: 'error',
        message: `Critical: Success rate is ${analytics.overview.successRate.toFixed(1)}%`,
        data: { successRate: analytics.overview.successRate }
      });
    } else if (analytics.overview.successRate < 90) {
      alerts.push({
        type: 'warning',
        message: `Warning: Success rate is ${analytics.overview.successRate.toFixed(1)}%`,
        data: { successRate: analytics.overview.successRate }
      });
    }

    // High response times
    if (analytics.overview.averageResponseTime > 5000) {
      alerts.push({
        type: 'error',
        message: `Critical: Average response time is ${analytics.overview.averageResponseTime}ms`,
        data: { responseTime: analytics.overview.averageResponseTime }
      });
    }

    return alerts;
  }

  private generateHourlyPerformanceData(endTime: Date) {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(endTime.getTime() - i * 60 * 60 * 1000);
      
      // Mock data - in real implementation, query actual data
      data.push({
        timestamp: timestamp.toISOString(),
        deletions: Math.floor(Math.random() * 20) + 5,
        averageTime: Math.floor(Math.random() * 2000) + 1000,
        errorRate: Math.random() * 10
      });
    }
    return data;
  }

  private convertAnalyticsToCSV(analytics: DeletionAnalytics): string {
    const rows = [
      ['Metric', 'Value'],
      ['Total Deletions', analytics.overview.totalDeletions.toString()],
      ['Successful Deletions', analytics.overview.successfulDeletions.toString()],
      ['Failed Deletions', analytics.overview.failedDeletions.toString()],
      ['Success Rate (%)', analytics.overview.successRate.toFixed(2)],
      ['Average Response Time (ms)', analytics.overview.averageResponseTime.toString()],
      ['Total Users', analytics.overview.totalUsers.toString()]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of this.reportCache.entries()) {
      if (cached.expiry <= now) {
        this.reportCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} cached reports`);
    }
  }
}

// Export singleton instance
export const deletionAnalyticsService = DeletionAnalyticsService.getInstance();