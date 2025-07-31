import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';
import { invalidateBlogCache } from '@/lib/cache/cache-invalidation';

const sanityBlogService = SanityBlogService.getInstance();

/**
 * GET /api/blog/posts
 * Fetch all blog posts from Sanity CMS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category') || undefined;
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // Validate parameters
    if (limit && (limit < 1 || limit > 100)) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Limit must be between 1 and 100',
            code: 'INVALID_LIMIT'
          }
        },
        { status: 400 }
      );
    }

    if (offset && offset < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            message: 'Offset must be non-negative',
            code: 'INVALID_OFFSET'
          }
        },
        { status: 400 }
      );
    }

    // Fetch posts from Sanity
    const result = await sanityBlogService.getAllPosts({
      limit,
      offset,
      featured: featured || undefined,
      category,
      includeUnpublished,
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        tags: ['blog-posts', category ? `category-${category}` : ''].filter(Boolean)
      }
    });

    if (!result.success) {
      console.error('Failed to fetch blog posts:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch blog posts',
            code: result.error?.code || 'FETCH_ERROR'
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        count: result.data?.length || 0,
        hasMore: result.data && limit ? result.data.length === limit : false
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/blog/posts:', error);
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
 * POST /api/blog/posts
 * Create a new blog post in Sanity CMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Title is required',
            code: 'MISSING_TITLE'
          }
        },
        { status: 400 }
      );
    }

    if (!body.slug?.current?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Slug is required',
            code: 'MISSING_SLUG'
          }
        },
        { status: 400 }
      );
    }

    // Create the post
    const result = await sanityBlogService.createPost(body);

    if (!result.success) {
      console.error('Failed to create blog post:', result.error);
      
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
            message: result.error?.message || 'Failed to create blog post',
            code: result.error?.code || 'CREATE_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Invalidate cache after successful creation
    try {
      await invalidateBlogCache({
        type: 'post',
        postId: result.data?._id,
        slug: result.data?.slug?.current,
        categorySlug: result.data?.category?.slug?.current
      });
    } catch (cacheError) {
      console.warn('Failed to invalidate cache after post creation:', cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        cacheInvalidated: true
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/blog/posts:', error);
    
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
