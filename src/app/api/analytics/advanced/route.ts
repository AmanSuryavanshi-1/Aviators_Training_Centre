import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/analytics/AuthenticationManager';
import { GA4Client } from '@/lib/analytics/GA4Client';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events';
    const startDate = new Date(searchParams.get('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    const endDate = new Date(searchParams.get('end') || new Date().toISOString());
    
    // Check authentication status
    const authStatus = await authManager.getServiceStatus();
    const ga4Status = authStatus.find(s => s.service === 'Google Analytics 4');
    
    let data = null;
    let totalCount = 0;
    let hasRealData = false;
    
    // ONLY try to get real data if GA4 is properly connected
    if (ga4Status?.status === 'connected') {
      try {
        const ga4Client = new GA4Client({
          propertyId: process.env.GA4_PROPERTY_ID!,
          serviceAccountKey: process.env.GA4_SERVICE_ACCOUNT_KEY,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
        
        const dateRange = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
        
        switch (type) {
          case 'events':
            const historicalData = await ga4Client.getHistoricalData(dateRange);
            if (historicalData && (historicalData.totalUsers > 0 || historicalData.pageviews > 0)) {
              data = {
                totalUsers: historicalData.totalUsers,
                pageviews: historicalData.pageviews,
                sessions: historicalData.sessions,
                conversions: historicalData.conversions
              };
              hasRealData = true;
              totalCount = 1;
            }
            break;
            
          case 'pages':
            const realtimeData = await ga4Client.getRealtimeData();
            if (realtimeData && realtimeData.topPages && realtimeData.topPages.length > 0) {
              data = realtimeData.topPages;
              hasRealData = true;
              totalCount = data.length;
            }
            break;
            
          default:
            data = null;
            totalCount = 0;
        }
      } catch (ga4Error) {
        console.error('GA4 connection failed:', ga4Error);
        data = null;
        hasRealData = false;
      }
    }

    // If no real data, return null/empty - NO FAKE DATA
    if (!hasRealData) {
      data = null;
      totalCount = 0;
    }

    const metadata = {
      totalCount,
      filteredCount: totalCount,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      processingTime: Date.now() - startTime,
      cacheHit: false,
      dataQuality: { 
        score: hasRealData ? 100 : 0, 
        issues: hasRealData ? [] : ['No real analytics data available yet'] 
      },
      source: hasRealData ? 'GA4-Real' : 'No-Data',
      hasRealData,
      serviceStatus: ga4Status?.status || 'unknown',
      message: hasRealData ? 'Showing real analytics data' : 'No analytics data available. Data will appear once visitors start using your website.'
    };

    return NextResponse.json({
      success: true,
      data,
      metadata
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json({
      success: false,
      data: null,
      error: 'Analytics data unavailable',
      metadata: {
        totalCount: 0,
        filteredCount: 0,
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        processingTime: Date.now() - startTime,
        cacheHit: false,
        dataQuality: { score: 0, issues: ['API error - no data available'] },
        source: 'Error',
        hasRealData: false
      }
    }, { status: 503 });
  }
}