import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';

const sanityBlogService = SanityBlogService.getInstance();

/**
 * GET /api/blog/posts/[slug]/related
 * Fetch related blog posts for a given post slug from Sanity CMS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 3;
    const category = searchParams.get('category') || undefined;

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

    // Validate limit parameter
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Limit must be between 1 and 20',
            code: 'INVALID_LIMIT'
          }
        },
        { status: 400 }
      );
    }

    // First, get the current post to find its ID and category
    const currentPostResult = await sanityBlogService.getPostBySlug(slug);
    
    if (!currentPostResult.success) {
      console.error(`Failed to fetch current post with slug "${slug}":`, currentPostResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch current post',
            code: 'FETCH_ERROR'
          }
        },
        { status: 500 }
      );
    }

    if (!currentPostResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Current post not found',
            code: 'POST_NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    const currentPost = currentPostResult.data;
    const categorySlug = category || currentPost.category?.slug;

    // Fetch related posts
    const result = await sanityBlogService.getRelatedPosts(
      currentPost._id,
      categorySlug,
      {
        limit,
        cache: {
          enabled: true,
          ttl: 300, // 5 minutes
          tags: [`related-posts-${slug}`, categorySlug ? `category-${categorySlug}` : ''].filter(Boolean)
        }
      }
    );

    if (!result.success) {
      console.error(`Failed to fetch related posts for slug "${slug}":`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch related posts',
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
        currentPost: {
          id: currentPost._id,
          slug: currentPost.slug,
          title: currentPost.title,
          category: currentPost.category?.slug
        }
      }
    });

  } catch (error) {
    console.error(`Unexpected error in GET /api/blog/posts/[slug]/related:`, error);
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