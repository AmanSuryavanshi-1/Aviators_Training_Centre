/**
 * Studio Health Monitor Component
 * Displays real-time studio health monitoring and alerts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Play,
  Pause,
  TrendingUp,
  Clock,
  Zap,
  Bell,
  BellOff
} from 'lucide-react';
import { 
  studioMonitor, 
  StudioHealthReport, 
  HealthMetric, 
  MonitoringAlert 
} from '@/lib/monitoring/studioMonitor';

export default function StudioHealthMonitor() {
  const [healthReport, setHealthReport] = useState<StudioHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<{
    isActive: boolean;
    lastCheck?: Date;
    totalMetrics: number;
    totalAlerts: number;
  }>({ isActive: false, totalMetrics: 0, totalAlerts: 0 });
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Initial load
    loadHealthReport();
    updateMonitoringStatus();

    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadHealthReport();
        updateMonitoringStatus();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthReport = async () => {
    setIsLoading(true);
    try {
      const report = await studioMonitor.performHealthCheck();
      setHealthReport(report);
    } catch (error) {
      console.error('Failed to load health report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMonitoringStatus = () => {
    const status = studioMonitor.getMonitoringStatus();
    setMonitoringStatus(status);
  };

  const startMonitoring = () => {
    studioMonitor.startMonitoring(5 * 60 * 1000); // 5 minutes
    updateMonitoringStatus();
  };

  const stopMonitoring = () => {
    studioMonitor.stopMonitoring();
    updateMonitoringStatus();
  };

  const resolveAlert = (alertId: string) => {
    studioMonitor.resolveAlert(alertId);
    loadHealthReport(); // Refresh to show resolved alert
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const formatResponseTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Studio Health Monitoring
            <Badge variant={monitoringStatus.isActive ? 'default' : 'outline'}>
              {monitoringStatus.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monitoring Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{monitoringStatus.totalMetrics}</div>
              <div className="text-sm text-gray-600">Total Metrics</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{monitoringStatus.totalAlerts}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">
                {monitoringStatus.lastCheck 
                  ? new Date(monitoringStatus.lastCheck).toLocaleTimeString()
                  : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Check</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">
                {monitoringStatus.isActive ? 'Running' : 'Stopped'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={loadHealthReport}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
            
            {monitoringStatus.isActive ? (
              <Button
                variant="outline"
                onClick={stopMonitoring}
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Stop Monitoring
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={startMonitoring}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Monitoring
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              {autoRefresh ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              Auto Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Report */}
      {healthReport && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(healthReport.overallStatus)}
                Overall Health Status
                <Badge className={getStatusColor(healthReport.overallStatus)}>
                  {healthReport.overallStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {formatUptime(healthReport.uptime.percentage)}
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {healthReport.uptime.successfulChecks}/{healthReport.uptime.totalChecks} checks
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatResponseTime(healthReport.performance.averageResponseTime)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {healthReport.alerts.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Alerts</div>
                </div>
              </div>

              {/* Performance Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">Fastest Endpoint</span>
                  </div>
                  <div className="text-sm">{healthReport.performance.fastestEndpoint}</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">Slowest Endpoint</span>
                  </div>
                  <div className="text-sm">{healthReport.performance.slowestEndpoint}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Current Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthReport.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-600">
                          {metric.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {typeof metric.value === 'boolean' 
                          ? (metric.value ? 'OK' : 'FAIL')
                          : metric.value}
                      </span>
                      <Badge variant={
                        metric.status === 'healthy' ? 'default' :
                        metric.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          {healthReport.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Active Alerts ({healthReport.alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthReport.alerts.map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm opacity-75">
                              {alert.timestamp.toLocaleString()} • Type: {alert.type}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'secondary' : 'outline'
                            }>
                              {alert.severity}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {healthReport.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {healthReport.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && !healthReport && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Performing health check...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}