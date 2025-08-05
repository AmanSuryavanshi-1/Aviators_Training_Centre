import { NextRequest, NextResponse } from 'next/server';
import { getConfigStatus, getEnvironmentSpecificConfig } from '@/lib/auth/adminConfig';

export async function GET(request: NextRequest) {
  try {
    const configStatus = getConfigStatus();
    const envConfig = getEnvironmentSpecificConfig();

    // Only show detailed information in development
    const response = {
      configured: configStatus.configured,
      environment: configStatus.environment,
      securityLevel: configStatus.securityLevel,
      timestamp: new Date().toISOString(),
      ...(envConfig.detailedErrors && {
        errors: configStatus.errors,
        warnings: configStatus.warnings,
        recommendations: generateRecommendations(configStatus)
      })
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Config status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get configuration status',
        configured: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(configStatus: any): string[] {
  const recommendations: string[] = [];

  if (configStatus.errors.length > 0) {
    recommendations.push('Fix configuration errors before deploying to production');
  }

  if (configStatus.warnings.length > 0) {
    recommendations.push('Address configuration warnings to improve security');
  }

  if (configStatus.securityLevel === 'low') {
    recommendations.push('Improve password complexity and set ADMIN_JWT_SECRET');
  } else if (configStatus.securityLevel === 'medium') {
    recommendations.push('Consider addressing remaining security warnings');
  }

  if (configStatus.environment === 'production' && configStatus.securityLevel !== 'high') {
    recommendations.push('Production environment should have high security level');
  }

  return recommendations;
}