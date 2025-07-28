import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Force Cache Invalidation API
 * 
 * This endpoint forces invalidation of all blog-related caches
 * Use this when you notice cache sync issues between Sanity and your deployed site
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, type = 'all' } = body;

    // Security check - you can add a secret key for protection
    // if (secret !== process.env.CACHE_INVALIDATION_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔄 Starting force cache invalidation...');

    // Invalidate all blog-related cache tags
    const cacheTags = [
      'blog-posts',
      'blog-categories', 
      'blog-authors',
      'blog-slugs',
      'featured-posts',
      'courses',
      'sanity-data'
    ];

    console.log('🏷️ Invalidating cache tags:', cacheTags);
    cacheTags.forEach(tag => {
      try {
        revalidateTag(tag);
        console.log(`✅ Invalidated tag: ${tag}`);
      } catch (error) {
        console.warn(`⚠️ Failed to invalidate tag ${tag}:`, error);
      }
    });

    // Invalidate specific paths
    const pathsToRevalidate = [
      '/', // Homepage
      '/blog', // Blog listing
      '/api/blog/posts', // API routes
      '/api/blog/unified',
      '/api/blog/simple',
      '/sitemap.xml',
      '/blog-sitemap.xml'
    ];

    console.log('📁 Invalidating paths:', pathsToRevalidate);
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
        console.log(`✅ Invalidated path: ${path}`);
      } catch (error) {
        console.warn(`⚠️ Failed to invalidate path ${path}:`, error);
      }
    }

    // If specific slug is provided, invalidate that too
    if (body.slug) {
      const specificPaths = [
        `/blog/${body.slug}`,
        `/api/blog/posts/${body.slug}`
      ];
      
      for (const path of specificPaths) {
        try {
          revalidatePath(path);
          console.log(`✅ Invalidated specific path: ${path}`);
        } catch (error) {
          console.warn(`⚠️ Failed to invalidate specific path ${path}:`, error);
        }
      }
    }

    // Return success response with instructions
    return NextResponse.json({
      success: true,
      message: 'Cache invalidation completed',
      invalidated: {
        tags: cacheTags,
        paths: pathsToRevalidate,
        timestamp: new Date().toISOString()
      },
      nextSteps: [
        'Wait 30-60 seconds for changes to propagate',
        'Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)',
        'Check if the deleted posts are now gone from the website',
        'If issues persist, wait a few minutes as CDN caches may take time to clear'
      ]
    });

  } catch (error) {
    console.error('❌ Error during cache invalidation:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cache invalidation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Simple GET endpoint to check cache invalidation status
  return NextResponse.json({
    message: 'Cache Invalidation API',
    usage: 'POST to this endpoint to force invalidate all blog caches',
    example: {
      method: 'POST',
      body: {
        type: 'all', // or 'specific'
        slug: 'optional-slug-to-invalidate' // optional
      }
    },
    timestamp: new Date().toISOString()
  });
}
