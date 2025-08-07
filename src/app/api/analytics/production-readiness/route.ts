import { NextRequest, NextResponse } from 'next/server';
import { productionReadinessChecker } from '@/lib/analytics/productionReadinessChecker';

export async function GET(request: NextRequest) {
  try {
    // Run comprehensive production readiness checks
    const report = await productionReadinessChecker.runAllChecks();

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Production readiness check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to run production readiness checks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Allow POST for manual trigger
export async function POST(request: NextRequest) {
  try {
    const { checks } = await request.json();
    
    // If specific checks are requested, run only those
    // For now, run all checks
    const report = await productionReadinessChecker.runAllChecks();

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Production readiness check completed'
    });

  } catch (error) {
    console.error('Production readiness check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to run production readiness checks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}