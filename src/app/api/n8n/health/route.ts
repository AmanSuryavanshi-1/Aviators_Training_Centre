import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogSummary, getAutomationPerformanceMetrics } from '@/lib/n8n/audit-logger';
import { performHealthCheck } from '@/lib/n8n/retry-handler';
import { performErrorMonitoringHealthCheck, errorMonitor } from '@/lib/n8n/error-monitoring';
import { enhancedClient } from '@/lib/sanity/client';

// Health check response interface
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  components: {
    database: ComponentHealth;
    retrySystem: ComponentHealth;
    errorMonitoring: ComponentHealth;
    circuitBreakers: ComponentHealth;
    notifications: ComponentHealth;
  };
  metrics: {
    automation: {
      totalWebhooks: number;
      successRate: number;
      averageProcessingTime: number;
      activeAutomations: number;
    };
    errors: {
      last24Hours: number;
      criticalErrors: number;
      errorRate: number;
      topErrors: Array<{ message: string; count: number }>;
    };
    performance: {
      memoryUsage: NodeJS.MemoryUsage;
      cpuUsage: NodeJS.CpuUsage;
      eventLoopDelay: number;
    };
  };
  alerts: Array<{
    level: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    component: string;
  }>;
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  metrics?: Record<string, any>;
  lastCheck: string;
}

