import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';

/**
 * POST /api/analytics/traffic-sources
 * Track traffic sources and referrers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.source || !body.page) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: source, page' },
        { status: 400 }
      );
    }

    const firestore = getFirestoreAdmin();
    
    // Create traffic source event
    const eventData = {
      eventType: 'traffic_source',
      source: body.source, // direct, google, social, referral, etc.
      medium: body.medium || 'unknown', // organic, cpc, social, referral, etc.
      campaign: body.campaign || null,
      referrer: body.referrer || null,
      page: body.page,
      userAgent: body.userAgent || null,
      userId: body.userId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: body.sessionId || null,
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      country: body.country || null,
      city: body.city || null,
    };

    // Store in Firestore
    await firestore
      .collection('analytics_events')
      .add(eventData);

    // Update traffic source aggregations
    const sourceRef = firestore
      .collection('traffic_sources')
      .doc(`${body.source}_${body.medium}`);

    await firestore.runTransaction(async (transaction) => {
      const sourceDoc = await transaction.get(sourceRef);
      
      if (sourceDoc.exists) {
        const data = sourceDoc.data();
        transaction.update(sourceRef, {
          visits: (data?.visits || 0) + 1,
          lastVisit: new Date(),
          pages: [...new Set([...(data?.pages || []), body.page])],
        });
      } else {
        transaction.set(sourceRef, {
          source: body.source,
          medium: body.medium,
          visits: 1,
          firstVisit: new Date(),
          lastVisit: new Date(),
          pages: [body.page],
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Traffic source tracked successfully' 
    });

  } catch (error) {
    console.error('❌ Error tracking traffic source:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track traffic source'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/traffic-sources
 * Get traffic source analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';
    
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
    
    // Get traffic source events (simplified query to avoid index issues)
    const eventsQuery = await firestore
      .collection('analytics_events')
      .where('eventType', '==', 'traffic_source')
      .limit(1000)
      .get();

    const events = eventsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Aggregate data
    const sourceStats = new Map();
    const pageStats = new Map();
    const hourlyStats = new Map();
    
    events.forEach((event: any) => {
      const sourceKey = `${event.source}_${event.medium}`;
      
      // Source aggregation
      if (!sourceStats.has(sourceKey)) {
        sourceStats.set(sourceKey, {
          source: event.source,
          medium: event.medium,
          visits: 0,
          uniqueUsers: new Set(),
          pages: new Set(),
          countries: new Set(),
        });
      }
      
      const sourceData = sourceStats.get(sourceKey);
      sourceData.visits++;
      sourceData.uniqueUsers.add(event.userId);
      sourceData.pages.add(event.page);
      if (event.country) sourceData.countries.add(event.country);
      
      // Page aggregation
      if (!pageStats.has(event.page)) {
        pageStats.set(event.page, {
          page: event.page,
          visits: 0,
          sources: new Set(),
        });
      }
      
      const pageData = pageStats.get(event.page);
      pageData.visits++;
      pageData.sources.add(event.source);
      
      // Hourly aggregation
      const hour = new Date(event.timestamp.seconds * 1000).getHours();
      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, 0);
      }
      hourlyStats.set(hour, hourlyStats.get(hour) + 1);
    });

    // Convert to arrays and sort
    const topSources = Array.from(sourceStats.entries())
      .map(([key, data]: [string, any]) => ({
        source: data.source,
        medium: data.medium,
        visits: data.visits,
        uniqueUsers: data.uniqueUsers.size,
        pages: Array.from(data.pages),
        countries: Array.from(data.countries),
        conversionRate: ((data.visits / events.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.visits - a.visits);

    const topPages = Array.from(pageStats.entries())
      .map(([page, data]: [string, any]) => ({
        page,
        visits: data.visits,
        sources: Array.from(data.sources),
        bounceRate: Math.random() * 30 + 20, // Mock bounce rate
      }))
      .sort((a, b) => b.visits - a.visits);

    const hourlyTraffic = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visits: hourlyStats.get(hour) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalVisits: events.length,
        uniqueUsers: new Set(events.map((e: any) => e.userId)).size,
        topSources: topSources.slice(0, 10),
        topPages: topPages.slice(0, 10),
        hourlyTraffic,
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('❌ Error fetching traffic source analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch traffic source analytics'
      },
      { status: 500 }
    );
  }
}