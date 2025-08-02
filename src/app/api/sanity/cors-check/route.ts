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
    message: 'CORS Configuration Guide for Sanity Studio',
    requestInfo: {
      origin,
      host,
      referer,
      url: request.url,
      method: request.method,
    },
    requiredOrigins: [
      'https://www.aviatorstrainingcentre.in',
      'https://aviatorstrainingcentre.in',
    ],
    sanityConfig: {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
    detailedInstructions: {
      step1: {
        action: 'Navigate to Sanity Management Console',
        url: 'https://sanity.io/manage',
        description: 'Open the Sanity management console in a new tab'
      },
      step2: {
        action: 'Select your project',
        description: 'Find and click on "Aviators Training Centre" project',
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
      },
      step3: {
        action: 'Go to API settings',
        description: 'Click on the "API" tab in the project settings'
      },
      step4: {
        action: 'Add CORS origins',
        description: 'In the CORS Origins section, add the following origins:',
        origins: [
          {
            url: 'https://www.aviatorstrainingcentre.in',
            credentials: true,
            description: 'Primary production domain'
          },
          {
            url: 'https://aviatorstrainingcentre.in',
            credentials: true,
            description: 'Alternative domain (without www)'
          }
        ]
      },
      step5: {
        action: 'Enable credentials',
        description: 'Make sure "Allow credentials" is checked for both origins'
      },
      step6: {
        action: 'Save and wait',
        description: 'Save the configuration and wait 1-2 minutes for propagation'
      }
    },
    verificationSteps: {
      step1: 'After saving, visit https://www.aviatorstrainingcentre.in/studio',
      step2: 'Check browser console for CORS errors',
      step3: 'Try to authenticate with Sanity Studio',
      step4: 'Visit https://www.aviatorstrainingcentre.in/admin to test unified auth'
    },
    troubleshooting: {
      stillGettingCORSErrors: [
        'Wait 2-3 minutes for DNS propagation',
        'Clear browser cache and cookies',
        'Try in incognito/private browsing mode',
        'Check that credentials are enabled for the origin'
      ],
      studioNotLoading: [
        'Verify the basePath is set to /studio in sanity.config.ts',
        'Check that the project ID and dataset are correct',
        'Ensure the studio is properly deployed'
      ]
    },
    timestamp: new Date().toISOString(),
  });
}