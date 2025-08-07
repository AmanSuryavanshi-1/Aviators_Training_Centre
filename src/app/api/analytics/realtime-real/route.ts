import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real realtime data...');
    
    // Initialize GA4 client (same as diagnostic)
    const serviceAccount = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY!);
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      projectId: serviceAccount.project_id,
    });

    console.log('📅 Fetching realtime data...');

    // Fetch realtime active users
    const [realtimeResponse] = await analyticsClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
    });

    // Fetch realtime top pages
    const [realtimePagesResponse] = await analyticsClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5
    });

    // Fetch realtime traffic sources
    const [realtimeSourcesResponse] = await analyticsClient.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [{ name: 'source' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 5
    });

    // Process realtime metrics
    const realtimeMetrics = realtimeResponse.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(realtimeMetrics[0]?.value || '0');
    const currentPageViews = parseInt(realtimeMetrics[1]?.value || '0');

    // Process realtime top pages
    const topPages = realtimePagesResponse.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || 'Untitled',
      views: parseInt(row.metricValues?.[0]?.value || '0')
    })) || [];

    // Process realtime traffic sources
    const totalRealtimeUsers = realtimeSourcesResponse.rows?.reduce((sum, row) => 
      sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;
    
    const topSources = realtimeSourcesResponse.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || 'unknown',
      visitors: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalRealtimeUsers) * 100)
    })) || [];

    console.log(`📊 Real realtime data: ${activeUsers} active users, ${currentPageViews} pageviews`);

    const realtimeData = {
      activeUsers,
      currentPageViews,
      conversionsToday: 0, // GA4 doesn't provide this in realtime
      topPages,
      topSources,
      alerts: [],
      lastUpdated: new Date().toISOString()
    };

    const hasRealData = activeUsers > 0 || currentPageViews > 0 || topPages.length > 0;

    return NextResponse.json({
      success: true,
      data: realtimeData,
      metadata: {
        type: 'realtime',
        timestamp: new Date().toISOString(),
        source: hasRealData ? 'GA4-Realtime' : 'No-Data',
        serviceStatus: 'connected',
        dataSource: hasRealData ? 'real' : 'no_data',
        hasRealData,
        message: hasRealData 
          ? `Real-time data: ${activeUsers} active users, ${currentPageViews} pageviews`
          : 'No real-time activity detected. Data will appear when visitors are actively using your website.'
      }
    });

  } catch (error) {
    console.error('❌ Realtime analytics API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real realtime data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}