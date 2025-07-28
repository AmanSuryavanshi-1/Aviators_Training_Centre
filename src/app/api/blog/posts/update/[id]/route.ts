import { NextRequest, NextResponse } from 'next/server';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';

/**
 * PUT /api/blog/posts/update/[id]
 * Update a blog post by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = `update_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  try {
    const { id } = await params;
    const updateData = await request.json();

    console.log(`🔄 UPDATE request started for post: ${id} (Request ID: ${requestId})`);
    console.log('📝 Update data:', Object.keys(updateData));

    // Validate required fields
    if (!updateData.title?.trim()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Title is required',
          code: 'MISSING_TITLE',
          suggestedAction: 'Please provide a valid title'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      }, { status: 400 });
    }

    if (!updateData.content?.trim()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Content is required',
          code: 'MISSING_CONTENT',
          suggestedAction: 'Please provide post content'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      }, { status: 400 });
    }

    if (!updateData.excerpt?.trim()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Excerpt is required',
          code: 'MISSING_EXCERPT',
          suggestedAction: 'Please provide a post excerpt'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      }, { status: 400 });
    }

    // Validate excerpt length
    if (updateData.excerpt.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Excerpt must be at least 50 characters long',
          code: 'EXCERPT_TOO_SHORT',
          suggestedAction: 'Please provide a longer excerpt (minimum 50 characters)'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      }, { status: 400 });
    }

    if (updateData.excerpt.trim().length > 300) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Excerpt must be less than 300 characters',
          code: 'EXCERPT_TOO_LONG',
          suggestedAction: 'Please shorten the excerpt (maximum 300 characters)'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      }, { status: 400 });
    }

    // Perform the update
    const result = await unifiedBlogService.updatePost(id, updateData);

    const duration = Date.now() - startTime;

    if (!result.success) {
      console.error(`Failed to update blog post "${id}":`, {
        error: result.error,
        requestId,
        duration
      });

      return NextResponse.json({
        success: false,
        error: {
          message: result.error || 'Failed to update blog post',
          code: 'UPDATE_FAILED',
          suggestedAction: 'Please try again or contact support if the issue persists'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration
        }
      }, { status: 500 });
    }

    // Success response
    console.log(`✅ Successfully updated blog post "${id}":`, {
      title: result.data?.title,
      requestId,
      duration
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.data?._id,
        title: result.data?.title,
        slug: result.data?.slug?.current,
        excerpt: result.data?.excerpt,
        updatedAt: new Date().toISOString()
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        duration
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Unexpected error in PUT /api/blog/posts/update/[id]:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      duration
    });

    return NextResponse.json({
      success: false,
      error: {
        message: 'Internal server error occurred during update',
        code: 'INTERNAL_ERROR',
        suggestedAction: 'Try again in a few moments or contact support if the issue persists'
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        duration
      }
    }, { status: 500 });
  }
}