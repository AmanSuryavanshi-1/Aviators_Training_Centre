import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real user journeys data...');
    
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

    console.log(`📅 Fetching user journeys for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch basic metrics
    const [basicResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'engagementRate' }
      ],
    });

    // Fetch landing pages
    const [landingResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'landingPage' }, { name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'bounceRate' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    });

    // Fetch top pages with engagement
    const [pagesResponse] = await analyticsClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 15
    });

    // Process basic metrics
    const basicMetrics = basicResponse.rows?.[0]?.metricValues || [];
    const totalUsers = parseInt(basicMetrics[0]?.value || '0');
    const totalSessions = parseInt(basicMetrics[1]?.value || '0');
    const totalPageviews = parseInt(basicMetrics[2]?.value || '0');
    const bounceRate = parseFloat(basicMetrics[3]?.value || '0');
    const engagementRate = parseFloat(basicMetrics[4]?.value || '0');

    // Process landing pages
    const landingPages = landingResponse.rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value || '',
      fullPath: row.dimensionValues?.[1]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      bounceRate: parseFloat(row.metricValues?.[1]?.value || '0'),
      percentage: totalSessions > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalSessions) * 100) : 0,
      conversionRate: 100 - parseFloat(row.metricValues?.[1]?.value || '0') // Simplified conversion rate
    })) || [];

    // Process page performance
    const pagePerformance = pagesResponse.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || 'Untitled',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      avgDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
      percentage: totalPageviews > 0 ? Math.round((parseInt(row.metricValues?.[0]?.value || '0') / totalPageviews) * 100) : 0,
      // Determine page type
      isLandingPage: landingPages.some(landing => landing.page === row.dimensionValues?.[0]?.value),
      pageType: (() => {
        const path = row.dimensionValues?.[0]?.value || '';
        if (path === '/' || path === '/home') return 'homepage';
        if (path.includes('/blog')) return 'blog';
        if (path.includes('/course')) return 'course';
        if (path.includes('/admin')) return 'admin';
        if (path.includes('/studio')) return 'cms';
        return 'other';
      })()
    })) || [];

    console.log(`📊 Real user journey data: ${landingPages.length} landing pages, ${pagePerformance.length} pages analyzed`);

    const userJourneysData = {
      // Overall journey metrics
      totalSessions,
      totalUsers,
      totalPageviews,
      avgPagesPerSession: totalSessions > 0 ? Math.round((totalPageviews / totalSessions) * 100) / 100 : 0,
      avgSessionDuration: engagementRate > 0 ? Math.round(engagementRate * 60) : 0, // Convert to seconds
      bounceRate,
      engagementRate,
      
      // Entry points (Landing pages)
      entryPoints: {
        summary: {
          totalLandingPages: landingPages.length,
          totalEntrySessions: landingPages.reduce((sum, page) => sum + page.sessions, 0),
          avgBounceRate: landingPages.length > 0 
            ? landingPages.reduce((sum, page) => sum + page.bounceRate, 0) / landingPages.length 
            : 0
        },
        topLandingPages: landingPages.slice(0, 10)
      },
      
      // Page performance analysis
      pagePerformance: pagePerformance.slice(0, 15),
      
      // Content categories performance
      contentCategories: {
        homepage: {
          pages: pagePerformance.filter(page => page.pageType === 'homepage'),
          totalViews: pagePerformance.filter(page => page.pageType === 'homepage').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'homepage').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'homepage').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'homepage').length 
            : 0
        },
        blog: {
          pages: pagePerformance.filter(page => page.pageType === 'blog'),
          totalViews: pagePerformance.filter(page => page.pageType === 'blog').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'blog').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'blog').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'blog').length 
            : 0
        },
        courses: {
          pages: pagePerformance.filter(page => page.pageType === 'course'),
          totalViews: pagePerformance.filter(page => page.pageType === 'course').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'course').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'course').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'course').length 
            : 0
        },
        admin: {
          pages: pagePerformance.filter(page => page.pageType === 'admin'),
          totalViews: pagePerformance.filter(page => page.pageType === 'admin').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'admin').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'admin').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'admin').length 
            : 0
        },
        cms: {
          pages: pagePerformance.filter(page => page.pageType === 'cms'),
          totalViews: pagePerformance.filter(page => page.pageType === 'cms').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'cms').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'cms').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'cms').length 
            : 0
        },
        other: {
          pages: pagePerformance.filter(page => page.pageType === 'other'),
          totalViews: pagePerformance.filter(page => page.pageType === 'other').reduce((sum, page) => sum + page.views, 0),
          avgDuration: pagePerformance.filter(page => page.pageType === 'other').length > 0 
            ? pagePerformance.filter(page => page.pageType === 'other').reduce((sum, page) => sum + page.avgDuration, 0) / pagePerformance.filter(page => page.pageType === 'other').length 
            : 0
        }
      },
      
      // User flow insights
      userFlowInsights: {
        mostPopularEntryPoints: landingPages.slice(0, 5),
        highestEngagementPages: pagePerformance
          .filter(page => page.avgDuration > 0)
          .sort((a, b) => b.avgDuration - a.avgDuration)
          .slice(0, 5),
        mostViewedContent: pagePerformance.slice(0, 5)
      }
    };

    return NextResponse.json({
      success: true,
      data: userJourneysData,
      timeframe,
      dateRange: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
      metadata: {
        dataSource: 'real',
        hasRealData: true,
        message: `Real user journeys: ${landingPages.length} landing pages, ${pagePerformance.length} pages analyzed`,
        rawMetrics: {
          totalSessions,
          totalUsers,
          totalPageviews,
          bounceRate,
          engagementRate,
          landingPagesCount: landingPages.length,
          pagesAnalyzed: pagePerformance.length
        }
      }
    });

  } catch (error) {
    console.error('❌ User journeys API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real user journeys data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}