import { NextResponse } from 'next/server';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';

export async function GET() {
  try {
    // Simple health check - try to fetch one post
    const posts = await simpleBlogService.getAllPosts({ limit: 1 });
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Blog service is operational',
      data: {
        postsAvailable: posts.length,
        timestamp: new Date().toISOString(),
        service: 'simple-blog-service'
      }
    });
  } catch (error) {
    console.error('Blog health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Blog service is not responding',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}