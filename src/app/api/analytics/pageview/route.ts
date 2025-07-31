import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/utils/rate-limit';

// Types for the pageview request
interface PageviewRequest {
  postSlug: string;
  userId: string;
  sessionId: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}

interface PageviewResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per minute
});

/**
 * POST /api/analytics/pageview
 * Track blog post page views
 */
export async function POST(request: NextRequest): Promise<NextResponse<PageviewResponse>> {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: PageviewRequest = await request.json();
    
    // Validate required fields
    if (!body.postSlug || !body.userId || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: postSlug, userId, sessionId' 
        },
        { status: 400 }
      );
    }

    // Get request headers for additional context
    const headersList = headers();
    const userAgent = body.userAgent || headersList.get('user-agent') || 'unknown';
    const referrer = body.referrer || headersList.get('referer') || 'direct';

    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    // Create analytics event document
    const eventData = {
      eventType: 'pageview',
      postSlug: body.postSlug,
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        referrer,
        userAgent,
        ip: ip !== '127.0.0.1' ? ip : undefined, // Don't store localhost IPs
      },
      // Additional tracking fields
      createdAt: new Date(),
      processed: false, // For batch processing later
    };

    // Store in Firestore
    const docRef = await firestore
      .collection('analytics_events')
      .add(eventData);

    // Also update post-specific analytics
    const postAnalyticsRef = firestore
      .collection('post_analytics')
      .doc(body.postSlug);

    // Use transaction to safely increment counters
    await firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postAnalyticsRef);
      
      if (postDoc.exists) {
        // Increment existing counters
        const data = postDoc.data();
        transaction.update(postAnalyticsRef, {
          totalViews: (data?.totalViews || 0) + 1,
          lastViewedAt: new Date(),
          uniqueViewers: data?.uniqueViewers || [],
        });
        
        // Add to unique viewers if not already present
        const uniqueViewers = data?.uniqueViewers || [];
        if (!uniqueViewers.includes(body.userId)) {
          transaction.update(postAnalyticsRef, {
            uniqueViewers: [...uniqueViewers, body.userId],
            uniqueViewCount: uniqueViewers.length + 1,
          });
        }
      } else {
        // Create new analytics document
        transaction.set(postAnalyticsRef, {
          postSlug: body.postSlug,
          totalViews: 1,
          uniqueViewCount: 1,
          uniqueViewers: [body.userId],
          firstViewedAt: new Date(),
          lastViewedAt: new Date(),
          createdAt: new Date(),
        });
      }
    });

    console.log(`📊 Pageview tracked: ${body.postSlug} by ${body.userId}`);

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
    });

  } catch (error) {
    console.error('❌ Error tracking pageview:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('Firebase') ? 503 : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to track pageview'
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/analytics/pageview
 * Get pageview analytics (for admin dashboard)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');
    const timeRange = searchParams.get('timeRange') || '7d'; // 7d, 30d, 90d
    
    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    if (postSlug) {
      // Get analytics for specific post
      const postAnalyticsDoc = await firestore
        .collection('post_analytics')
        .doc(postSlug)
        .get();
      
      if (!postAnalyticsDoc.exists) {
        return NextResponse.json({
          success: true,
          data: {
            postSlug,
            totalViews: 0,
            uniqueViewCount: 0,
            firstViewedAt: null,
            lastViewedAt: null,
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: postAnalyticsDoc.data(),
      });
    } else {
      // Get overall analytics
      const now = new Date();
      const timeRangeMs = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      }[timeRange] || 7 * 24 * 60 * 60 * 1000;
      
      const startDate = new Date(now.getTime() - timeRangeMs);
      
      // Query analytics events (simplified to avoid index issues)
      const eventsQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'pageview')
        .limit(1000)
        .get();
      
      // Aggregate data
      const events = eventsQuery.docs.map(doc => doc.data());
      const totalViews = events.length;
      const uniqueUsers = new Set(events.map(e => e.userId)).size;
      const topPosts = events.reduce((acc: Record<string, number>, event) => {
        acc[event.postSlug] = (acc[event.postSlug] || 0) + 1;
        return acc;
      }, {});
      
      return NextResponse.json({
        success: true,
        data: {
          timeRange,
          totalViews,
          uniqueUsers,
          topPosts: Object.entries(topPosts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([slug, views]) => ({ slug, views })),
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching pageview analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data'
      },
      { status: 500 }
    );
  }
}
