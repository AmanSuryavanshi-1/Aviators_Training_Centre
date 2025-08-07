import { NextRequest, NextResponse } from 'next/server';
import { createRealGA4Client } from '@/lib/analytics/RealGA4Client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real traffic sources data...');
    
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

    console.log(`📅 Fetching traffic sources for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch real data from GA4
    const realGA4Client = createRealGA4Client();
    const realData = await realGA4Client.getHistoricalData(startDate, endDate);
    
    console.log(`📊 Real traffic sources: ${realData.trafficSources.length} sources, ${realData.activeUsers} total users`);

    // Categorize traffic sources
    const organicSources = realData.trafficSources.filter(source => 
      ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'].includes(source.source.toLowerCase())
    );
    
    const socialSources = realData.trafficSources.filter(source => 
      ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'reddit', 'pinterest'].includes(source.source.toLowerCase())
    );
    
    const aiSources = realData.trafficSources.filter(source => 
      ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity', 'you.com', 'phind'].includes(source.source.toLowerCase())
    );
    
    const directSources = realData.trafficSources.filter(source => 
      ['direct', '(direct)', 'none'].includes(source.source.toLowerCase())
    );
    
    const referralSources = realData.trafficSources.filter(source => 
      !organicSources.includes(source) && 
      !socialSources.includes(source) && 
      !aiSources.includes(source) && 
      !directSources.includes(source)
    );

    const trafficSourcesData = {
      // Overall summary
      totalUsers: realData.activeUsers,
      totalSessions: realData.sessions,
      totalPageviews: realData.pageviews,
      
      // All sources (detailed)
      allSources: realData.trafficSources,
      
      // Categorized sources
      categories: {
        organic: {
          name: 'Organic Search',
          users: organicSources.reduce((sum, source) => sum + source.users, 0),
          percentage: Math.round((organicSources.reduce((sum, source) => sum + source.users, 0) / realData.activeUsers) * 100),
          sources: organicSources
        },
        direct: {
          name: 'Direct Traffic',
          users: directSources.reduce((sum, source) => sum + source.users, 0),
          percentage: Math.round((directSources.reduce((sum, source) => sum + source.users, 0) / realData.activeUsers) * 100),
          sources: directSources
        },
        social: {
          name: 'Social Media',
          users: socialSources.reduce((sum, source) => sum + source.users, 0),
          percentage: Math.round((socialSources.reduce((sum, source) => sum + source.users, 0) / realData.activeUsers) * 100),
          sources: socialSources
        },
        ai: {
          name: 'AI Platforms',
          users: aiSources.reduce((sum, source) => sum + source.users, 0),
          percentage: Math.round((aiSources.reduce((sum, source) => sum + source.users, 0) / realData.activeUsers) * 100),
          sources: aiSources
        },
        referral: {
          name: 'Referral Sites',
          users: referralSources.reduce((sum, source) => sum + source.users, 0),
          percentage: Math.round((referralSources.reduce((sum, source) => sum + source.users, 0) / realData.activeUsers) * 100),
          sources: referralSources
        }
      },
      
      // Top performing sources
      topSources: realData.trafficSources.slice(0, 10),
      
      // Search engine breakdown
      searchEngines: organicSources,
      
      // Social media breakdown
      socialPlatforms: socialSources,
      
      // AI platform breakdown
      aiPlatforms: aiSources,
      
      // Geographic distribution by source (simplified)
      geographicBreakdown: realData.countries.slice(0, 10)
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
        message: `Showing real traffic sources: ${realData.trafficSources.length} sources, ${realData.activeUsers} total users`,
        rawMetrics: {
          totalSources: realData.trafficSources.length,
          activeUsers: realData.activeUsers,
          sessions: realData.sessions,
          pageviews: realData.pageviews
        }
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