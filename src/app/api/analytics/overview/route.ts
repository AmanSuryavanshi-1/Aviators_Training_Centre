import { NextRequest, NextResponse } from 'next/server';
import { createRealGA4Client } from '@/lib/analytics/RealGA4Client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real overview analytics data...');
    
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'week';
    
    // Set date range based on timeframe
    let startDate = '7daysAgo';
    let endDate = 'today';
    
    switch (timeframe) {
      case 'day':
        startDate = 'yesterday';
        endDate = 'today';
        break;
      case 'week':
        startDate = '7daysAgo';
        endDate = 'today';
        break;
      case 'month':
        startDate = '30daysAgo';
        endDate = 'today';
        break;
      case 'quarter':
        startDate = '90daysAgo';
        endDate = 'today';
        break;
      case 'year':
        startDate = '365daysAgo';
        endDate = 'today';
        break;
    }

    console.log(`📅 Fetching overview data for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch real data from GA4
    const realGA4Client = createRealGA4Client();
    const realData = await realGA4Client.getHistoricalData(startDate, endDate);
    
    console.log(`📊 Real overview data: ${realData.pageviews} pageviews, ${realData.activeUsers} users, ${realData.sessions} sessions`);

    const overviewData = {
      // Core metrics - REAL DATA ONLY
      totalVisitors: realData.activeUsers,
      totalPageviews: realData.pageviews,
      totalSessions: realData.sessions,
      bounceRate: realData.bounceRate,
      avgSessionDuration: realData.engagementRate > 0 ? Math.round(realData.engagementRate * 60) : 0, // Convert to seconds
      
      // Growth metrics (compared to previous period - simplified)
      visitorGrowth: 0, // Would need previous period data
      pageviewGrowth: 0, // Would need previous period data
      sessionGrowth: 0, // Would need previous period data
      
      // Top performing content
      topPages: realData.topPages.slice(0, 5),
      
      // Traffic overview
      trafficSources: realData.trafficSources.slice(0, 8),
      
      // Device breakdown
      deviceBreakdown: [
        { device: 'Desktop', users: realData.deviceTypes.desktop, percentage: realData.activeUsers > 0 ? Math.round((realData.deviceTypes.desktop / realData.activeUsers) * 100) : 0 },
        { device: 'Mobile', users: realData.deviceTypes.mobile, percentage: realData.activeUsers > 0 ? Math.round((realData.deviceTypes.mobile / realData.activeUsers) * 100) : 0 },
        { device: 'Tablet', users: realData.deviceTypes.tablet, percentage: realData.activeUsers > 0 ? Math.round((realData.deviceTypes.tablet / realData.activeUsers) * 100) : 0 }
      ],
      
      // Geographic data
      topCountries: realData.countries.slice(0, 5),
      
      // Browser data
      topBrowsers: realData.browsers.slice(0, 5),
      
      // Engagement metrics
      engagementMetrics: {
        engagementRate: realData.engagementRate,
        bounceRate: realData.bounceRate,
        pagesPerSession: realData.sessions > 0 ? Math.round((realData.pageviews / realData.sessions) * 100) / 100 : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: overviewData,
      timeframe,
      dateRange: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
      metadata: {
        dataSource: 'real',
        hasRealData: true,
        message: `Showing real overview data: ${realData.pageviews} pageviews, ${realData.activeUsers} users, ${realData.sessions} sessions`,
        rawMetrics: {
          activeUsers: realData.activeUsers,
          pageviews: realData.pageviews,
          sessions: realData.sessions,
          bounceRate: realData.bounceRate,
          engagementRate: realData.engagementRate
        }
      }
    });

  } catch (error) {
    console.error('❌ Overview analytics API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real overview data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}