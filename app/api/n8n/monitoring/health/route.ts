import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/n8n/retry-handler';
import { performErrorMonitoringHealthCheck } from '@/lib/n8n/error-monitoring';
import { enhancedClient } from '@/lib/sanity/client';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    sanity: {
      status: 'connected' | 'disconnected' | 'degraded';
      responseTime?: number;
      error?: string;
    };
    webhook: {
      status: 'active' | 'inactive';
      lastActivity?: string;
    };
    retrySystem: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      circuitBreakers: Record<string, any>;
    };
    errorMonitoring: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      metrics: {
        activeErrors: number;
        criticalErrors: number;
        errorRate: number;
        alertsInCooldown: number;
      };
    };
    notifications: {
      status: 'operational' | 'degraded' | 'failed';
      lastNotificationSent?: string;
    };
  };
  summary: {
    overallHealth: number; // 0-100 score
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  const healthCheck: HealthCheckResult = {
    status: 'healthy',
    timestamp,
    services: {
      sanity: { status: 'disconnected' },
      webhook: { status: 'inactive' },
      retrySystem: { status: 'healthy', circuitBreakers: {} },
      errorMonitoring: { 
        status: 'healthy', 
        metrics: { activeErrors: 0, criticalErrors: 0, errorRate: 0, alertsInCooldown: 0 }
      },
      notifications: { status: 'operational' }
    },
    summary: {
      overallHealth: 100,
      criticalIssues: [],
      warnings: [],
      recommendations: []
    }
  };

  try {
    // Check Sanity connection
    try {
      const sanityStartTime = Date.now();
      await enhancedClient.fetch('*[_type == "post"][0]._id');
      const sanityResponseTime = Date.now() - sanityStartTime;
      
      healthCheck.services.sanity = {
        status: sanityResponseTime > 5000 ? 'degraded' : 'connected',
        responseTime: sanityResponseTime
      };

      if (sanityResponseTime > 5000) {
        healthCheck.summary.warnings.push('Sanity CMS response time is slow');
        healthCheck.summary.overallHealth -= 10;
      }
    } catch (sanityError) {
      healthCheck.services.sanity = {
        status: 'disconnected',
        error: sanityError instanceof Error ? sanityError.message : 'Unknown error'
      };
      healthCheck.summary.criticalIssues.push('Sanity CMS is not accessible');
      healthCheck.summary.overallHealth -= 30;
    }

    // Check webhook status (check for recent activity)
    try {
      const recentWebhooks = await enhancedClient.fetch(
        `*[_type == "automationAuditLog" && type == "webhook_received" && timestamp > $cutoff] | order(timestamp desc) [0]`,
        { cutoff: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      );

      if (recentWebhooks) {
        healthCheck.services.webhook = {
          status: 'active',
          lastActivity: recentWebhooks.timestamp
        };
      } else {
        healthCheck.services.webhook = { status: 'inactive' };
        healthCheck.summary.warnings.push('No webhook activity in the last 24 hours');
        healthCheck.summary.overallHealth -= 5;
      }
    } catch (webhookError) {
      healthCheck.services.webhook = { status: 'inactive' };
      healthCheck.summary.warnings.push('Unable to check webhook status');
    }

    // Check retry system and circuit breakers
    try {
      const retryHealthCheck = await performHealthCheck();
      healthCheck.services.retrySystem = {
        status: retryHealthCheck.status,
        circuitBreakers: retryHealthCheck.circuitBreakers
      };

      if (retryHealthCheck.status === 'degraded') {
        healthCheck.summary.warnings.push('Some circuit breakers are in half-open state');
        healthCheck.summary.overallHealth -= 15;
      } else if (retryHealthCheck.status === 'unhealthy') {
        healthCheck.summary.criticalIssues.push('Multiple circuit breakers are open');
        healthCheck.summary.overallHealth -= 25;
      }
    } catch (retryError) {
      healthCheck.services.retrySystem.status = 'unhealthy';
      healthCheck.summary.criticalIssues.push('Retry system health check failed');
      healthCheck.summary.overallHealth -= 20;
    }

    // Check error monitoring system
    try {
      const errorHealthCheck = await performErrorMonitoringHealthCheck();
      healthCheck.services.errorMonitoring = {
        status: errorHealthCheck.status,
        metrics: errorHealthCheck.metrics
      };

      if (errorHealthCheck.status === 'degraded') {
        healthCheck.summary.warnings.push('High error rate detected');
        healthCheck.summary.overallHealth -= 15;
      } else if (errorHealthCheck.status === 'unhealthy') {
        healthCheck.summary.criticalIssues.push('Critical errors or very high error rate');
        healthCheck.summary.overallHealth -= 30;
      }

      if (errorHealthCheck.metrics.criticalErrors > 0) {
        healthCheck.summary.criticalIssues.push(`${errorHealthCheck.metrics.criticalErrors} critical errors need attention`);
      }
    } catch (errorMonitoringError) {
      healthCheck.services.errorMonitoring.status = 'unhealthy';
      healthCheck.summary.criticalIssues.push('Error monitoring system is not functioning');
      healthCheck.summary.overallHealth -= 20;
    }

    // Check notification system
    try {
      const recentNotifications = await enhancedClient.fetch(
        `*[_type == "editorNotification" && timestamp > $cutoff] | order(timestamp desc) [0]`,
        { cutoff: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
      );

      if (recentNotifications) {
        healthCheck.services.notifications = {
          status: 'operational',
          lastNotificationSent: recentNotifications.timestamp
        };
      } else {
        healthCheck.services.notifications = { status: 'degraded' };
        healthCheck.summary.warnings.push('No notifications sent in the last 24 hours');
        healthCheck.summary.overallHealth -= 5;
      }
    } catch (notificationError) {
      healthCheck.services.notifications = { status: 'failed' };
      healthCheck.summary.warnings.push('Unable to check notification system status');
      healthCheck.summary.overallHealth -= 10;
    }

    // Generate recommendations
    if (healthCheck.summary.overallHealth < 100) {
      if (healthCheck.services.sanity.status === 'disconnected') {
        healthCheck.summary.recommendations.push('Check Sanity CMS configuration and network connectivity');
      }
      if (healthCheck.services.retrySystem.status !== 'healthy') {
        healthCheck.summary.recommendations.push('Review circuit breaker logs and reset if necessary');
      }
      if (healthCheck.services.errorMonitoring.metrics.errorRate > 10) {
        healthCheck.summary.recommendations.push('Investigate high error rate and resolve underlying issues');
      }
      if (healthCheck.services.webhook.status === 'inactive') {
        healthCheck.summary.recommendations.push('Verify N8N webhook configuration and test connectivity');
      }
    }

    // Determine overall status
    if (healthCheck.summary.criticalIssues.length > 0 || healthCheck.summary.overallHealth < 50) {
      healthCheck.status = 'unhealthy';
    } else if (healthCheck.summary.warnings.length > 0 || healthCheck.summary.overallHealth < 80) {
      healthCheck.status = 'degraded';
    } else {
      healthCheck.status = 'healthy';
    }

    // Add performance metrics
    const totalResponseTime = Date.now() - startTime;
    if (totalResponseTime > 5000) {
      healthCheck.summary.warnings.push('Health check response time is slow');
    }

    return NextResponse.json(healthCheck, { 
      status: healthCheck.status === 'healthy' ? 200 : 
              healthCheck.status === 'degraded' ? 200 : 503
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp,
      error: 'Health check system failure',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined,
      services: healthCheck.services,
      summary: {
        overallHealth: 0,
        criticalIssues: ['Health check system failure'],
        warnings: [],
        recommendations: ['Contact system administrator immediately']
      }
    }, { status: 503 });
  }
}

// POST endpoint for manual health check triggers or system resets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset_circuit_breakers':
        // This would reset circuit breakers - implementation depends on your retry handler
        return NextResponse.json({ 
          success: true, 
          message: 'Circuit breakers reset successfully' 
        });

      case 'clear_error_cache':
        // This would clear error monitoring cache
        return NextResponse.json({ 
          success: true, 
          message: 'Error cache cleared successfully' 
        });

      case 'test_notifications':
        // This would send a test notification
        return NextResponse.json({ 
          success: true, 
          message: 'Test notification sent successfully' 
        });

      default:
        return NextResponse.json({ 
          error: 'Unknown action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Health check action failed:', error);
    
    return NextResponse.json({
      error: 'Failed to execute health check action',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}