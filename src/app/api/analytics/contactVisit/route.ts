import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/utils/rate-limit';

// Types for the contact visit request
interface ContactVisitRequest {
  source: string; // 'blog' | 'direct' | 'cta' | 'navigation'
  referrerSlug?: string;
  userId: string;
  sessionId: string;
  timestamp?: string;
}

interface ContactVisitResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * POST /api/analytics/contactVisit
 * Track contact page visits
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContactVisitResponse>> {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    try {
      await limiter.check(15, ip); // 15 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: ContactVisitRequest = await request.json();
    
    // Validate required fields
    if (!body.source || !body.userId || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: source, userId, sessionId' 
        },
        { status: 400 }
      );
    }

    // Get request headers for additional context
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referrer = headersList.get('referer') || 'direct';

    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    // Create analytics event document
    const eventData = {
      eventType: 'contact_visit',
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        source: body.source,
        referrerSlug: body.referrerSlug,
        referrer,
        userAgent,
        ip: ip !== '127.0.0.1' ? ip : undefined,
      },
      createdAt: new Date(),
      processed: false,
    };

    // Store in Firestore
    const docRef = await firestore
      .collection('analytics_events')
      .add(eventData);

    // Update contact analytics
    const contactAnalyticsRef = firestore
      .collection('contact_analytics')
      .doc('overall');

    // Use transaction to safely increment counters
    await firestore.runTransaction(async (transaction) => {
      const contactDoc = await transaction.get(contactAnalyticsRef);
      
      if (contactDoc.exists) {
        const data = contactDoc.data();
        transaction.update(contactAnalyticsRef, {
          totalVisits: (data?.totalVisits || 0) + 1,
          lastVisitAt: new Date(),
          sourceBreakdown: {
            ...data?.sourceBreakdown,
            [body.source]: (data?.sourceBreakdown?.[body.source] || 0) + 1,
          },
        });
        
        // Track unique visitors
        const uniqueVisitors = data?.uniqueVisitors || [];
        if (!uniqueVisitors.includes(body.userId)) {
          transaction.update(contactAnalyticsRef, {
            uniqueVisitors: [...uniqueVisitors, body.userId],
            uniqueVisitCount: uniqueVisitors.length + 1,
          });
        }
      } else {
        // Create new contact analytics document
        transaction.set(contactAnalyticsRef, {
          totalVisits: 1,
          uniqueVisitCount: 1,
          uniqueVisitors: [body.userId],
          firstVisitAt: new Date(),
          lastVisitAt: new Date(),
          sourceBreakdown: {
            [body.source]: 1,
          },
          createdAt: new Date(),
        });
      }
    });

    // If this visit came from a blog post, update that post's conversion funnel
    if (body.referrerSlug && body.source === 'blog') {
      const postAnalyticsRef = firestore
        .collection('post_analytics')
        .doc(body.referrerSlug);

      await firestore.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postAnalyticsRef);
        
        if (postDoc.exists) {
          const data = postDoc.data();
          transaction.update(postAnalyticsRef, {
            contactVisits: (data?.contactVisits || 0) + 1,
            lastContactVisitAt: new Date(),
          });
        }
      });
    }

    console.log(`📞 Contact visit tracked: ${body.source} source by ${body.userId}`);

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
    });

  } catch (error) {
    console.error('❌ Error tracking contact visit:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('Firebase') ? 503 : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to track contact visit'
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/analytics/contactVisit
 * Get contact visit analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    // Get overall contact analytics
    const contactAnalyticsDoc = await firestore
      .collection('contact_analytics')
      .doc('overall')
      .get();
    
    const overallData = contactAnalyticsDoc.exists ? contactAnalyticsDoc.data() : {
      totalVisits: 0,
      uniqueVisitCount: 0,
      sourceBreakdown: {},
    };
    
    // Get time-based analytics
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000;
    
    const startDate = new Date(now.getTime() - timeRangeMs);
    
    // Query contact visit events
    const eventsQuery = await firestore
      .collection('analytics_events')
      .where('eventType', '==', 'contact_visit')
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();
    
    // Aggregate time-based data
    const events = eventsQuery.docs.map(doc => doc.data());
    const timeBasedVisits = events.length;
    const timeBasedUniqueUsers = new Set(events.map(e => e.userId)).size;
    
    // Source breakdown for time range
    const timeBasedSourceBreakdown = events.reduce((acc: Record<string, number>, event) => {
      const source = event.metadata?.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      data: {
        timeRange,
        overall: overallData,
        timeBasedStats: {
          totalVisits: timeBasedVisits,
          uniqueUsers: timeBasedUniqueUsers,
          sourceBreakdown: timeBasedSourceBreakdown,
        },
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching contact visit analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch contact visit analytics'
      },
      { status: 500 }
    );
  }
}
