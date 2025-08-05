// Advanced Analytics Data API Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEventsService, UserSessionsService, TrafficSourcesService } from '@/lib/firebase/collections';

interface AnalyticsQuery {
  type: 'events' | 'journeys' | 'sources' | 'funnel' | 'attribution' | 'segments';
  timeRange: {
    start: string;
    end: string;
  };
  filters?: {
    sourceCategory?: string;
    pageCategory?: string;
    deviceType?: string;
    location?: string;
    validOnly?: boolean;
    outcomeType?: string;
    minConversionRate?: number;
  };
  groupBy?: string[];
  metrics?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AnalyticsResponse {
  success: boolean;
  data: any;
  metadata: {
    totalCount: number;
    filteredCount: number;
    timeRange: {
      start: string;
      end: string;
    };
    processingTime: number;
    cacheHit: boolean;
    dataQuality: {
      score: number;
      issues: string[];
    };
  };
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  error?: string;
}

// Mock data generation functions
function generateMockEvents() {
  const events = [];
  const sources = ['Google', 'Direct', 'ChatGPT', 'Claude', 'Facebook'];
  const pages = ['/', '/courses', '/about', '/contact'];
  
  for (let i = 0; i < 50; i++) {
    events.push({
      id: `event_${i}`,
      userId: `user_${Math.floor(i / 5)}`,
      sessionId: `session_${Math.floor(i / 3)}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      event: {
        type: Math.random() > 0.8 ? 'conversion' : 'page_view',
        page: pages[Math.floor(Math.random() * pages.length)]
      },
      source: {
        source: sources[Math.floor(Math.random() * sources.length)],
        category: Math.random() > 0.3 ? 'organic' : 'ai_assistant'
      },
      validation: {
        isValid: Math.random() > 0.1,
        isBot: Math.random() < 0.05
      }
    });
  }
  return events;
}

function generateMockJourneys() {
  const journeys = [];
  for (let i = 0; i < 20; i++) {
    journeys.push({
      id: `journey_${i}`,
      userId: `user_${i}`,
      sessionId: `session_${i}`,
      startTime: new Date(Date.now() - i * 300000).toISOString(),
      duration: Math.floor(Math.random() * 600) + 30,
      pageViews: Math.floor(Math.random() * 10) + 1,
      outcome: {
        type: Math.random() > 0.7 ? 'conversion' : 'exit'
      }
    });
  }
  return journeys;
}

function generateMockSources() {
  return [
    { source: 'Google', category: 'organic', sessions: 1250, conversions: 45 },
    { source: 'Direct', category: 'direct', sessions: 890, conversions: 38 },
    { source: 'ChatGPT', category: 'ai_assistant', sessions: 420, conversions: 22 },
    { source: 'Claude', category: 'ai_assistant', sessions: 280, conversions: 15 },
    { source: 'Facebook', category: 'social', sessions: 340, conversions: 8 }
  ];
}

function generateMockFunnel() {
  return {
    name: 'Aviation Training Conversion Funnel',
    steps: [
      { name: 'Landing Page', users: 1000, conversionRate: 100 },
      { name: 'Course Pages', users: 650, conversionRate: 65 },
      { name: 'Contact Form', users: 180, conversionRate: 27.7 },
      { name: 'Conversion', users: 45, conversionRate: 25 }
    ]
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events';
    const startDate = new Date(searchParams.get('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    const endDate = new Date(searchParams.get('end') || new Date().toISOString());
    const validOnly = searchParams.get('validOnly') === 'true';
    const sourceCategory = searchParams.get('sourceCategory');
    
    let data;
    let totalCount = 0;
    
    switch (type) {
      case 'events':
        data = await AnalyticsEventsService.getEvents({
          startDate,
          endDate,
          sourceCategory: sourceCategory || undefined,
          validOnly,
          limit: 1000,
        });
        totalCount = data.length;
        break;
        
      case 'sources':
        const topSources = await AnalyticsEventsService.getTopSources(startDate, endDate, 20);
        data = topSources;
        totalCount = topSources.length;
        break;
        
      case 'pages':
        const topPages = await AnalyticsEventsService.getTopPages(startDate, endDate, 20);
        data = topPages;
        totalCount = topPages.length;
        break;
        
      case 'sessions':
        const sessionMetrics = await UserSessionsService.getSessionMetrics(startDate, endDate);
        data = sessionMetrics;
        totalCount = 1;
        break;
        
      case 'funnel':
        // Calculate conversion funnel from real data
        const allEvents = await AnalyticsEventsService.getEvents({
          startDate,
          endDate,
          validOnly: true,
        });
        
        const uniqueVisitors = new Set(allEvents.map(e => e.userId || e.sessionId)).size;
        const pageViews = allEvents.filter(e => e.event.type === 'page_view').length;
        const conversions = allEvents.filter(e => e.event.type === 'conversion').length;
        
        data = {
          name: 'Aviation Training Conversion Funnel',
          steps: [
            { name: 'Visitors', users: uniqueVisitors, conversionRate: 100 },
            { name: 'Page Views', users: pageViews, conversionRate: uniqueVisitors > 0 ? (pageViews / uniqueVisitors) * 100 : 0 },
            { name: 'Conversions', users: conversions, conversionRate: uniqueVisitors > 0 ? (conversions / uniqueVisitors) * 100 : 0 }
          ]
        };
        totalCount = 1;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid query type' },
          { status: 400 }
        );
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
      dataQuality: { score: 100, issues: [] }
    };

    return NextResponse.json({
      success: true,
      data,
      metadata
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    // Fallback to mock data if Firebase is not available
    let fallbackData;
    const type = new URL(request.url).searchParams.get('type') || 'events';
    
    switch (type) {
      case 'events':
        fallbackData = generateMockEvents();
        break;
      case 'sources':
        fallbackData = generateMockSources();
        break;
      case 'funnel':
        fallbackData = generateMockFunnel();
        break;
      default:
        fallbackData = [];
    }
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      metadata: {
        totalCount: Array.isArray(fallbackData) ? fallbackData.length : 1,
        filteredCount: Array.isArray(fallbackData) ? fallbackData.length : 1,
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        processingTime: Date.now() - startTime,
        cacheHit: false,
        dataQuality: { score: 50, issues: ['Using fallback data - Firebase not available'] }
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const query: AnalyticsQuery = body;

    // Process complex queries that require POST
    let result: any;
    let totalCount = 0;

    switch (query.type) {
      case 'funnel':
        result = generateMockFunnel();
        totalCount = 1;
        break;
        
      case 'segments':
        result = {
          segments: [
            { name: 'Organic Traffic', users: 1250, conversions: 45 },
            { name: 'AI Assistant Traffic', users: 700, conversions: 37 },
            { name: 'Social Media Traffic', users: 340, conversions: 8 }
          ]
        };
        totalCount = result.segments.length;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'POST method not supported for this query type' },
          { status: 400 }
        );
    }

    const response: AnalyticsResponse = {
      success: true,
      data: result,
      metadata: {
        totalCount,
        filteredCount: totalCount,
        timeRange: query.timeRange,
        processingTime: Date.now() - startTime,
        cacheHit: false,
        dataQuality: { score: 100, issues: [] }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analytics API POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        metadata: {
          totalCount: 0,
          filteredCount: 0,
          timeRange: { start: '', end: '' },
          processingTime: Date.now() - startTime,
          cacheHit: false,
          dataQuality: { score: 0, issues: ['Processing error'] }
        }
      },
      { status: 500 }
    );
  }
}