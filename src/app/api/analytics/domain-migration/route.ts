import { NextRequest, NextResponse } from 'next/server';

// Track domain migration analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';

    // This endpoint helps you understand traffic distribution between domains
    const migrationData = {
      currentDomain: 'www.aviatorstrainingcentre.in',
      oldDomain: 'aviators-training-centre.vercel.app',
      migrationDate: '2024-01-31', // Update with your actual migration date
      
      // Traffic distribution (you'll get real data from GA4)
      trafficDistribution: {
        'www.aviatorstrainingcentre.in': {
          visitors: 0, // Will be populated from GA4
          percentage: 0,
          isTarget: true
        },
        'aviators-training-centre.vercel.app': {
          visitors: 0, // Will be populated from GA4
          percentage: 0,
          isTarget: false
        }
      },
      
      // SEO impact tracking
      seoMetrics: {
        organicTraffic: {
          newDomain: 0,
          oldDomain: 0,
          change: 0
        },
        rankings: {
          'pilot training india': { position: 0, change: 0 },
          'DGCA ground school': { position: 0, change: 0 },
          'aviators training centre': { position: 0, change: 0 }
        }
      },
      
      // Recommendations
      recommendations: [
        {
          priority: 'HIGH',
          action: 'Update Google Analytics Data Stream',
          description: 'Change data stream URL from Vercel to custom domain',
          status: 'PENDING'
        },
        {
          priority: 'HIGH',
          action: 'Set up 301 Redirects',
          description: 'Redirect all Vercel traffic to custom domain',
          status: 'PENDING'
        },
        {
          priority: 'MEDIUM',
          action: 'Update Search Console',
          description: 'Add new domain property in Google Search Console',
          status: 'PENDING'
        },
        {
          priority: 'MEDIUM',
          action: 'Update Social Media Links',
          description: 'Change all social media profile links to new domain',
          status: 'PENDING'
        }
      ],
      
      // Analytics setup status
      analyticsStatus: {
        googleAnalytics: {
          configured: true,
          measurementId: 'G-XSRFEJCB7N',
          domainCorrect: false, // Will be true once you update the data stream
          customEventsWorking: true
        },
        searchConsole: {
          oldDomainVerified: true,
          newDomainVerified: false // You need to verify the new domain
        },
        metaPixel: {
          configured: true,
          pixelId: '1982191385652109',
          domainCorrect: true
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: migrationData,
      message: 'Domain migration analytics retrieved',
      nextSteps: [
        '1. Update GA4 data stream URL to www.aviatorstrainingcentre.in',
        '2. Add new domain to Google Search Console',
        '3. Set up 301 redirects from Vercel to custom domain',
        '4. Monitor traffic distribution for next 30 days',
        '5. Update all external links and social media profiles'
      ]
    });

  } catch (error) {
    console.error('Error fetching domain migration data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch migration data'
    }, { status: 500 });
  }
}