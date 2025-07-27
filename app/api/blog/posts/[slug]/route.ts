import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';
import { invalidateBlogCache } from '@/lib/cache/cache-invalidation';

const sanityBlogService = SanityBlogService.getInstance();

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
    console.error(`Unexpected error in GET /api/blog/posts/${params.slug}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
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
    console.error(`Unexpected error in PUT /api/blog/posts/${params.slug}:`, error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
            code: 'INVALID_JSON'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[slug]
 * Delete a blog post by slug from Sanity CMS
 */
export async function DELETE(
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

    // Store post data for cache invalidation before deletion
    const postData = existingPostResult.data;

    // Delete the post
    const result = await sanityBlogService.deletePost(existingPostResult.data._id);

    if (!result.success) {
      console.error(`Failed to delete blog post with slug "${slug}":`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to delete blog post',
            code: result.error?.code || 'DELETE_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Invalidate cache after successful deletion
    try {
      await invalidateBlogCache({
        type: 'post',
        postId: postData._id,
        slug: postData.slug?.current,
        categorySlug: postData.category?.slug?.current
      });
    } catch (cacheError) {
      console.warn('Failed to invalidate cache after post deletion:', cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      meta: {
        ...result.meta,
        cacheInvalidated: true
      }
    });

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/blog/posts/${params.slug}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
}