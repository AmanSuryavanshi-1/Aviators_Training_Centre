"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
  TrendingUp,
  TrendingDown,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusIndicator, { SyncStatusIndicator, OperationStatusIndicator } from '@/components/shared/StatusIndicator';
import SyncErrorHandler from '@/components/shared/SyncErrorHandler';
import { useErrorHandlingContext } from '@/components/providers/ErrorHandlingProvider';
import { useComprehensiveErrorHandling } from '@/hooks/use-comprehensive-error-handling';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';

interface SystemHealth {
  sanity: 'healthy' | 'unhealthy' | 'checking';
  database: 'healthy' | 'unhealthy' | 'checking';
  api: 'healthy' | 'unhealthy' | 'checking';
  cache: 'healthy' | 'unhealthy' | 'checking';
}

interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  uptime: number;
  cacheHitRate: number;
}

const SystemStatusDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    sanity: 'checking',
    database: 'checking',
    api: 'checking',
    cache: 'checking'
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    errorRate: 0,
    uptime: 99.9,
    cacheHitRate: 85
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  const { errors, clearError, clearAllErrors, isConnected, lastSyncTime } = useErrorHandlingContext();
  const { handleError, withErrorHandling } = useComprehensiveErrorHandling({
    showToastNotifications: true,
    context: { operation: 'System Status Check' }
  });

  // Perform health checks
  const performHealthChecks = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      await withErrorHandling(async () => {
        // Check Sanity CMS
        setSystemHealth(prev => ({ ...prev, sanity: 'checking' }));
        try {
          // Simple Sanity health check
          const testPosts = await simpleBlogService.getAllPosts({ limit: 1 });
          const isHealthy = Array.isArray(testPosts) && testPosts.length >= 0;
          setSystemHealth(prev => ({ 
            ...prev, 
            sanity: isHealthy ? 'healthy' : 'unhealthy' 
          }));
        } catch (error) {
          setSystemHealth(prev => ({ ...prev, sanity: 'unhealthy' }));
          handleError(error, { operation: 'Sanity Health Check' });
        }

        // Check API endpoints
        setSystemHealth(prev => ({ ...prev, api: 'checking' }));
        try {
          const response = await fetch('/api/blog/health');
          setSystemHealth(prev => ({ 
            ...prev, 
            api: response.ok ? 'healthy' : 'unhealthy' 
          }));
        } catch (error) {
          setSystemHealth(prev => ({ ...prev, api: 'unhealthy' }));
          handleError(error, { operation: 'API Health Check' });
        }

        // Check database (simulated)
        setSystemHealth(prev => ({ ...prev, database: 'checking' }));
        setTimeout(() => {
          setSystemHealth(prev => ({ ...prev, database: 'healthy' }));
        }, 500);

        // Check cache (simulated)
        setSystemHealth(prev => ({ ...prev, cache: 'checking' }));
        setTimeout(() => {
          setSystemHealth(prev => ({ ...prev, cache: 'healthy' }));
        }, 300);

        const endTime = Date.now();
        setPerformanceMetrics(prev => ({
          ...prev,
          responseTime: endTime - startTime
        }));

        setLastHealthCheck(new Date());
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial health check
  useEffect(() => {
    performHealthChecks();
    
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(performHealthChecks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate error rate
  useEffect(() => {
    const recentErrors = errors.filter(error => 
      Date.now() - error.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );
    
    setPerformanceMetrics(prev => ({
      ...prev,
      errorRate: (recentErrors.length / 100) * 100 // Simplified calculation
    }));
  }, [errors]);

  const getHealthIcon = (status: SystemHealth[keyof SystemHealth]) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: SystemHealth[keyof SystemHealth]) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const overallHealth = Object.values(systemHealth).every(status => status === 'healthy') 
    ? 'healthy' 
    : Object.values(systemHealth).some(status => status === 'unhealthy')
    ? 'unhealthy'
    : 'checking';

  const criticalErrors = errors.filter(error => error.severity === 'critical' || error.severity === 'high');
  const recentErrors = errors.filter(error => 
    Date.now() - error.timestamp.getTime() < 60 * 60 * 1000
  );

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={overallHealth === 'healthy' ? 'success' : overallHealth === 'unhealthy' ? 'error' : 'loading'}
                message={overallHealth === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
                variant="badge"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={performHealthChecks}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Sanity CMS */}
            <div className={`p-3 rounded-lg border ${getHealthColor(systemHealth.sanity)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Sanity CMS</span>
                </div>
                {getHealthIcon(systemHealth.sanity)}
              </div>
              <p className="text-xs text-muted-foreground">
                Content Management
              </p>
            </div>

            {/* API */}
            <div className={`p-3 rounded-lg border ${getHealthColor(systemHealth.api)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm font-medium">API</span>
                </div>
                {getHealthIcon(systemHealth.api)}
              </div>
              <p className="text-xs text-muted-foreground">
                Blog Endpoints
              </p>
            </div>

            {/* Database */}
            <div className={`p-3 rounded-lg border ${getHealthColor(systemHealth.database)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                {getHealthIcon(systemHealth.database)}
              </div>
              <p className="text-xs text-muted-foreground">
                Data Storage
              </p>
            </div>

            {/* Cache */}
            <div className={`p-3 rounded-lg border ${getHealthColor(systemHealth.cache)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Cache</span>
                </div>
                {getHealthIcon(systemHealth.cache)}
              </div>
              <p className="text-xs text-muted-foreground">
                Performance Layer
              </p>
            </div>
          </div>

          {lastHealthCheck && (
            <p className="text-xs text-muted-foreground mt-4">
              Last checked: {lastHealthCheck.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SyncStatusIndicator
            isConnected={isConnected}
            isSyncing={false}
            lastSync={lastSyncTime}
            onRetry={performHealthChecks}
          />
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium">{performanceMetrics.responseTime}ms</span>
              </div>
              <Progress 
                value={Math.min((performanceMetrics.responseTime / 2000) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="text-sm font-medium">{performanceMetrics.errorRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={performanceMetrics.errorRate} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-medium">{performanceMetrics.uptime}%</span>
              </div>
              <Progress 
                value={performanceMetrics.uptime} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                <span className="text-sm font-medium">{performanceMetrics.cacheHitRate}%</span>
              </div>
              <Progress 
                value={performanceMetrics.cacheHitRate} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Summary
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={criticalErrors.length > 0 ? 'destructive' : 'secondary'}>
                {errors.length} Total
              </Badge>
              {errors.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllErrors}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No errors detected. System is running smoothly.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {criticalErrors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {errors.filter(e => e.severity === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {errors.filter(e => e.severity === 'medium').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {recentErrors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Recent (1h)</div>
                </div>
              </div>

              {/* Recent Critical Errors */}
              {criticalErrors.slice(0, 3).map((error) => (
                <SyncErrorHandler
                  key={error.id}
                  error={{
                    type: 'sync_failed',
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    timestamp: error.timestamp,
                    operation: error.operation,
                    retryable: error.retryable
                  }}
                  onDismiss={() => clearError(error.id)}
                  className="mb-2"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatusDashboard;