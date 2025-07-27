import { NextRequest, NextResponse } from 'next/server';
import { BlogHealthChecker, blogCircuitBreakers } from '@/lib/blog/error-handling';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const detailed = searchParams.get('detailed') === 'true';
    const trends = searchParams.get('trends') === 'true';

    // Perform comprehensive health check
    const healthCheck = await BlogHealthChecker.performHealthCheck();

    let response: any = {
      status: healthCheck.overall ? 'healthy' : 'unhealthy',
      timestamp: healthCheck.timestamp,
      uptime: healthCheck.uptime,
      services: {
        sanity: {
          status: healthCheck.services.sanity.healthy ? 'healthy' : 'unhealthy',
          latency: healthCheck.services.sanity.latency,
          error: healthCheck.services.sanity.error,
        },
        api: {
          status: healthCheck.services.api.healthy ? 'healthy' : 'unhealthy',
          endpoints: healthCheck.services.api.endpoints,
        },
        fallbackMode: healthCheck.services.fallbackMode,
      },
    };

    if (detailed) {
      response.circuitBreakers = healthCheck.services.circuitBreakers;
      response.systemInfo = {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      };
    }

    if (trends) {
      response.trends = BlogHealthChecker.getHealthTrends();
      response.history = BlogHealthChecker.getHealthHistory().slice(-20); // Last 20 checks
    }

    return NextResponse.json(response, {
      status: healthCheck.overall ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check endpoint error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'reset_circuit_breakers':
        Object.entries(blogCircuitBreakers).forEach(([name, breaker]) => {
          breaker.reset();
        });
        return NextResponse.json({
          success: true,
          message: 'All circuit breakers reset',
          timestamp: new Date().toISOString(),
        });

      case 'auto_recovery':
        const recoveryResult = await BlogHealthChecker.attemptAutoRecovery();
        return NextResponse.json({
          success: recoveryResult.successful,
          attempted: recoveryResult.attempted,
          actions: recoveryResult.actions,
          timestamp: new Date().toISOString(),
        });

      case 'clear_health_history':
        BlogHealthChecker.clearHealthHistory();
        return NextResponse.json({
          success: true,
          message: 'Health history cleared',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Health check action error:', error);
    
    return NextResponse.json(
      {
        error: 'Action failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}