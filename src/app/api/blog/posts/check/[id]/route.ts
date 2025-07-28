import { NextRequest, NextResponse } from 'next/server';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';

/**
 * GET /api/blog/posts/check/[id]
 * Check if a blog post exists by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🔍 Checking if post exists: ${id}`);

    // Clear cache to ensure fresh data
    unifiedBlogService.clearCache();
    
    const post = await unifiedBlogService.getPost(id);

    if (post) {
      return NextResponse.json({
        success: true,
        exists: true,
        post: {
          _id: post._id,
          title: post.title,
          slug: post.slug.current,
          publishedAt: post.publishedAt,
          editable: post.editable
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        message: `Post not found with identifier: ${id}`
      });
    }

  } catch (error) {
    console.error('Error checking post existence:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to check post existence',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}