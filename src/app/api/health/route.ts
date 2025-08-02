/**
 * Health Check API Endpoint
 * Provides system health status for monitoring and deployment validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  try {
    // 1. Database/Sanity Connection Check
    const sanityCheck = await checkSanityConnection();
    checks.push(sanityCheck);

    // 2. Environment Variables Check
    const envCheck = checkEnvironmentVariables();
    checks.push(envCheck);

    // 3. Memory Usage Check
    const memoryCheck = checkMemoryUsage();
    checks.push(memoryCheck);

    // 4. Disk Space Check (if applicable)
    const diskCheck = await checkDiskSpace();
    checks.push(diskCheck);

    // 5. External Services Check
    const externalCheck = await checkExternalServices();
    checks.push(externalCheck);

    // 6. Authentication Service Check
    const authCheck = await checkAuthenticationService();
    checks.push(authCheck);

    // Calculate overall status
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
    };

    const overallStatus = summary.unhealthy > 0 
      ? 'unhealthy' 
      : summary.degraded > 0 
        ? 'degraded' 
        : 'healthy';

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks,
      summary,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: [
        {
          name: 'health_check_system',
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
      summary: {
        total: 1,
        healthy: 0,
        unhealthy: 1,
        degraded: 0,
      },
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

/**
 * Check Sanity connection
 */
async function checkSanityConnection(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Try to fetch a simple query
    const result = await client.fetch('*[_type == "post"][0...1]');
    const responseTime = Date.now() - startTime;

    return {
      name: 'sanity_connection',
      status: 'healthy',
      responseTime,
      details: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        documentsFound: Array.isArray(result) ? result.length : 0,
      },
    };
  } catch (error) {
    return {
      name: 'sanity_connection',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables(): HealthCheck {
  const requiredVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_TOKEN',
    'JWT_SECRET',
  ];

  const optionalVars = [
    'NEXT_PUBLIC_SITE_URL',
    'LOGGING_ENDPOINT',
    'SLACK_WEBHOOK_URL',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    return {
      name: 'environment_variables',
      status: 'unhealthy',
      error: `Missing required environment variables: ${missing.join(', ')}`,
      details: {
        required: requiredVars.length,
        missing: missing.length,
        missingVars: missing,
      },
    };
  }

  return {
    name: 'environment_variables',
    status: missingOptional.length > 0 ? 'degraded' : 'healthy',
    details: {
      required: requiredVars.length,
      optional: optionalVars.length,
      missingOptional: missingOptional.length,
      ...(missingOptional.length > 0 && { missingOptionalVars: missingOptional }),
    },
  };
}

/**
 * Check memory usage
 */
function checkMemoryUsage(): HealthCheck {
  try {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const usagePercentage = Math.round((usedMB / totalMB) * 100);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (usagePercentage > 90) {
      status = 'unhealthy';
    } else if (usagePercentage > 75) {
      status = 'degraded';
    }

    return {
      name: 'memory_usage',
      status,
      details: {
        heapUsed: `${usedMB}MB`,
        heapTotal: `${totalMB}MB`,
        usagePercentage: `${usagePercentage}%`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
    };
  } catch (error) {
    return {
      name: 'memory_usage',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check disk space (simplified check)
 */
async function checkDiskSpace(): Promise<HealthCheck> {
  try {
    // This is a simplified check - in a real deployment, you'd check actual disk usage
    const tmpDir = process.env.TMPDIR || '/tmp';
    
    return {
      name: 'disk_space',
      status: 'healthy',
      details: {
        tmpDir,
        note: 'Disk space monitoring not implemented - consider adding fs.statSync checks',
      },
    };
  } catch (error) {
    return {
      name: 'disk_space',
      status: 'degraded',
      error: 'Unable to check disk space',
    };
  }
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if we can reach external services
    const checks = await Promise.allSettled([
      // Check Sanity CDN
      fetch('https://cdn.sanity.io/images/ping', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    const failedChecks = checks.filter(result => result.status === 'rejected').length;
    const responseTime = Date.now() - startTime;

    if (failedChecks === checks.length) {
      return {
        name: 'external_services',
        status: 'unhealthy',
        responseTime,
        error: 'All external service checks failed',
      };
    }

    return {
      name: 'external_services',
      status: failedChecks > 0 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        totalChecks: checks.length,
        failedChecks,
        successfulChecks: checks.length - failedChecks,
      },
    };
  } catch (error) {
    return {
      name: 'external_services',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check authentication service
 */
async function checkAuthenticationService(): Promise<HealthCheck> {
  try {
    // Check if JWT secret is available and valid
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      return {
        name: 'authentication_service',
        status: 'unhealthy',
        error: 'JWT secret is missing or too short (minimum 32 characters)',
      };
    }

    // Check if we can create and verify a test token
    const { jwtService } = await import('@/lib/auth/jwtService');
    const testPayload = { test: true, exp: Math.floor(Date.now() / 1000) + 60 };
    
    try {
      const token = jwtService.generateToken(testPayload);
      const decoded = jwtService.verifyToken(token);
      
      if (decoded.test !== true) {
        throw new Error('Token verification failed');
      }

      return {
        name: 'authentication_service',
        status: 'healthy',
        details: {
          jwtSecretLength: jwtSecret.length,
          tokenGeneration: 'working',
          tokenVerification: 'working',
        },
      };
    } catch (jwtError) {
      return {
        name: 'authentication_service',
        status: 'unhealthy',
        error: `JWT service error: ${jwtError instanceof Error ? jwtError.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    return {
      name: 'authentication_service',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Also export a simple health check for load balancers
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick health check - just verify basic functionality
    const sanityCheck = await checkSanityConnection();
    const envCheck = checkEnvironmentVariables();

    if (sanityCheck.status === 'unhealthy' || envCheck.status === 'unhealthy') {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}