// GET - Comprehensive health check
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const includeMetrics = searchParams.get('metrics') !== 'false';
    const includeDetails = searchParams.get('details') === 'true';

    // Perform component health checks in parallel
    const [
      databaseHealth,
      retrySystemHealth,
      errorMonitoringHealth,
      auditSummary,
      performanceMetrics
    ] = await Promise.allSettled([
      checkDatabaseHealth(),
      performHealthCheck(),
      performErrorMonitoringHealthCheck(),
      includeMetrics ? getAuditLogSummary('24h') : null,
      includeMetrics ? getAutomationPerformanceMetrics() : null
    ]);

    // Process health check results
    const components: HealthCheckResponse['components'] = {
      database: processHealthResult(databaseHealth, 'database'),
      retrySystem: processHealthResult(retrySystemHealth, 'retrySystem'),
      errorMonitoring: processHealthResult(errorMonitoringHealth, 'errorMonitoring'),
      circuitBreakers: {
        status: retrySystemHealth.status === 'fulfilled' ? 
          retrySystemHealth.value.status : 'unhealthy',
        message: retrySystemHealth.status === 'fulfilled' ? 
          `${Object.keys(retrySystemHealth.value.circuitBreakers).length} circuit breakers monitored` : 
          'Circuit breaker check failed',
        metrics: retrySystemHealth.status === 'fulfilled' ? 
          retrySystemHealth.value.circuitBreakers : undefined,
        lastCheck: new Date().toISOString()
      },
      notifications: await checkNotificationHealth()
    };

    // Determine overall system status
    const componentStatuses = Object.values(components).map(c => c.status);
    const overallStatus = determineOverallStatus(componentStatuses);

    // Collect alerts
    const alerts = collectSystemAlerts(components);

    // Build metrics if requested
    let metrics: HealthCheckResponse['metrics'] | undefined;
    if (includeMetrics) {
      metrics = {
        automation: {
          totalWebhooks: performanceMetrics.status === 'fulfilled' ? 
            performanceMetrics.value.totalWebhooksReceived : 0,
          successRate: performanceMetrics.status === 'fulfilled' ? 
            performanceMetrics.value.successRate : 0,
          averageProcessingTime: performanceMetrics.status === 'fulfilled' ? 
            performanceMetrics.value.averageProcessingTime : 0,
          activeAutomations: auditSummary.status === 'fulfilled' ? 
            auditSummary.value.automationSummary.length : 0
        },
        errors: {
          last24Hours: auditSummary.status === 'fulfilled' ? 
            auditSummary.value.failureCount : 0,
          criticalErrors: errorMonitoringHealth.status === 'fulfilled' ? 
            errorMonitoringHealth.value.metrics.criticalErrors : 0,
          errorRate: errorMonitoringHealth.status === 'fulfilled' ? 
            errorMonitoringHealth.value.metrics.errorRate : 0,
          topErrors: performanceMetrics.status === 'fulfilled' ? 
            performanceMetrics.value.commonErrors.slice(0, 5) : []
        },
        performance: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          eventLoopDelay: await measureEventLoopDelay()
        }
      };
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      components,
      metrics: metrics!,
      alerts
    };

    // Add detailed information if requested
    if (includeDetails) {
      (response as any).details = {
        auditSummary: auditSummary.status === 'fulfilled' ? auditSummary.value : null,
        performanceMetrics: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null,
        processingTime: Date.now() - startTime
      };
    }

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: Partial<HealthCheckResponse> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      alerts: [{
        level: 'critical',
        message: `Health check system failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        component: 'health_check'
      }]
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// POST - Manual health check trigger with specific components
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { components = [], actions = [] } = body;

    const results: Record<string, any> = {};

    // Perform specific component checks
    if (components.includes('database') || components.length === 0) {
      results.database = await checkDatabaseHealth();
    }

    if (components.includes('retry_system') || components.length === 0) {
      results.retrySystem = await performHealthCheck();
    }

    if (components.includes('error_monitoring') || components.length === 0) {
      results.errorMonitoring = await performErrorMonitoringHealthCheck();
    }

    // Perform specific actions
    if (actions.includes('cleanup_errors')) {
      results.errorCleanup = await errorMonitor.cleanupOldErrors();
    }

    if (actions.includes('reset_circuit_breakers')) {
      results.circuitBreakerReset = await resetCircuitBreakers();
    }

    if (actions.includes('test_notifications')) {
      results.notificationTest = await testNotificationSystem();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Manual health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper functions

async function checkDatabaseHealth(): Promise<ComponentHealth> {
  try {
    const startTime = Date.now();
    
    // Test basic connectivity
    await enhancedClient.fetch('*[_type == "post"][0]._id');
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy',
      message: `Database responding in ${responseTime}ms`,
      metrics: {
        responseTime,
        connectionPool: 'active' // Would be actual pool stats in production
      },
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastCheck: new Date().toISOString()
    };
  }
}

async function checkNotificationHealth(): Promise<ComponentHealth> {
  try {
    // Check if notification system is responsive
    const recentNotifications = await enhancedClient.fetch(
      '*[_type == "editorNotification" && timestamp > $since] | order(timestamp desc) [0...5]',
      { since: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
    );

    return {
      status: 'healthy',
      message: `${recentNotifications.length} notifications in last hour`,
      metrics: {
        recentNotifications: recentNotifications.length,
        systemResponsive: true
      },
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Notification system check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastCheck: new Date().toISOString()
    };
  }
}

function processHealthResult(
  result: PromiseSettledResult<any>,
  componentName: string
): ComponentHealth {
  if (result.status === 'fulfilled') {
    return {
      status: result.value.status || 'healthy',
      message: result.value.message,
      metrics: result.value.metrics || result.value,
      lastCheck: new Date().toISOString()
    };
  } else {
    return {
      status: 'unhealthy',
      message: `${componentName} health check failed: ${result.reason}`,
      lastCheck: new Date().toISOString()
    };
  }
}

function determineOverallStatus(componentStatuses: string[]): 'healthy' | 'degraded' | 'unhealthy' {
  if (componentStatuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  if (componentStatuses.includes('degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

function collectSystemAlerts(components: HealthCheckResponse['components']): HealthCheckResponse['alerts'] {
  const alerts: HealthCheckResponse['alerts'] = [];

  Object.entries(components).forEach(([componentName, health]) => {
    if (health.status === 'unhealthy') {
      alerts.push({
        level: 'critical',
        message: health.message || `${componentName} is unhealthy`,
        timestamp: health.lastCheck,
        component: componentName
      });
    } else if (health.status === 'degraded') {
      alerts.push({
        level: 'warning',
        message: health.message || `${componentName} is degraded`,
        timestamp: health.lastCheck,
        component: componentName
      });
    }
  });

  return alerts;
}

async function measureEventLoopDelay(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delta = process.hrtime.bigint() - start;
      resolve(Number(delta) / 1000000); // Convert to milliseconds
    });
  });
}

async function resetCircuitBreakers(): Promise<{ reset: string[]; failed: string[] }> {
  const { circuitBreakers } = await import('@/lib/n8n/retry-handler');
  const reset: string[] = [];
  const failed: string[] = [];

  Object.entries(circuitBreakers).forEach(([name, breaker]) => {
    try {
      breaker.reset();
      reset.push(name);
    } catch (error) {
      failed.push(name);
    }
  });

  return { reset, failed };
}

async function testNotificationSystem(): Promise<{ success: boolean; message: string }> {
  try {
    const { sendEditorNotification } = await import('@/lib/n8n/notifications');
    
    await sendEditorNotification({
      type: 'system_alert',
      title: 'Health Check Test',
      message: 'This is a test notification from the health check system.',
      priority: 'low',
      timestamp: new Date().toISOString(),
      recipientRole: 'admin'
    });

    return {
      success: true,
      message: 'Test notification sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Notification test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
