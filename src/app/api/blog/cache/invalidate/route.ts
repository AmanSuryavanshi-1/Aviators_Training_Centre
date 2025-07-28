/**
 * API endpoint for manual cache invalidation
 * This replaces the old BlogCacheManager functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { enhancedSanityBlogService } from '@/lib/blog/enhanced-sanity-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'all', slug, category } = body;

    console.log('🔄 Manual cache invalidation requested:', { type, slug, category });

    switch (type) {
      case 'all':
        // Invalidate all blog-related caches
        await enhancedSanityBlogService.refreshAllCaches();
        break;
        
      case 'post':
        if (slug) {
          revalidateTag(`blog-post-${slug}`);
          revalidatePath(`/blog/${slug}`);
          revalidateTag('blog-posts');
          revalidatePath('/blog');
        }
        break;
        
      case 'category':
        if (category) {
          revalidateTag(`blog-category-${category}`);
          revalidateTag('blog-posts');
          revalidatePath('/blog');
        }
        break;
        
      case 'featured':
        revalidateTag('featured-posts');
        revalidateTag('blog-posts');
        revalidatePath('/blog');
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid invalidation type' },
          { status: 400 }
        );
    }

    // Get updated stats
    const postsResponse = await enhancedSanityBlogService.getAllPosts();
    const categoriesResponse = await enhancedSanityBlogService.getAllCategories();
    
    const stats = {
      totalPosts: postsResponse.data?.length || 0,
      publishedPosts: postsResponse.data?.filter(post => post.status !== 'draft').length || 0,
      categories: categoriesResponse.data?.map(cat => cat.title) || [],
      lastInvalidated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Cache invalidated successfully (${type})`,
      data: stats,
    });

  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cache invalidation failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current cache status
    const postsResponse = await enhancedSanityBlogService.getAllPosts();
    const categoriesResponse = await enhancedSanityBlogService.getAllCategories();
    
    const stats = {
      totalPosts: postsResponse.data?.length || 0,
      publishedPosts: postsResponse.data?.filter(post => post.status !== 'draft').length || 0,
      categories: categoriesResponse.data?.map(cat => cat.title) || [],
      lastChecked: new Date().toISOString(),
      cacheStatus: 'automatic', // Indicate that caching is now automatic
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('❌ Failed to get cache status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get cache status' 
      },
      { status: 500 }
    );
  }
}