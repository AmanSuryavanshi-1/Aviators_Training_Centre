import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching comprehensive real analytics summary...');
    
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

    console.log(`📅 Fetching comprehensive summary for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch all data in parallel for better performance
    const [
      basicResponse,
      trafficResponse,
      pagesResponse,
      deviceResponse,
      countryResponse,
      landingResponse
    ] = await Promise.all([
      // Basic metrics
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' }
        ],
      }),
      
      // Traffic sources
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15
      }),
      
      // Top pages
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      }),
      
      // Device types
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      
      // Countries
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10
      }),
      
      // Landing pages
      analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      })
    ]);

    // Process all data
    const basicMetrics = basicResponse[0].rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(basicMetrics[0]?.value || '0');
    const pageviews = parseInt(basicMetrics[1]?.value || '0');
    const sessions = parseInt(basicMetrics[2]?.value || '0');
    const bounceRate = parseFloat(basicMetrics[3]?.value || '0');
    const engagementRate = parseFloat(basicMetrics[4]?.value || '0');
    const avgSessionDuration = parseFloat(basicMetrics[5]?.value || '0');

    const trafficSources = trafficResponse[0].rows?.map(row => ({
      source: row.dimensionValues?.[0]?.value || 'unknown',
      medium: row.dimensionValues?.[1]?.value || 'unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      percentage: activeUsers > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / activeUsers) * 100) : 0
    })) || [];

    const topPages = pagesResponse[0].rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || 'Untitled',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      avgDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
      percentage: pageviews > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / pageviews) * 100) : 0
    })) || [];

    const deviceTypes = { desktop: 0, mobile: 0, tablet: 0 };
    deviceResponse[0].rows?.forEach(row => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase() || 'unknown';
      const users = parseInt(row.metricValues?.[0]?.value || '0');
      if (device in deviceTypes) {
        deviceTypes[device as keyof typeof deviceTypes] = users;
      }
    });

    const countries = countryResponse[0].rows?.map(row => ({
      country: row.dimensionValues?.[0]?.value || 'unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: activeUsers > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / activeUsers) * 100) : 0
    })) || [];

    const landingPages = landingResponse[0].rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[1]?.value || '0'),
      percentage: sessions > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / sessions) * 100) : 0
    })) || [];

    console.log(`📊 Real comprehensive summary: ${pageviews} pageviews, ${activeUsers} users, ${sessions} sessions`);

    const comprehensiveSummary = {
      // Core metrics
      overview: {
        totalUsers: activeUsers,
        totalPageviews: pageviews,
        totalSessions: sessions,
        bounceRate: bounceRate,
        engagementRate: engagementRate,
        avgSessionDuration: avgSessionDuration,
        avgPagesPerSession: sessions > 0 ? Math.round((pageviews / sessions) * 100) / 100 : 0
      },
      
      // Traffic analysis
      traffic: {
        sources: trafficSources.slice(0, 10),
        totalSources: trafficSources.length,
        topSource: trafficSources[0] || null,
        // Categorize sources
        categories: {
          direct: trafficSources.filter(s => ['(direct)', 'direct'].includes(s.source.toLowerCase()) || s.medium === '(none)').reduce((sum, s) => sum + s.users, 0),
          organic: trafficSources.filter(s => s.medium === 'organic').reduce((sum, s) => sum + s.users, 0),
          social: trafficSources.filter(s => s.medium === 'social' || ['facebook.com', 'instagram.com', 'twitter.com'].includes(s.source.toLowerCase())).reduce((sum, s) => sum + s.users, 0),
          referral: trafficSources.filter(s => s.medium === 'referral').reduce((sum, s) => sum + s.users, 0)
        }
      },
      
      // Content performance
      content: {
        topPages: topPages.slice(0, 8),
        totalPages: topPages.length,
        mostViewedPage: topPages[0] || null,
        highestEngagementPage: topPages.sort((a, b) => b.avgDuration - a.avgDuration)[0] || null,
        // Content categories
        categories: {
          blog: topPages.filter(p => p.path.includes('/blog')),
          admin: topPages.filter(p => p.path.includes('/admin') || p.path.includes('/studio')),
          homepage: topPages.filter(p => p.path === '/' || p.path === '/home'),
          other: topPages.filter(p => !p.path.includes('/blog') && !p.path.includes('/admin') && !p.path.includes('/studio') && p.path !== '/' && p.path !== '/home')
        }
      },
      
      // User behavior
      userBehavior: {
        landingPages: landingPages.slice(0, 5),
        topLandingPage: landingPages[0] || null,
        avgBounceRate: landingPages.length > 0 ? landingPages.reduce((sum, p) => sum + p.bounceRate, 0) / landingPages.length : 0,
        deviceBreakdown: [
          { device: 'Desktop', users: deviceTypes.desktop, percentage: activeUsers > 0 ? Math.round((deviceTypes.desktop / activeUsers) * 100) : 0 },
          { device: 'Mobile', users: deviceTypes.mobile, percentage: activeUsers > 0 ? Math.round((deviceTypes.mobile / activeUsers) * 100) : 0 },
          { device: 'Tablet', users: deviceTypes.tablet, percentage: activeUsers > 0 ? Math.round((deviceTypes.tablet / activeUsers) * 100) : 0 }
        ]
      },
      
      // Geographic data
      geography: {
        countries: countries.slice(0, 5),
        topCountry: countries[0] || null,
        totalCountries: countries.length
      },
      
      // Performance insights
      insights: {
        // Key performance indicators
        kpis: {
          userEngagement: engagementRate > 0.5 ? 'High' : engagementRate > 0.3 ? 'Medium' : 'Low',
          contentPerformance: avgSessionDuration > 120 ? 'Excellent' : avgSessionDuration > 60 ? 'Good' : 'Needs Improvement',
          trafficQuality: bounceRate < 0.4 ? 'High Quality' : bounceRate < 0.6 ? 'Medium Quality' : 'Low Quality'
        },
        
        // Growth opportunities
        opportunities: [
          ...(bounceRate > 0.5 ? ['Reduce bounce rate by improving page load speed and content relevance'] : []),
          ...(avgSessionDuration < 60 ? ['Increase session duration with more engaging content'] : []),
          ...(trafficSources.filter(s => s.medium === 'organic').length < 3 ? ['Improve SEO to increase organic traffic'] : []),
          ...(deviceTypes.mobile < activeUsers * 0.3 ? ['Optimize for mobile users'] : [])
        ],
        
        // Top performing elements
        topPerformers: {
          bestLandingPage: landingPages.sort((a, b) => a.bounceRate - b.bounceRate)[0] || null,
          mostEngagingContent: topPages.sort((a, b) => b.avgDuration - a.avgDuration)[0] || null,
          primaryTrafficSource: trafficSources[0] || null
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: comprehensiveSummary,
      timeframe,
      dateRange: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
      metadata: {
        dataSource: 'real',
        hasRealData: true,
        message: `Comprehensive real analytics summary: ${pageviews} pageviews, ${activeUsers} users, ${sessions} sessions`,
        dataQuality: 'high',
        completeness: {
          overview: true,
          traffic: trafficSources.length > 0,
          content: topPages.length > 0,
          userBehavior: landingPages.length > 0,
          geography: countries.length > 0
        },
        rawMetrics: {
          activeUsers,
          pageviews,
          sessions,
          bounceRate,
          engagementRate,
          avgSessionDuration,
          sourcesCount: trafficSources.length,
          pagesCount: topPages.length,
          countriesCount: countries.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Comprehensive summary API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch comprehensive real analytics summary',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}