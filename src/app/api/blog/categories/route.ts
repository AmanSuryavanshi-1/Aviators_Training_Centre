import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';

const sanityBlogService = SanityBlogService.getInstance();

/**
 * GET /api/blog/categories
 * Fetch all blog categories from Sanity CMS
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch categories from Sanity
    const result = await sanityBlogService.getAllCategories({
      cache: {
        enabled: true,
        ttl: 600, // 10 minutes (categories change less frequently)
        tags: ['blog-categories']
      }
    });

    if (!result.success) {
      console.error('Failed to fetch blog categories:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch blog categories',
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
        count: result.data?.length || 0
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/blog/categories:', error);
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
