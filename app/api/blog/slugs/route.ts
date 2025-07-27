import { NextRequest, NextResponse } from 'next/server';
import { SanityBlogService } from '@/lib/blog/sanity-blog-service';

const sanityBlogService = SanityBlogService.getInstance();

/**
 * GET /api/blog/slugs
 * Fetch all blog post slugs from Sanity CMS (useful for static generation)
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all post slugs from Sanity
    const result = await sanityBlogService.getAllPostSlugs({
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        tags: ['blog-slugs']
      }
    });

    if (!result.success) {
      console.error('Failed to fetch blog post slugs:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to fetch blog post slugs',
            code: result.error?.code || 'FETCH_ERROR'
          }
        },
        { status: 500 }
      );
    }

    // Extract just the slugs for simpler response
    const slugs = result.data?.map(item => item.params.slug) || [];

    return NextResponse.json({
      success: true,
      data: {
        slugs,
        paths: result.data // Keep the original format for Next.js static generation
      },
      meta: {
        ...result.meta,
        count: slugs.length
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/blog/slugs:', error);
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