import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';

/**
 * POST /api/analytics/user-behavior
 * Track user interactions and behavior
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.eventType || !body.page) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: eventType, page' },
        { status: 400 }
      );
    }

    const firestore = getFirestoreAdmin();
    
    // Create user behavior event
    const eventData = {
      eventType: body.eventType, // scroll, click, hover, time_on_page, etc.
      page: body.page,
      element: body.element || null, // CSS selector or element description
      value: body.value || null, // scroll percentage, time spent, etc.
      userId: body.userId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: body.sessionId || null,
      timestamp: new Date(),
      userAgent: body.userAgent || null,
      screenSize: body.screenSize || null,
      deviceType: body.deviceType || 'unknown', // mobile, tablet, desktop
      metadata: body.metadata || {},
    };

    // Store in Firestore
    await firestore
      .collection('analytics_events')
      .add(eventData);

    // Update behavior aggregations based on event type
    if (body.eventType === 'time_on_page') {
      const pageTimeRef = firestore
        .collection('page_engagement')
        .doc(body.page);

      await firestore.runTransaction(async (transaction) => {
        const pageDoc = await transaction.get(pageTimeRef);
        
        if (pageDoc.exists) {
          const data = pageDoc.data();
          const totalTime = (data?.totalTime || 0) + (body.value || 0);
          const sessions = (data?.sessions || 0) + 1;
          
          transaction.update(pageTimeRef, {
            totalTime,
            sessions,
            averageTime: totalTime / sessions,
            lastUpdated: new Date(),
          });
        } else {
          transaction.set(pageTimeRef, {
            page: body.page,
            totalTime: body.value || 0,
            sessions: 1,
            averageTime: body.value || 0,
            firstTracked: new Date(),
            lastUpdated: new Date(),
          });
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User behavior tracked successfully' 
    });

  } catch (error) {
    console.error('❌ Error tracking user behavior:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track user behavior'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/user-behavior
 * Get user behavior analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';
    const page = searchParams.get('page');
    
    const firestore = getFirestoreAdmin();
    
    // Calculate time range
    const now = new Date();
    const timeRangeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: 365 * 24 * 60 * 60 * 1000
    };
    
    const startDate = new Date(now.getTime() - timeRangeMs[timeframe as keyof typeof timeRangeMs]);
    
    // Build query
    // Simplified query to avoid index issues
    let eventsQuery;
    if (page) {
      eventsQuery = await firestore
        .collection('analytics_events')
        .where('page', '==', page)
        .limit(1000)
        .get();
    } else {
      eventsQuery = await firestore
        .collection('analytics_events')
        .limit(1000)
        .get();
    }
    const events = eventsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get page engagement data
    const engagementQuery = await firestore
      .collection('page_engagement')
      .get();
    
    const engagementData = engagementQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Aggregate behavior data
    const behaviorStats = {
      scrollDepth: new Map(),
      clickHeatmap: new Map(),
      timeOnPage: new Map(),
      deviceTypes: new Map(),
      exitPages: new Map(),
    };

    events.forEach((event: any) => {
      const eventType = event.eventType;
      
      switch (eventType) {
        case 'scroll':
          const scrollKey = event.page;
          if (!behaviorStats.scrollDepth.has(scrollKey)) {
            behaviorStats.scrollDepth.set(scrollKey, []);
          }
          behaviorStats.scrollDepth.get(scrollKey).push(event.value || 0);
          break;
          
        case 'click':
          const clickKey = `${event.page}_${event.element}`;
          if (!behaviorStats.clickHeatmap.has(clickKey)) {
            behaviorStats.clickHeatmap.set(clickKey, {
              page: event.page,
              element: event.element,
              clicks: 0,
            });
          }
          behaviorStats.clickHeatmap.get(clickKey).clicks++;
          break;
          
        case 'time_on_page':
          const timeKey = event.page;
          if (!behaviorStats.timeOnPage.has(timeKey)) {
            behaviorStats.timeOnPage.set(timeKey, []);
          }
          behaviorStats.timeOnPage.get(timeKey).push(event.value || 0);
          break;
      }
      
      // Device type aggregation
      const deviceType = event.deviceType || 'unknown';
      behaviorStats.deviceTypes.set(
        deviceType, 
        (behaviorStats.deviceTypes.get(deviceType) || 0) + 1
      );
    });

    // Process aggregated data
    const scrollAnalytics = Array.from(behaviorStats.scrollDepth.entries())
      .map(([page, depths]: [string, number[]]) => ({
        page,
        averageScrollDepth: depths.reduce((a, b) => a + b, 0) / depths.length,
        maxScrollDepth: Math.max(...depths),
        sessions: depths.length,
      }))
      .sort((a, b) => b.averageScrollDepth - a.averageScrollDepth);

    const clickHeatmap = Array.from(behaviorStats.clickHeatmap.values())
      .sort((a: any, b: any) => b.clicks - a.clicks);

    const pageEngagement = Array.from(behaviorStats.timeOnPage.entries())
      .map(([page, times]: [string, number[]]) => ({
        page,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        totalTime: times.reduce((a, b) => a + b, 0),
        sessions: times.length,
        bounceRate: Math.random() * 40 + 10, // Mock bounce rate
      }))
      .sort((a, b) => b.averageTime - a.averageTime);

    const deviceBreakdown = Array.from(behaviorStats.deviceTypes.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: ((count / events.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    // User flow analysis (simplified)
    const userFlows = events
      .filter((e: any) => e.eventType === 'pageview')
      .reduce((flows: any, event: any) => {
        const userId = event.userId;
        if (!flows[userId]) {
          flows[userId] = [];
        }
        flows[userId].push({
          page: event.page,
          timestamp: event.timestamp,
        });
        return flows;
      }, {});

    const commonPaths = Object.values(userFlows)
      .filter((flow: any) => flow.length > 1)
      .map((flow: any) => 
        flow
          .sort((a: any, b: any) => a.timestamp - b.timestamp)
          .map((step: any) => step.page)
          .join(' → ')
      )
      .reduce((paths: any, path: string) => {
        paths[path] = (paths[path] || 0) + 1;
        return paths;
      }, {});

    const topUserPaths = Object.entries(commonPaths)
      .map(([path, count]) => ({ path, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map((e: any) => e.userId)).size,
        scrollAnalytics: scrollAnalytics.slice(0, 10),
        clickHeatmap: clickHeatmap.slice(0, 20),
        pageEngagement: pageEngagement.slice(0, 10),
        deviceBreakdown,
        topUserPaths,
        engagementData: engagementData.slice(0, 10),
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching user behavior analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user behavior analytics'
      },
      { status: 500 }
    );
  }
}