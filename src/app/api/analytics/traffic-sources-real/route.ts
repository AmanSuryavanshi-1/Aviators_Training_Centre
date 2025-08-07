import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real traffic sources data...');
    
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

    console.log(`📅 Fetching traffic sources for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch detailed traffic sources
    const [trafficResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 20
    });

    // Fetch basic metrics for totals
    const [basicResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' }
      ],
    });

    // Process basic metrics
    const basicMetrics = basicResponse.rows?.[0]?.metricValues || [];
    const totalUsers = parseInt(basicMetrics[0]?.value || '0');
    const totalSessions = parseInt(basicMetrics[1]?.value || '0');
    const totalPageviews = parseInt(basicMetrics[2]?.value || '0');

    // Process traffic sources
    const allSources = trafficResponse.rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || 'unknown',
      medium: row.dimensionValues?.[1]?.value || 'unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
      percentage: Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalUsers) * 100)
    })) || [];

    // Categorize sources
    const organicSources = allSources.filter(source => 
      ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'].includes(source.source.toLowerCase()) ||
      source.medium === 'organic'
    );
    
    const socialSources = allSources.filter(source => 
      ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'reddit.com'].includes(source.source.toLowerCase()) ||
      source.medium === 'social'
    );
    
    const directSources = allSources.filter(source => 
      ['(direct)', 'direct', 'none'].includes(source.source.toLowerCase()) ||
      source.medium === '(none)'
    );
    
    const referralSources = allSources.filter(source => 
      source.medium === 'referral' ||
      (!organicSources.includes(source) && !socialSources.includes(source) && !directSources.includes(source))
    );

    console.log(`📊 Real traffic sources: ${allSources.length} sources, ${totalUsers} total users`);

    const trafficSourcesData = {
      // Overall summary
      totalUsers,
      totalSessions,
      totalPageviews,
      
      // All sources (detailed)
      allSources: allSources.slice(0, 15),
      
      // Categorized sources
      categories: {
        direct: {
          name: 'Direct Traffic',
          users: directSources.reduce((sum, source) => sum + source.users, 0),
          sessions: directSources.reduce((sum, source) => sum + source.sessions, 0),
          pageviews: directSources.reduce((sum, source) => sum + source.pageviews, 0),
          percentage: Math.round((directSources.reduce((sum, source) => sum + source.users, 0) / totalUsers) * 100),
          sources: directSources
        },
        organic: {
          name: 'Organic Search',
          users: organicSources.reduce((sum, source) => sum + source.users, 0),
          sessions: organicSources.reduce((sum, source) => sum + source.sessions, 0),
          pageviews: organicSources.reduce((sum, source) => sum + source.pageviews, 0),
          percentage: Math.round((organicSources.reduce((sum, source) => sum + source.users, 0) / totalUsers) * 100),
          sources: organicSources
        },
        social: {
          name: 'Social Media',
          users: socialSources.reduce((sum, source) => sum + source.users, 0),
          sessions: socialSources.reduce((sum, source) => sum + source.sessions, 0),
          pageviews: socialSources.reduce((sum, source) => sum + source.pageviews, 0),
          percentage: Math.round((socialSources.reduce((sum, source) => sum + source.users, 0) / totalUsers) * 100),
          sources: socialSources
        },
        referral: {
          name: 'Referral Sites',
          users: referralSources.reduce((sum, source) => sum + source.users, 0),
          sessions: referralSources.reduce((sum, source) => sum + source.sessions, 0),
          pageviews: referralSources.reduce((sum, source) => sum + source.pageviews, 0),
          percentage: Math.round((referralSources.reduce((sum, source) => sum + source.users, 0) / totalUsers) * 100),
          sources: referralSources
        }
      },
      
      // Top performing sources
      topSources: allSources.slice(0, 10)
    };

    return NextResponse.json({
      success: true,
      data: trafficSourcesData,
      timeframe,
      dateRange: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
      metadata: {
        dataSource: 'real',
        hasRealData: true,
        message: `Real traffic sources: ${allSources.length} sources, ${totalUsers} total users`,
        rawMetrics: { totalUsers, totalSessions, totalPageviews, sourcesCount: allSources.length }
      }
    });

  } catch (error) {
    console.error('❌ Traffic sources API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real traffic sources data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}