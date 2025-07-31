import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';

/**
 * POST /api/analytics/cleanup
 * Clean up analytics data for deleted content
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { postSlug, authorId, categoryId } = body;

    if (!postSlug && !authorId && !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing cleanup target (postSlug, authorId, or categoryId)' },
        { status: 400 }
      );
    }

    const firestore = getFirestoreAdmin();
    const cleanupResults = [];

    // Clean up post-specific analytics
    if (postSlug) {
      try {
        // Delete from analytics_events collection
        const eventsQuery = await firestore
          .collection('analytics_events')
          .where('postSlug', '==', postSlug)
          .get();

        const eventsBatch = firestore.batch();
        eventsQuery.docs.forEach(doc => {
          eventsBatch.delete(doc.ref);
        });

        if (!eventsQuery.empty) {
          await eventsBatch.commit();
          cleanupResults.push(`Deleted ${eventsQuery.docs.length} analytics events for post: ${postSlug}`);
        }

        // Delete from post_analytics collection
        const postAnalyticsRef = firestore
          .collection('post_analytics')
          .doc(postSlug);

        const postAnalyticsDoc = await postAnalyticsRef.get();
        if (postAnalyticsDoc.exists) {
          await postAnalyticsRef.delete();
          cleanupResults.push(`Deleted post analytics document for: ${postSlug}`);
        }

        // Delete from page_engagement collection
        const pageEngagementQuery = await firestore
          .collection('page_engagement')
          .where('page', '==', `/blog/${postSlug}`)
          .get();

        const engagementBatch = firestore.batch();
        pageEngagementQuery.docs.forEach(doc => {
          engagementBatch.delete(doc.ref);
        });

        if (!pageEngagementQuery.empty) {
          await engagementBatch.commit();
          cleanupResults.push(`Deleted ${pageEngagementQuery.docs.length} page engagement records for: ${postSlug}`);
        }

      } catch (error) {
        console.error(`Error cleaning up analytics for post ${postSlug}:`, error);
        cleanupResults.push(`Error cleaning up post ${postSlug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clean up author-specific analytics
    if (authorId) {
      try {
        const authorEventsQuery = await firestore
          .collection('analytics_events')
          .where('metadata.authorId', '==', authorId)
          .get();

        const authorBatch = firestore.batch();
        authorEventsQuery.docs.forEach(doc => {
          authorBatch.delete(doc.ref);
        });

        if (!authorEventsQuery.empty) {
          await authorBatch.commit();
          cleanupResults.push(`Deleted ${authorEventsQuery.docs.length} analytics events for author: ${authorId}`);
        }

      } catch (error) {
        console.error(`Error cleaning up analytics for author ${authorId}:`, error);
        cleanupResults.push(`Error cleaning up author ${authorId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clean up category-specific analytics
    if (categoryId) {
      try {
        const categoryEventsQuery = await firestore
          .collection('analytics_events')
          .where('metadata.categoryId', '==', categoryId)
          .get();

        const categoryBatch = firestore.batch();
        categoryEventsQuery.docs.forEach(doc => {
          categoryBatch.delete(doc.ref);
        });

        if (!categoryEventsQuery.empty) {
          await categoryBatch.commit();
          cleanupResults.push(`Deleted ${categoryEventsQuery.docs.length} analytics events for category: ${categoryId}`);
        }

      } catch (error) {
        console.error(`Error cleaning up analytics for category ${categoryId}:`, error);
        cleanupResults.push(`Error cleaning up category ${categoryId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics cleanup completed',
      results: cleanupResults,
      cleanedUp: {
        postSlug,
        authorId,
        categoryId
      }
    });

  } catch (error) {
    console.error('❌ Error in analytics cleanup:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clean up analytics data'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/cleanup
 * Get cleanup statistics and orphaned data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const firestore = getFirestoreAdmin();
    
    // Get analytics events without corresponding posts
    const eventsQuery = await firestore
      .collection('analytics_events')
      .where('eventType', '==', 'pageview')
      .limit(1000)
      .get();

    const orphanedEvents = [];
    const postSlugs = new Set();

    for (const doc of eventsQuery.docs) {
      const data = doc.data();
      if (data.postSlug) {
        postSlugs.add(data.postSlug);
      }
    }

    // Check which posts still exist in Sanity
    // This would require a Sanity query to verify existence
    // For now, we'll return the statistics

    const stats = {
      totalAnalyticsEvents: eventsQuery.docs.length,
      uniquePostSlugs: postSlugs.size,
      orphanedEvents: orphanedEvents.length,
      collections: {
        analytics_events: eventsQuery.docs.length,
        // Add more collection counts as needed
      }
    };

    return NextResponse.json({
      success: true,
      stats,
      message: 'Analytics cleanup statistics retrieved'
    });

  } catch (error) {
    console.error('❌ Error getting cleanup statistics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get cleanup statistics'
      },
      { status: 500 }
    );
  }
}