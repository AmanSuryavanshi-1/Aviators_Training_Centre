import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService, sanityBlogService } from '@/lib/blog/sanity-blog-service';
import { invalidateBlogCache } from '@/lib/cache/cache-invalidation';
import { blogDeletionService } from '@/lib/blog/blog-deletion-service';

/**
 * GET /api/blog/posts/[slug]
 * Fetch a single blog post by slug from Sanity CMS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Valid slug is required',
            code: 'INVALID_SLUG'
          }
        },
        { status: 400 }
      );
    }

    // Fetch post from Sanity
    const result = await sanityBlogService.getPostBySlug(slug, {
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        tags: [`blog-post-${slug}`]
      }
    });

    if (!result.success) {
      console.error(`Failed to fetch blog post with slug "${slug}":`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch blog post',
            code: result.error?.code || 'FETCH_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Return 404 if post not found
    if (!result.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Blog post not found',
            code: 'POST_NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta
    });

  } catch (error) {
    const resolvedParams = await params;
    console.error(`Unexpected error in GET /api/blog/posts/${resolvedParams.slug}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/posts/[slug]
 * Update a blog post by slug in Sanity CMS
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Valid slug is required',
            code: 'INVALID_SLUG'
          }
        },
        { status: 400 }
      );
    }

    // First, get the post to find its ID
    const existingPostResult = await sanityBlogService.getPostBySlug(slug);
    
    if (!existingPostResult.success) {
      console.error(`Failed to fetch existing post with slug "${slug}":`, existingPostResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch existing post',
            code: 'FETCH_ERROR'
          }
        },
        { status: 500 }
      );
    }

    if (!existingPostResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Blog post not found',
            code: 'POST_NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    // Update the post
    const result = await sanityBlogService.updatePost(existingPostResult.data._id, body);

    if (!result.success) {
      console.error(`Failed to update blog post with slug "${slug}":`, result.error);
      
      // Handle specific error cases
      if (result.error?.code === 'VALIDATION_ERROR') {
        return NextResponse.json(
          {
            success: false,
            error: result.error
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to update blog post',
            code: result.error?.code || 'UPDATE_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Invalidate cache after successful update
    try {
      await invalidateBlogCache({
        type: 'post',
        postId: result.data?._id,
        slug: result.data?.slug?.current,
        categorySlug: result.data?.category?.slug?.current
      });
    } catch (cacheError) {
      console.warn('Failed to invalidate cache after post update:', cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        cacheInvalidated: true
      }
    });

  } catch (error) {
    const resolvedParams = await params;
    console.error(`Unexpected error in PUT /api/blog/posts/${resolvedParams.slug}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[slug]
 * Delete a blog post by slug from Sanity CMS with enhanced error handling
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  const requestId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  try {
    const { slug } = await params;
    
    // Parse request body for deletion options
    let deletionOptions = {
      retryAttempts: 3,
      retryDelay: 1000,
      skipCacheInvalidation: false,
      validateBeforeDelete: true
    };
    
    try {
      const body = await request.json();
      deletionOptions = { ...deletionOptions, ...body };
    } catch (error) {
      // If no body or invalid JSON, use defaults
      console.log('Using default deletion options (no valid request body)');
    }

    console.log(`🗑️ DELETE request started for slug: ${slug} (Request ID: ${requestId})`, {
      options: deletionOptions
    });

    // Enhanced slug validation
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      console.warn(`Invalid slug provided: ${slug} (Request ID: ${requestId})`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Valid slug is required',
            code: 'INVALID_SLUG',
            suggestedAction: 'Provide a valid blog post slug'
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          }
        },
        { status: 400 }
      );
    }

    // Sanitize slug
    const sanitizedSlug = slug.trim().toLowerCase();

    // Log deletion attempt
    console.log(`Attempting to delete blog post with slug: ${sanitizedSlug} (Request ID: ${requestId})`);

    // First, try to find the post ID from the slug since deletion works better with IDs
    let postIdOrSlug = sanitizedSlug;
    
    try {
      console.log(`Attempting to find post ID for slug: ${sanitizedSlug}`);
      const postResult = await sanityBlogService.getPostBySlug(sanitizedSlug);
      
      if (postResult.success && postResult.data) {
        postIdOrSlug = postResult.data._id;
        console.log(`Found post ID: ${postIdOrSlug} for slug: ${sanitizedSlug}`);
      } else {
        console.log(`Post not found by slug, will attempt deletion with slug: ${sanitizedSlug}`);
      }
    } catch (lookupError) {
      console.warn(`Failed to lookup post by slug, proceeding with slug-based deletion:`, lookupError);
    }

    // Use enhanced deletion service with options from request
    const deletionResult = await blogDeletionService.deletePost(postIdOrSlug, {
      retryAttempts: deletionOptions.retryAttempts,
      retryDelay: deletionOptions.retryDelay,
      skipCacheInvalidation: deletionOptions.skipCacheInvalidation,
      confirmationRequired: false,
      validateBeforeDelete: deletionOptions.validateBeforeDelete
    });

    const duration = Date.now() - startTime;

    if (!deletionResult.success) {
      const error = deletionResult.error!;
      console.error(`Failed to delete blog post "${sanitizedSlug}":`, {
        error,
        requestId,
        duration,
        retryCount: deletionResult.retryCount
      });

      // Map error categories to HTTP status codes
      let statusCode = 500;
      switch (error.category) {
        case 'validation':
          statusCode = error.code === 'POST_NOT_FOUND' ? 404 : 400;
          break;
        case 'permission':
          statusCode = 403;
          break;
        case 'network':
          statusCode = 503; // Service Unavailable
          break;
        case 'server':
          statusCode = 502; // Bad Gateway
          break;
        default:
          statusCode = 500;
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            category: error.category,
            retryable: error.retryable,
            suggestedAction: error.suggestedAction
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            duration,
            retryCount: deletionResult.retryCount,
            validationPassed: deletionResult.validationPassed
          }
        },
        { status: statusCode }
      );
    }

    // Success response
    console.log(`✅ Successfully deleted blog post "${sanitizedSlug}":`, {
      postId: deletionResult.postId,
      title: deletionResult.title,
      cacheInvalidated: deletionResult.cacheInvalidated,
      requestId,
      duration,
      retryCount: deletionResult.retryCount
    });

    return NextResponse.json({
      success: true,
      data: {
        postId: deletionResult.postId,
        slug: deletionResult.slug,
        title: deletionResult.title,
        cacheInvalidated: deletionResult.cacheInvalidated
      },
      meta: {
        requestId,
        timestamp: deletionResult.timestamp,
        duration,
        retryCount: deletionResult.retryCount,
        validationPassed: deletionResult.validationPassed
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Unexpected error in DELETE /api/blog/posts/[slug]:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      duration,
      slug: (await params).slug
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error occurred during deletion',
          code: 'INTERNAL_ERROR',
          category: 'server',
          retryable: true,
          suggestedAction: 'Try again in a few moments or contact support if the issue persists'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration
        }
      },
      { status: 500 }
    );
  }
}