import { NextRequest, NextResponse } from 'next/server';
import { SystemHealthMonitor } from '@/lib/monitoring/system-health-monitor';

// Create a singleton instance
let healthMonitor: SystemHealthMonitor | null = null;

function getHealthMonitor(): SystemHealthMonitor {
  if (!healthMonitor) {
    healthMonitor = new SystemHealthMonitor();
  }
  return healthMonitor;
}

// GET - Get current system health status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    const includeTrends = searchParams.get('trends') === 'true';
    
    const monitor = getHealthMonitor();
    
    // Perform health check
    const healthReport = await monitor.performHealthCheck();
    
    // Prepare response data
    const responseData: any = {
      status: healthReport.overall,
      timestamp: healthReport.timestamp,
      components: healthReport.components,
      summary: healthReport.summary,
      recommendations: healthReport.recommendations,
      uptime: monitor.getUptimePercentage(24), // 24-hour uptime
      needsAttention: monitor.needsImmediateAttention()
    };
    
    // Include history if requested
    if (includeHistory) {
      responseData.history = monitor.getHealthHistory(10); // Last 10 reports
    }
    
    // Include trends if requested
    if (includeTrends) {
      responseData.trends = monitor.getHealthTrends();
    }
    
    // Set appropriate HTTP status based on health
    let httpStatus = 200;
    if (healthReport.overall === 'critical') {
      httpStatus = 503; // Service Unavailable
    } else if (healthReport.overall === 'degraded') {
      httpStatus = 200; // OK but with warnings
    }
    
    return NextResponse.json(responseData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Health check API error:', error);
    
    return NextResponse.json(
      {
        status: 'critical',
        error: 'Health check system failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        components: [],
        summary: { healthy: 0, degraded: 0, unhealthy: 1, total: 1 },
        recommendations: ['🚨 Health monitoring system needs immediate repair'],
        uptime: 0,
        needsAttention: true
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// POST - Trigger manual health check
export async function POST(request: NextRequest) {
  try {
    const monitor = getHealthMonitor();
    
    // Perform immediate health check
    const healthReport = await monitor.performHealthCheck();
    
    return NextResponse.json({
      message: 'Manual health check completed',
      status: healthReport.overall,
      timestamp: healthReport.timestamp,
      components: healthReport.components,
      summary: healthReport.summary,
      recommendations: healthReport.recommendations
    });
    
  } catch (error) {
    console.error('Manual health check error:', error);
    
    return NextResponse.json(
      {
        error: 'Manual health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}