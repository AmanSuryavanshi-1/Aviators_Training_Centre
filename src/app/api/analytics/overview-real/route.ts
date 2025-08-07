import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real overview analytics data...');
    
    // Initialize GA4 client (same as diagnostic)
    const serviceAccount = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY!);
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      projectId: serviceAccount.project_id,
    });

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'week';
    
    // Set date range
    let startDate = '7daysAgo';
    let endDate = 'today';
    
    switch (timeframe) {
      case 'day': startDate = 'yesterday'; endDate = 'today'; break;
      case 'week': startDate = '7daysAgo'; endDate = 'today'; break;
      case 'month': startDate = '30daysAgo'; endDate = 'today'; break;
      case 'quarter': startDate = '90daysAgo'; endDate = 'today'; break;
      case 'year': startDate = '365daysAgo'; endDate = 'today'; break;
    }

    console.log(`📅 Fetching overview data for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch basic metrics (same as diagnostic)
    const [basicResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'engagementRate' }
      ],
    });

    // Fetch traffic sources
    const [trafficResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    });

    // Fetch top pages
    const [pagesResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10
    });

    // Process basic metrics
    const basicMetrics = basicResponse.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(basicMetrics[0]?.value || '0');
    const pageviews = parseInt(basicMetrics[1]?.value || '0');
    const sessions = parseInt(basicMetrics[2]?.value || '0');
    const bounceRate = parseFloat(basicMetrics[3]?.value || '0');
    const engagementRate = parseFloat(basicMetrics[4]?.value || '0');

    // Process traffic sources
    const trafficSources = trafficResponse.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || 'unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / activeUsers) * 100)
    })) || [];

    // Process top pages
    const topPages = pagesResponse.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || 'Untitled',
      views: parseInt(row.metricValues?.[0]?.value || '0')
    })) || [];

    console.log(`📊 Real overview data: ${pageviews} pageviews, ${activeUsers} users, ${sessions} sessions`);

    const overviewData = {
      // Core metrics - REAL DATA ONLY
      totalVisitors: activeUsers,
      totalPageviews: pageviews,
      totalSessions: sessions,
      bounceRate: bounceRate,
      avgSessionDuration: engagementRate > 0 ? Math.round(engagementRate * 60) : 0,
      
      // Top content
      topPages: topPages.slice(0, 5),
      
      // Traffic sources
      trafficSources: trafficSources.slice(0, 8),
      
      // Engagement metrics
      engagementMetrics: {
        engagementRate: engagementRate,
        bounceRate: bounceRate,
        pagesPerSession: sessions > 0 ? Math.round((pageviews / sessions) * 100) / 100 : 0
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
        message: `Real overview data: ${pageviews} pageviews, ${activeUsers} users, ${sessions} sessions`,
        rawMetrics: { activeUsers, pageviews, sessions, bounceRate, engagementRate }
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