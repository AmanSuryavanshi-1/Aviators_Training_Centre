import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/utils/rate-limit';

// Types for the CTA click request
interface CTAClickRequest {
  postSlug: string;
  ctaPosition: number;
  ctaType: string;
  ctaText?: string;
  targetUrl?: string;
  userId: string;
  sessionId: string;
  timestamp?: string;
}

interface CTAClickResponse {
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
 * POST /api/analytics/cta
 * Track CTA button clicks
 */
export async function POST(request: NextRequest): Promise<NextResponse<CTAClickResponse>> {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    try {
      await limiter.check(20, ip); // 20 requests per minute per IP (higher for CTA clicks)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: CTAClickRequest = await request.json();
    
    // Validate required fields
    if (!body.postSlug || !body.ctaType || !body.userId || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: postSlug, ctaType, userId, sessionId' 
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
      eventType: 'cta_click',
      postSlug: body.postSlug,
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        ctaPosition: body.ctaPosition,
        ctaType: body.ctaType,
        ctaText: body.ctaText,
        targetUrl: body.targetUrl,
        referrer,
        userAgent,
        ip: ip !== '127.0.0.1' ? ip : undefined,
      },
      // Additional tracking fields
      createdAt: new Date(),
      processed: false,
    };

    // Store in Firestore
    const docRef = await firestore
      .collection('analytics_events')
      .add(eventData);

    // Update CTA-specific analytics
    const ctaAnalyticsRef = firestore
      .collection('cta_analytics')
      .doc(`${body.postSlug}_${body.ctaType}`);

    // Use transaction to safely increment counters
    await firestore.runTransaction(async (transaction) => {
      const ctaDoc = await transaction.get(ctaAnalyticsRef);
      
      if (ctaDoc.exists) {
        // Increment existing counters
        const data = ctaDoc.data();
        transaction.update(ctaAnalyticsRef, {
          totalClicks: (data?.totalClicks || 0) + 1,
          lastClickedAt: new Date(),
          uniqueClickers: data?.uniqueClickers || [],
        });
        
        // Add to unique clickers if not already present
        const uniqueClickers = data?.uniqueClickers || [];
        if (!uniqueClickers.includes(body.userId)) {
          transaction.update(ctaAnalyticsRef, {
            uniqueClickers: [...uniqueClickers, body.userId],
            uniqueClickCount: uniqueClickers.length + 1,
          });
        }
      } else {
        // Create new CTA analytics document
        transaction.set(ctaAnalyticsRef, {
          postSlug: body.postSlug,
          ctaType: body.ctaType,
          totalClicks: 1,
          uniqueClickCount: 1,
          uniqueClickers: [body.userId],
          firstClickedAt: new Date(),
          lastClickedAt: new Date(),
          createdAt: new Date(),
        });
      }
    });

    // Also update post-level CTA analytics
    const postAnalyticsRef = firestore
      .collection('post_analytics')
      .doc(body.postSlug);

    await firestore.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postAnalyticsRef);
      
      if (postDoc.exists) {
        const data = postDoc.data();
        transaction.update(postAnalyticsRef, {
          totalCtaClicks: (data?.totalCtaClicks || 0) + 1,
          lastCtaClickAt: new Date(),
        });
      } else {
        // Create basic post analytics if it doesn't exist
        transaction.set(postAnalyticsRef, {
          postSlug: body.postSlug,
          totalViews: 0,
          totalCtaClicks: 1,
          uniqueViewCount: 0,
          uniqueViewers: [],
          lastCtaClickAt: new Date(),
          createdAt: new Date(),
        });
      }
    });

    console.log(`🎯 CTA click tracked: ${body.ctaType} on ${body.postSlug} by ${body.userId}`);

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
    });

  } catch (error) {
    console.error('❌ Error tracking CTA click:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('Firebase') ? 503 : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to track CTA click'
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/analytics/cta
 * Get CTA analytics (for admin dashboard)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');
    const ctaType = searchParams.get('ctaType');
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    if (postSlug && ctaType) {
      // Get analytics for specific CTA
      const ctaAnalyticsDoc = await firestore
        .collection('cta_analytics')
        .doc(`${postSlug}_${ctaType}`)
        .get();
      
      if (!ctaAnalyticsDoc.exists) {
        return NextResponse.json({
          success: true,
          data: {
            postSlug,
            ctaType,
            totalClicks: 0,
            uniqueClickCount: 0,
            firstClickedAt: null,
            lastClickedAt: null,
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: ctaAnalyticsDoc.data(),
      });
    } else {
      // Get overall CTA analytics
      const now = new Date();
      const timeRangeMs = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      }[timeRange] || 7 * 24 * 60 * 60 * 1000;
      
      const startDate = new Date(now.getTime() - timeRangeMs);
      
      // Query CTA click events
      const eventsQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'cta_click')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();
      
      // Aggregate data
      const events = eventsQuery.docs.map(doc => doc.data());
      const totalClicks = events.length;
      const uniqueUsers = new Set(events.map(e => e.userId)).size;
      
      // Group by CTA type
      const ctaTypeStats = events.reduce((acc: Record<string, number>, event) => {
        const ctaType = event.metadata?.ctaType || 'unknown';
        acc[ctaType] = (acc[ctaType] || 0) + 1;
        return acc;
      }, {});
      
      // Group by post
      const postStats = events.reduce((acc: Record<string, number>, event) => {
        acc[event.postSlug] = (acc[event.postSlug] || 0) + 1;
        return acc;
      }, {});
      
      return NextResponse.json({
        success: true,
        data: {
          timeRange,
          totalClicks,
          uniqueUsers,
          ctaTypeStats,
          topPerformingPosts: Object.entries(postStats)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([slug, clicks]) => ({ slug, clicks })),
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching CTA analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch CTA analytics data'
      },
      { status: 500 }
    );
  }
}
