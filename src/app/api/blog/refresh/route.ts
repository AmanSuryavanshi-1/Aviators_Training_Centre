import { NextRequest, NextResponse } from 'next/server';
import { refreshBlogCache } from '@/lib/blog/dynamic-blog-scanner';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual blog cache refresh requested');
    
    const metadata = refreshBlogCache();
    
    return NextResponse.json({
      success: true,
      message: `Blog cache refreshed successfully. Found ${metadata.totalPosts} posts (${metadata.newPostsDetected} new)`,
      data: {
        totalPosts: metadata.totalPosts,
        newPostsDetected: metadata.newPostsDetected,
        categories: metadata.categories,
        lastScanned: metadata.lastScanned
      }
    });
  } catch (error) {
    console.error('Error refreshing blog cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh blog cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const metadata = refreshBlogCache();
    
    return NextResponse.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error getting blog cache status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get blog cache status'
    }, { status: 500 });
  }
}
