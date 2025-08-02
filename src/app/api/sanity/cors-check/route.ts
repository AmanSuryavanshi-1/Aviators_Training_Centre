/**
 * Sanity CORS Configuration Check
 * Helps debug CORS issues with Sanity Studio
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || 'unknown';
  const host = request.headers.get('host') || 'unknown';
  const referer = request.headers.get('referer') || 'unknown';
  
  return NextResponse.json({
    message: 'CORS Check for Sanity Studio',
    requestInfo: {
      origin,
      host,
      referer,
      url: request.url,
      method: request.method,
    },
    expectedOrigins: [
      'https://www.aviatorstrainingcentre.in',
      'https://aviatorstrainingcentre.in',
    ],
    sanityConfig: {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
    instructions: {
      step1: 'Go to https://sanity.io/manage',
      step2: 'Select your project: Aviators Training Centre',
      step3: 'Go to API tab',
      step4: 'Add CORS origin: https://www.aviatorstrainingcentre.in',
      step5: 'Enable "Allow credentials"',
      step6: 'Save and wait 1-2 minutes for propagation',
    },
    timestamp: new Date().toISOString(),
  });
}