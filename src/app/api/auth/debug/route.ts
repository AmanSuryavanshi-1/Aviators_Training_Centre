/**
 * Authentication Debug API Endpoint
 * Provides detailed authentication debugging information
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSanityAuth, generateAuthDebugReport } from '@/lib/auth/sanityAuthValidator';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authValidation = validateSanityAuth(request);
    
    // Generate debug report
    const debugReport = generateAuthDebugReport(authValidation);
    
    return NextResponse.json({
      success: true,
      data: {
        validation: authValidation,
        report: debugReport,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate auth debug information',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'validate-session':
        // Validate current session
        const validation = validateSanityAuth(request);
        
        return NextResponse.json({
          success: true,
          data: {
            isAuthenticated: validation.isAuthenticated,
            authMethod: validation.authMethod,
            sessionInfo: validation.sessionInfo,
            recommendations: validation.recommendations,
          },
        });
        
      case 'clear-debug-cookies':
        // Clear debug cookies (for testing)
        const response = NextResponse.json({
          success: true,
          message: 'Debug cookies cleared',
        });
        
        // Clear common debug cookies
        response.cookies.delete('debug_auth_session');
        response.cookies.delete('test_session');
        
        return response;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth debug action error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform auth debug action',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}