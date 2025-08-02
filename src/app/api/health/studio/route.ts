/**
 * Studio Health Check API Endpoint
 * Specific health checks for Sanity Studio functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';

interface StudioHealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

interface StudioHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  studioUrl: string;
  checks: StudioHealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const checks: StudioHealthCheck[] = [];

  try {
    // 1. Sanity Project Configuration Check
    const projectCheck = await checkSanityProjectConfig();
    checks.push(projectCheck);

    // 2. Sanity API Token Check
    const tokenCheck = await checkSanityApiToken();
    checks.push(tokenCheck);

    // 3. Studio Schema Check
    const schemaCheck = await checkStudioSchema();
    checks.push(schemaCheck);

    // 4. Studio Assets Check
    const assetsCheck = await checkStudioAssets();
    checks.push(assetsCheck);

    // 5. Studio Authentication Check
    const authCheck = await checkStudioAuthentication();
    checks.push(authCheck);

    // 6. Studio Navigation Check
    const navigationCheck = await checkStudioNavigation();
    checks.push(navigationCheck);

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

    const studioUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/studio`
      : 'http://localhost:3000/studio';

    const response: StudioHealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      studioUrl,
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
    const errorResponse: StudioHealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      studioUrl: 'unknown',
      checks: [
        {
          name: 'studio_health_check_system',
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

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Check Sanity project configuration
 */
async function checkSanityProjectConfig(): Promise<StudioHealthCheck> {
  const startTime = Date.now();
  
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

    if (!projectId || !dataset) {
      return {
        name: 'sanity_project_config',
        status: 'unhealthy',
        error: 'Missing Sanity project configuration',
        details: {
          hasProjectId: !!projectId,
          hasDataset: !!dataset,
        },
      };
    }

    // Try to fetch project info
    const projectInfo = await client.request({
      url: `/projects/${projectId}`,
      method: 'GET',
    });

    const responseTime = Date.now() - startTime;

    return {
      name: 'sanity_project_config',
      status: 'healthy',
      responseTime,
      details: {
        projectId,
        dataset,
        projectName: projectInfo.displayName || 'Unknown',
        organizationId: projectInfo.organizationId,
      },
    };
  } catch (error) {
    return {
      name: 'sanity_project_config',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Sanity API token
 */
async function checkSanityApiToken(): Promise<StudioHealthCheck> {
  const startTime = Date.now();
  
  try {
    const token = process.env.SANITY_API_TOKEN;
    
    if (!token) {
      return {
        name: 'sanity_api_token',
        status: 'unhealthy',
        error: 'SANITY_API_TOKEN environment variable is missing',
      };
    }

    // Test token by making a simple authenticated request
    const result = await client.fetch('*[_type == "post"][0...1]');
    const responseTime = Date.now() - startTime;

    return {
      name: 'sanity_api_token',
      status: 'healthy',
      responseTime,
      details: {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 8) + '...',
        canFetchData: true,
      },
    };
  } catch (error) {
    return {
      name: 'sanity_api_token',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Token authentication failed',
    };
  }
}

/**
 * Check Studio schema
 */
async function checkStudioSchema(): Promise<StudioHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if required document types exist
    const requiredTypes = ['post', 'category', 'author'];
    const schemaChecks = await Promise.allSettled(
      requiredTypes.map(type => 
        client.fetch(`*[_type == "${type}"][0...1]`)
      )
    );

    const responseTime = Date.now() - startTime;
    const availableTypes = schemaChecks
      .map((result, index) => ({
        type: requiredTypes[index],
        available: result.status === 'fulfilled',
      }))
      .filter(check => check.available)
      .map(check => check.type);

    const missingTypes = requiredTypes.filter(type => !availableTypes.includes(type));

    if (missingTypes.length === requiredTypes.length) {
      return {
        name: 'studio_schema',
        status: 'unhealthy',
        responseTime,
        error: 'No required document types found in schema',
        details: {
          requiredTypes,
          availableTypes: [],
          missingTypes,
        },
      };
    }

    return {
      name: 'studio_schema',
      status: missingTypes.length > 0 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        requiredTypes,
        availableTypes,
        missingTypes,
        schemaHealth: `${availableTypes.length}/${requiredTypes.length} types available`,
      },
    };
  } catch (error) {
    return {
      name: 'studio_schema',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Schema check failed',
    };
  }
}

