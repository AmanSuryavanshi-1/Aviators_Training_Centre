'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Bell,
  Settings
} from 'lucide-react';

// Types for the monitoring data
interface AuditLogSummary {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  processingCount: number;
  recentLogs: AuditLog[];
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

interface AuditLog {
  _id: string;
  type: string;
  automationId?: string;
  status: 'success' | 'failed' | 'processing' | 'warning';
  timestamp: string;
  error?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
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
}

interface ErrorStatistics {
  totalErrors: number;
  errorsBySeverity: Record<string, number>;
  errorsByCategory: Record<string, number>;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    severity: string;
  }>;
  resolutionStats: {
    resolved: number;
    pending: number;
    investigating: number;
    ignored: number;
  };
}

export default function AutomationMonitoringDashboard() {
  const [auditSummary, setAuditSummary] = useState<AuditLogSummary | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch audit log summary
      const auditResponse = await fetch(`/api/n8n/monitoring/audit-summary?timeRange=${timeRange}`);
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditSummary(auditData);
      }

      // Fetch performance metrics
      const performanceResponse = await fetch('/api/n8n/monitoring/performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceMetrics(performanceData);
      }

      // Fetch error statistics
      const errorResponse = await fetch(`/api/n8n/monitoring/errors?timeRange=${timeRange}`);
      if (errorResponse.ok) {
        const errorData = await errorResponse.json();
        setErrorStats(errorData);
      }

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  // Export audit logs
  const exportAuditLogs = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/n8n/monitoring/export?format=${format}&timeRange=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${timeRange}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading && !auditSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor N8N automation performance, errors, and audit logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Bell className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-500'}`} />
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMonitoringData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAuditLogs('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Time Range:</span>
        <div className="flex space-x-1">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      {auditSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditSummary.totalLogs > 0 
                  ? Math.round((auditSummary.successCount / auditSummary.totalLogs) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {auditSummary.successCount} successful actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failures</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {auditSummary.failureCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {auditSummary.totalLogs > 0 
                  ? Math.round((auditSummary.failureCount / auditSummary.totalLogs) * 100)
                  : 0}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditSummary.automationSummary.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique automation workflows
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        {/* Recent Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>
                Latest automation actions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditSummary?.recentLogs.length ? (
                <div className="space-y-2">
                  {auditSummary.recentLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="font-medium">
                            {log.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.automationId && `ID: ${log.automationId}`}
                            {log.error && ` • Error: ${log.error.substring(0, 50)}...`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent logs found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Analysis Tab */}
        <TabsContent value="errors" className="space-y-4">
          {errorStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {errorStats.totalErrors}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {errorStats.errorRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Resolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {errorStats.resolutionStats.pending}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Errors</CardTitle>
                  <CardDescription>Most frequent error messages</CardDescription>
                </CardHeader>
                <CardContent>
                  {errorStats.topErrors.length ? (
                    <div className="space-y-2">
                      {errorStats.topErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {error.message.substring(0, 80)}...
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {error.severity}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{error.count}</div>
                            <div className="text-xs text-muted-foreground">occurrences</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No errors found in the selected time range
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(performanceMetrics.averageProcessingTime)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Webhooks Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.totalWebhooksReceived}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Drafts Created</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceMetrics.totalDraftsCreated}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Validation Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {performanceMetrics.averageValidationScore.toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Common Errors</CardTitle>
                  <CardDescription>Most frequent error types and their impact</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceMetrics.commonErrors.length ? (
                    <div className="space-y-2">
                      {performanceMetrics.commonErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {error.error.substring(0, 60)}...
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{error.count}</div>
                            <div className="text-xs text-muted-foreground">
                              {error.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No common errors found
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Performance</CardTitle>
              <CardDescription>
                Performance metrics for individual automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditSummary?.automationSummary.length ? (
                <div className="space-y-2">
                  {auditSummary.automationSummary.map((automation) => (
                    <div
                      key={automation.automationId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{automation.automationId}</div>
                        <div className="text-sm text-muted-foreground">
                          {automation.totalActions} total actions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {automation.successRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {formatTimestamp(automation.lastActivity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No automation data found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}