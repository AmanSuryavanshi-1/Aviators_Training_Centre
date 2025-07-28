import { NextRequest, NextResponse } from 'next/server';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';

/**
 * GET /api/blog/simple
 * Simple blog API endpoint that works with the admin interface
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category') || undefined;

    // Get posts using simple blog service
    const posts = await simpleBlogService.getAllPosts({
      limit,
      featured: featured || undefined,
      category
    });

    return NextResponse.json({
      success: true,
      data: posts,
      meta: {
        count: posts.length,
        timestamp: new Date().toISOString(),
        source: 'sanity'
      }
    });

  } catch (error) {
    console.error('Error in simple blog API:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog posts',
          code: 'FETCH_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/simple
 * Create a new blog post using simple service
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

    // For now, return success (actual creation would need to be implemented)
    return NextResponse.json({
      success: true,
      message: 'Post creation endpoint ready',
      data: body
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post via simple API:', error);
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