/**
 * Check Studio assets
 */
async function checkStudioAssets(): Promise<StudioHealthCheck> {
  try {
    // Check if Studio static assets are accessible
    const studioAssetChecks = [
      '/studio/static/favicon.ico',
      '/studio/static/sanity-studio.css',
    ];

    const assetResults = await Promise.allSettled(
      studioAssetChecks.map(async (asset) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${asset}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        return { asset, status: response.status };
      })
    );

    const availableAssets = assetResults
      .filter(result => result.status === 'fulfilled')
      .length;

    const status = availableAssets === 0 ? 'unhealthy' : 
                  availableAssets < studioAssetChecks.length ? 'degraded' : 'healthy';

    return {
      name: 'studio_assets',
      status,
      details: {
        totalAssets: studioAssetChecks.length,
        availableAssets,
        assetHealth: `${availableAssets}/${studioAssetChecks.length} assets accessible`,
      },
    };
  } catch (error) {
    return {
      name: 'studio_assets',
      status: 'degraded',
      error: 'Unable to check Studio assets',
    };
  }
}

/**
 * Check Studio authentication integration
 */
async function checkStudioAuthentication(): Promise<StudioHealthCheck> {
  try {
    // Check if authentication endpoints are available
    const authEndpoints = [
      '/api/auth/session',
      '/api/auth/validate-member',
    ];

    const authChecks = await Promise.allSettled(
      authEndpoints.map(async (endpoint) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${endpoint}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        return { endpoint, available: response.status !== 404 };
      })
    );

    const availableEndpoints = authChecks
      .filter(result => result.status === 'fulfilled' && (result.value as any).available)
      .length;

    const status = availableEndpoints === 0 ? 'unhealthy' : 
                  availableEndpoints < authEndpoints.length ? 'degraded' : 'healthy';

    return {
      name: 'studio_authentication',
      status,
      details: {
        totalEndpoints: authEndpoints.length,
        availableEndpoints,
        authHealth: `${availableEndpoints}/${authEndpoints.length} auth endpoints available`,
      },
    };
  } catch (error) {
    return {
      name: 'studio_authentication',
      status: 'degraded',
      error: 'Unable to check Studio authentication',
    };
  }
}

/**
 * Check Studio navigation
 */
async function checkStudioNavigation(): Promise<StudioHealthCheck> {
  try {
    // Import URL generator to test navigation URLs
    const { urlGenerator } = await import('@/lib/utils/urlGenerator');
    
    const config = urlGenerator.getConfigSummary();
    const validation = urlGenerator.validateConfiguration();

    if (!validation.isValid) {
      return {
        name: 'studio_navigation',
        status: 'unhealthy',
        error: 'Studio navigation configuration is invalid',
        details: {
          errors: validation.errors,
          warnings: validation.warnings,
        },
      };
    }

    // Test generating common Studio URLs
    const testUrls = [
      urlGenerator.getStudioUrl(),
      urlGenerator.getStudioNavigationUrl('/desk/post'),
      urlGenerator.getEditUrl('test-post', 'post'),
    ];

    const validUrls = testUrls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    const status = validUrls.length === testUrls.length ? 'healthy' : 'degraded';

    return {
      name: 'studio_navigation',
      status,
      details: {
        configValid: validation.isValid,
        urlsGenerated: validUrls.length,
        totalUrls: testUrls.length,
        environment: config.environment,
        warnings: validation.warnings,
      },
    };
  } catch (error) {
    return {
      name: 'studio_navigation',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Navigation check failed',
    };
  }
}

// Simple HEAD endpoint for load balancer checks
export async function HEAD(): Promise<NextResponse> {
  try {
    const projectCheck = await checkSanityProjectConfig();
    const tokenCheck = await checkSanityApiToken();

    if (projectCheck.status === 'unhealthy' || tokenCheck.status === 'unhealthy') {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}