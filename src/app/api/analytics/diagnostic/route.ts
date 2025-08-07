import { NextRequest, NextResponse } from 'next/server';
import { ga4ConfigResolver } from '@/lib/analytics/GA4ConfigResolver';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting comprehensive GA4 diagnostic...');
    
    const diagnostic = await ga4ConfigResolver.runFullDiagnostic();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostic,
      summary: {
        configurationValid: diagnostic.configurationStatus.propertyMapping.isValid,
        hasRealData: diagnostic.dataAvailability.hasRealData,
        totalRecommendations: diagnostic.recommendations.length
      }
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}