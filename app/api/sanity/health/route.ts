import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { getEnvDiagnostics, validateSanityEnv } from '@/lib/utils/env-diagnostics';

/**
 * GET /api/sanity/health
 * Check Sanity connection health and configuration
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting Sanity health check...');
    
    // Get environment diagnostics
    const envDiagnostics = getEnvDiagnostics();
    const envValidation = validateSanityEnv();
    
    // Perform comprehensive health check
    const healthCheck = await enhancedClient.performHealthCheck();
    
    // Get configuration summary
    const configSummary = enhancedClient.getConfigurationSummary();
    
    console.log('✅ Sanity health check completed');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        overall: healthCheck.overall,
        connection: healthCheck.connection,
        writeCapability: healthCheck.writeCapability,
        performance: healthCheck.performance
      },
      environment: {
        diagnostics: envDiagnostics,
        validation: envValidation
      },
      configuration: configSummary,
      recommendations: healthCheck.recommendations
    });

  } catch (error) {
    console.error('❌ Sanity health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString(),
      environment: {
        diagnostics: getEnvDiagnostics(),
        validation: validateSanityEnv()
      }
    }, { status: 500 });
  }
}

/**
 * POST /api/sanity/health
 * Test a specific Sanity operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation = 'read', testData } = body;
    
    console.log(`🧪 Testing Sanity ${operation} operation...`);
    
    let result: any;
    
    switch (operation) {
      case 'read':
        result = await enhancedClient.fetch('*[_type == "post"][0]._id');
        break;
        
      case 'write':
        if (!testData) {
          throw new Error('testData is required for write operations');
        }
        result = await enhancedClient.create({
          _type: 'healthCheck',
          ...testData,
          timestamp: new Date().toISOString()
        });
        // Clean up test document
        await enhancedClient.delete(result._id);
        break;
        
      case 'delete':
        // Create a test document first
        const testDoc = await enhancedClient.create({
          _type: 'healthCheck',
          title: 'Test document for deletion',
          timestamp: new Date().toISOString()
        });
        // Then delete it
        result = await enhancedClient.delete(testDoc._id);
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    console.log(`✅ Sanity ${operation} test completed successfully`);
    
    return NextResponse.json({
      success: true,
      operation,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Sanity operation test failed:`, error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Operation test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}