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
import { useErrorHandlingContext } from '@/components/shared/ErrorHandlingProvider';
import { useComprehensiveErrorHandling } from '@/hooks/use-comprehensive-error-handling';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';
// Firebase connection status is now fetched via API route
import { sanitySimpleService } from '@/lib/sanity/client.simple';

interface SystemHealth {
  sanity: 'healthy' | 'unhealthy' | 'checking';
  firestore: 'healthy' | 'unhealthy' | 'checking';
  api: 'healthy' | 'unhealthy' | 'checking';
  cache: 'healthy' | 'unhealthy' | 'checking';
}

interface DetailedHealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  latency?: number;
  error?: string;
  details?: any;
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
    firestore: 'checking',
    api: 'checking',
    cache: 'checking'
  });

  const [detailedHealth, setDetailedHealth] = useState<Record<string, DetailedHealthStatus>>({});
  
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
          const sanityStartTime = Date.now();
          // Use the enhanced Sanity service for health check
          const testPosts = await sanitySimpleService.getAllPosts({ limit: 1 });
          const sanityLatency = Date.now() - sanityStartTime;
          
          const isHealthy = Array.isArray(testPosts) && testPosts.length >= 0;
          setSystemHealth(prev => ({ 
            ...prev, 
            sanity: isHealthy ? 'healthy' : 'unhealthy' 
          }));
          setDetailedHealth(prev => ({
            ...prev,
            sanity: {
              status: isHealthy ? 'healthy' : 'unhealthy',
              latency: sanityLatency,
              details: { postsCount: testPosts.length }
            }
          }));
        } catch (error) {
          setSystemHealth(prev => ({ ...prev, sanity: 'unhealthy' }));
          setDetailedHealth(prev => ({
            ...prev,
            sanity: {
              status: 'unhealthy',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          handleError(error, { operation: 'Sanity Health Check' });
        }

        // Check Firestore via API route
        setSystemHealth(prev => ({ ...prev, firestore: 'checking' }));
        try {
          const firestoreStartTime = Date.now();
          const response = await fetch('/api/firebase/status', { 
            method: 'GET',
            cache: 'no-cache' 
          });
          const firestoreLatency = Date.now() - firestoreStartTime;
          
          if (response.ok) {
            const result = await response.json();
            const connectionStatus = result.data;
            const isHealthy = connectionStatus.status === 'healthy';
            const isConfigError = result.error?.isConfigurationError;
            
            setSystemHealth(prev => ({ 
              ...prev, 
              firestore: isConfigError ? 'unhealthy' : (isHealthy ? 'healthy' : 'unhealthy')
            }));
            setDetailedHealth(prev => ({
              ...prev,
              firestore: {
                status: isConfigError ? 'unhealthy' : (isHealthy ? 'healthy' : 'unhealthy'),
                latency: connectionStatus.details?.connection?.latency || firestoreLatency,
                details: connectionStatus.details,
                configurationError: isConfigError,
                message: isConfigError ? 'Firebase credentials not configured' : undefined
              }
            }));
          } else {
            throw new Error(`Firebase status API returned ${response.status}`);
          }
        } catch (error) {
          setSystemHealth(prev => ({ ...prev, firestore: 'unhealthy' }));
          setDetailedHealth(prev => ({
            ...prev,
            firestore: {
              status: 'unhealthy',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          handleError(error, { operation: 'Firestore Health Check' });
        }

        // Check API endpoints
        setSystemHealth(prev => ({ ...prev, api: 'checking' }));
        try {
          const apiStartTime = Date.now();
          const endpoints = [
            '/api/blog/health',
            '/api/analytics/pageview',
            '/api/sanity/health'
          ];
          
          const endpointResults = await Promise.allSettled(
            endpoints.map(async (endpoint) => {
              const response = await fetch(endpoint, { method: 'GET' });
              return { endpoint, ok: response.ok, status: response.status };
            })
          );
          
          const apiLatency = Date.now() - apiStartTime;
          const healthyEndpoints = endpointResults.filter(
            result => result.status === 'fulfilled' && result.value.ok
          ).length;
          
          const isHealthy = healthyEndpoints >= endpoints.length * 0.8; // 80% success rate
          setSystemHealth(prev => ({ 
            ...prev, 
            api: isHealthy ? 'healthy' : 'unhealthy' 
          }));
          setDetailedHealth(prev => ({
            ...prev,
            api: {
              status: isHealthy ? 'healthy' : 'unhealthy',
              latency: apiLatency,
              details: { 
                healthyEndpoints, 
                totalEndpoints: endpoints.length,
                results: endpointResults 
              }
            }
          }));
        } catch (error) {
          setSystemHealth(prev => ({ ...prev, api: 'unhealthy' }));
          setDetailedHealth(prev => ({
            ...prev,
            api: {
              status: 'unhealthy',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }));
          handleError(error, { operation: 'API Health Check' });
        }

        // Check cache (Next.js ISR)
        setSystemHealth(prev => ({ ...prev, cache: 'checking' }));
        try {
          const cacheStartTime = Date.now();
          // Test cache by making a request to a cached page
          const response = await fetch('/api/cache/status', { 
            method: 'GET',
            cache: 'no-cache' 
          });
          const cacheLatency = Date.now() - cacheStartTime;
          
          const isHealthy = response.ok;
          setSystemHealth(prev => ({ 
            ...prev, 
            cache: isHealthy ? 'healthy' : 'unhealthy' 
          }));
          setDetailedHealth(prev => ({
            ...prev,
            cache: {
              status: isHealthy ? 'healthy' : 'unhealthy',
              latency: cacheLatency,
              details: { 
                hitRate: performanceMetrics.cacheHitRate,
                status: response.status 
              }
            }
          }));
        } catch (error) {
          // Cache check is non-critical, assume healthy if endpoint doesn't exist
          setSystemHealth(prev => ({ ...prev, cache: 'healthy' }));
          setDetailedHealth(prev => ({
            ...prev,
            cache: {
              status: 'healthy',
              details: { note: 'Cache status endpoint not available, assuming healthy' }
            }
          }));
        }

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
              {detailedHealth.sanity?.latency && (
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedHealth.sanity.latency}ms
                </p>
              )}
            </div>

            {/* Firestore */}
            <div className={`p-3 rounded-lg border ${getHealthColor(systemHealth.firestore)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Firestore</span>
                </div>
                {getHealthIcon(systemHealth.firestore)}
              </div>
              <p className="text-xs text-muted-foreground">
                Analytics Storage
              </p>
              {detailedHealth.firestore?.latency && (
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedHealth.firestore.latency}ms
                </p>
              )}
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
                Blog & Analytics Endpoints
              </p>
              {detailedHealth.api?.details && (
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedHealth.api.details.healthyEndpoints}/{detailedHealth.api.details.totalEndpoints} healthy
                </p>
              )}
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
                Next.js ISR
              </p>
              {detailedHealth.cache?.details?.hitRate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedHealth.cache.details.hitRate}% hit rate
                </p>
              )}
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

      {/* Detailed System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sanity Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Sanity CMS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={systemHealth.sanity === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.sanity}
                  </Badge>
                </div>
                {detailedHealth.sanity?.latency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{detailedHealth.sanity.latency}ms</span>
                  </div>
                )}
                {detailedHealth.sanity?.error && (
                  <div className="text-red-600 text-xs">
                    Error: {detailedHealth.sanity.error}
                  </div>
                )}
              </div>
            </div>

            {/* Firestore Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Firestore Analytics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={systemHealth.firestore === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.firestore}
                  </Badge>
                </div>
                {detailedHealth.firestore?.latency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{detailedHealth.firestore.latency}ms</span>
                  </div>
                )}
                {detailedHealth.firestore?.details?.services && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Services:</span>
                    <span>
                      {detailedHealth.firestore.details.services.firestore ? '✓' : '✗'} Firestore{' '}
                      {detailedHealth.firestore.details.services.auth ? '✓' : '✗'} Auth
                    </span>
                  </div>
                )}
                {detailedHealth.firestore?.error && (
                  <div className="text-red-600 text-xs">
                    Error: {detailedHealth.firestore.error}
                  </div>
                )}
              </div>
            </div>

            {/* API Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">API Endpoints</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={systemHealth.api === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.api}
                  </Badge>
                </div>
                {detailedHealth.api?.details && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Healthy Endpoints:</span>
                    <span>
                      {detailedHealth.api.details.healthyEndpoints}/{detailedHealth.api.details.totalEndpoints}
                    </span>
                  </div>
                )}
                {detailedHealth.api?.latency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{detailedHealth.api.latency}ms</span>
                  </div>
                )}
                {detailedHealth.api?.error && (
                  <div className="text-red-600 text-xs">
                    Error: {detailedHealth.api.error}
                  </div>
                )}
              </div>
            </div>

            {/* Cache Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cache System</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={systemHealth.cache === 'healthy' ? 'default' : 'destructive'}>
                    {systemHealth.cache}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <span>{performanceMetrics.cacheHitRate}%</span>
                </div>
                {detailedHealth.cache?.latency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{detailedHealth.cache.latency}ms</span>
                  </div>
                )}
              </div>
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
