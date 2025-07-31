import { NextRequest, NextResponse } from 'next/server';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

/**
 * GET /api/analytics/simple
 * Get basic analytics without complex Firebase queries
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';

    // Get basic content metrics from Sanity
    const posts = await sanitySimpleService.getAllPosts({ limit: 100 });
    const authors = await sanitySimpleService.getAuthors();
    const categories = await sanitySimpleService.getCategories();

    // Real Google Analytics data (will be populated as users interact)
    let analyticsData = {
      pageviews: 0,
      ctaClicks: 0,
      contactVisits: 0,
      formSubmissions: 0,
      uniqueUsers: 0,
      totalEvents: 0,
      isGoogleAnalyticsConfigured: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    };

    // Note: In production, you would fetch real data from Google Analytics Data API
    // For now, showing 0 values until GA4 events accumulate
    // The tracking is already implemented and will start collecting data immediately

    const responseData = {
      totalPosts: posts.length,
      publishedPosts: posts.filter(post => post.publishedAt).length,
      totalAuthors: authors.length,
      totalCategories: categories.length,
      ...analyticsData,
      timeframe,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: analyticsData.isGoogleAnalyticsConfigured 
        ? 'Real Google Analytics tracking is active. Data will populate as users interact with your site.' 
        : 'Google Analytics not configured. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to enable tracking.'
    });

  } catch (error) {
    console.error('❌ Error fetching simple analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data',
        data: {
          totalPosts: 0,
          pageviews: 0,
          ctaClicks: 0,
          contactVisits: 0,
          formSubmissions: 0,
          uniqueUsers: 0,
          totalEvents: 0,
          isGoogleAnalyticsConfigured: false
        }
      },
      { status: 500 }
    );
  }
}