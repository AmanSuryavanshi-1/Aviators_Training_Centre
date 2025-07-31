import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/utils/rate-limit';

// Types for the form submission request
interface FormSubmissionRequest {
  formType: 'contact' | 'newsletter' | 'course_inquiry' | 'demo_booking';
  source: string;
  referrerSlug?: string;
  userId: string;
  sessionId: string;
  formData?: Record<string, any>;
  timestamp?: string;
}

interface FormSubmissionResponse {
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
 * POST /api/analytics/formSubmission
 * Track form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse<FormSubmissionResponse>> {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    try {
      await limiter.check(10, ip); // 10 form submissions per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: FormSubmissionRequest = await request.json();
    
    // Validate required fields
    if (!body.formType || !body.source || !body.userId || !body.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: formType, source, userId, sessionId' 
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
    
    // Sanitize form data (remove sensitive information)
    const sanitizedFormData = body.formData ? {
      ...body.formData,
      // Remove sensitive fields but keep structure for analytics
      email: body.formData.email ? '[email]' : undefined,
      phone: body.formData.phone ? '[phone]' : undefined,
      name: body.formData.name ? '[name]' : undefined,
      // Keep non-sensitive fields for analytics
      course: body.formData.course,
      experience: body.formData.experience,
      location: body.formData.location,
      preferredTime: body.formData.preferredTime,
    } : undefined;
    
    // Create analytics event document
    const eventData = {
      eventType: 'form_submission',
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      metadata: {
        formType: body.formType,
        source: body.source,
        referrerSlug: body.referrerSlug,
        formData: sanitizedFormData,
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

    // Update form submission analytics
    const formAnalyticsRef = firestore
      .collection('form_analytics')
      .doc(body.formType);

    // Use transaction to safely increment counters
    await firestore.runTransaction(async (transaction) => {
      const formDoc = await transaction.get(formAnalyticsRef);
      
      if (formDoc.exists) {
        const data = formDoc.data();
        transaction.update(formAnalyticsRef, {
          totalSubmissions: (data?.totalSubmissions || 0) + 1,
          lastSubmissionAt: new Date(),
          sourceBreakdown: {
            ...data?.sourceBreakdown,
            [body.source]: (data?.sourceBreakdown?.[body.source] || 0) + 1,
          },
        });
        
        // Track unique submitters
        const uniqueSubmitters = data?.uniqueSubmitters || [];
        if (!uniqueSubmitters.includes(body.userId)) {
          transaction.update(formAnalyticsRef, {
            uniqueSubmitters: [...uniqueSubmitters, body.userId],
            uniqueSubmissionCount: uniqueSubmitters.length + 1,
          });
        }
      } else {
        // Create new form analytics document
        transaction.set(formAnalyticsRef, {
          formType: body.formType,
          totalSubmissions: 1,
          uniqueSubmissionCount: 1,
          uniqueSubmitters: [body.userId],
          firstSubmissionAt: new Date(),
          lastSubmissionAt: new Date(),
          sourceBreakdown: {
            [body.source]: 1,
          },
          createdAt: new Date(),
        });
      }
    });

    // Update overall conversion analytics
    const conversionAnalyticsRef = firestore
      .collection('conversion_analytics')
      .doc('overall');

    await firestore.runTransaction(async (transaction) => {
      const conversionDoc = await transaction.get(conversionAnalyticsRef);
      
      if (conversionDoc.exists) {
        const data = conversionDoc.data();
        transaction.update(conversionAnalyticsRef, {
          totalConversions: (data?.totalConversions || 0) + 1,
          lastConversionAt: new Date(),
          conversionsByType: {
            ...data?.conversionsByType,
            [body.formType]: (data?.conversionsByType?.[body.formType] || 0) + 1,
          },
        });
      } else {
        transaction.set(conversionAnalyticsRef, {
          totalConversions: 1,
          uniqueConverters: [body.userId],
          firstConversionAt: new Date(),
          lastConversionAt: new Date(),
          conversionsByType: {
            [body.formType]: 1,
          },
          createdAt: new Date(),
        });
      }
    });

    // If this submission came from a blog post, update conversion tracking
    if (body.referrerSlug && body.source === 'blog') {
      const postAnalyticsRef = firestore
        .collection('post_analytics')
        .doc(body.referrerSlug);

      await firestore.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postAnalyticsRef);
        
        if (postDoc.exists) {
          const data = postDoc.data();
          transaction.update(postAnalyticsRef, {
            formSubmissions: (data?.formSubmissions || 0) + 1,
            lastFormSubmissionAt: new Date(),
            conversionsByType: {
              ...data?.conversionsByType,
              [body.formType]: (data?.conversionsByType?.[body.formType] || 0) + 1,
            },
          });
        }
      });
    }

    console.log(`📝 Form submission tracked: ${body.formType} from ${body.source} by ${body.userId}`);

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
    });

  } catch (error) {
    console.error('❌ Error tracking form submission:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('Firebase') ? 503 : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Failed to track form submission'
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/analytics/formSubmission
 * Get form submission analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Initialize Firestore
    const firestore = getFirestoreAdmin();
    
    if (formType) {
      // Get analytics for specific form type
      const formAnalyticsDoc = await firestore
        .collection('form_analytics')
        .doc(formType)
        .get();
      
      if (!formAnalyticsDoc.exists) {
        return NextResponse.json({
          success: true,
          data: {
            formType,
            totalSubmissions: 0,
            uniqueSubmissionCount: 0,
            sourceBreakdown: {},
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: formAnalyticsDoc.data(),
      });
    } else {
      // Get overall form analytics
      const now = new Date();
      const timeRangeMs = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
      }[timeRange] || 7 * 24 * 60 * 60 * 1000;
      
      const startDate = new Date(now.getTime() - timeRangeMs);
      
      // Query form submission events
      const eventsQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'form_submission')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();
      
      // Aggregate data
      const events = eventsQuery.docs.map(doc => doc.data());
      const totalSubmissions = events.length;
      const uniqueUsers = new Set(events.map(e => e.userId)).size;
      
      // Form type breakdown
      const formTypeBreakdown = events.reduce((acc: Record<string, number>, event) => {
        const formType = event.metadata?.formType || 'unknown';
        acc[formType] = (acc[formType] || 0) + 1;
        return acc;
      }, {});
      
      // Source breakdown
      const sourceBreakdown = events.reduce((acc: Record<string, number>, event) => {
        const source = event.metadata?.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      
      // Get overall conversion analytics
      const conversionAnalyticsDoc = await firestore
        .collection('conversion_analytics')
        .doc('overall')
        .get();
      
      const conversionData = conversionAnalyticsDoc.exists ? conversionAnalyticsDoc.data() : {
        totalConversions: 0,
        conversionsByType: {},
      };
      
      return NextResponse.json({
        success: true,
        data: {
          timeRange,
          totalSubmissions,
          uniqueUsers,
          formTypeBreakdown,
          sourceBreakdown,
          overallConversions: conversionData,
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching form submission analytics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch form submission analytics'
      },
      { status: 500 }
    );
  }
}
