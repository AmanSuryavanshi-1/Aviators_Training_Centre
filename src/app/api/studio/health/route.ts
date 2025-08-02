/**
 * Studio Health Check API
 * Tests Sanity Studio configuration and connectivity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const requiredEnvVars = {
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
      NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        missing: missingEnvVars,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Test Sanity client connection
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });

    // Test basic query
    const testQuery = '*[_type == "post"][0...1]{_id, title}';
    const testResult = await client.fetch(testQuery);

    // Test write permissions (if token is provided)
    let writePermissions = false;
    if (process.env.SANITY_API_TOKEN) {
      try {
        // Try to fetch project info to test permissions
        await client.request({
          url: `/projects/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`,
          method: 'GET',
        });
        writePermissions = true;
      } catch (error) {
        console.warn('Write permissions test failed:', error);
      }
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Studio configuration is working',
      config: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
        hasToken: !!process.env.SANITY_API_TOKEN,
        writePermissions,
      },
      test: {
        queryResult: testResult,
        queryCount: testResult?.length || 0,
      },
      urls: {
        studio: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/studio`,
        admin: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Studio health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Studio health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}