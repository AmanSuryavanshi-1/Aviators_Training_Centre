import { NextRequest, NextResponse } from 'next/server';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

export async function GET(request: NextRequest) {
  try {
    // Test Sanity connection and basic functionality
    const [posts, categories] = await Promise.all([
      sanitySimpleService.getAllPosts({ limit: 1 }),
      sanitySimpleService.getCategories()
    ]);
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      data: {
        sanityConnected: true,
        postsCount: Array.isArray(posts) ? posts.length : 0,
        categoriesCount: Array.isArray(categories) ? categories.length : 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sanity health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
