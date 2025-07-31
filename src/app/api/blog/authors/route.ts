import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';

const sanityBlogService = SanityBlogService.getInstance();

/**
 * GET /api/blog/authors
 * Fetch all blog authors from Sanity CMS
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch authors from Sanity
    const result = await sanityBlogService.getAllAuthors({
      cache: {
        enabled: true,
        ttl: 600, // 10 minutes (authors change less frequently)
        tags: ['blog-authors']
      }
    });

    if (!result.success) {
      console.error('Failed to fetch blog authors:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch blog authors',
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
    console.error('Unexpected error in GET /api/blog/authors:', error);
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
