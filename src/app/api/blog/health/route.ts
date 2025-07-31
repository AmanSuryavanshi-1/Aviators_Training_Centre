import { NextRequest, NextResponse } from 'next/server';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

export async function GET(request: NextRequest) {
  try {
    // Test Sanity connection by fetching a small amount of data
    const testPosts = await sanitySimpleService.getAllPosts({ limit: 1 });
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      data: {
        sanityConnected: true,
        postsAvailable: Array.isArray(testPosts) && testPosts.length >= 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Blog health check failed:', error);
    
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
