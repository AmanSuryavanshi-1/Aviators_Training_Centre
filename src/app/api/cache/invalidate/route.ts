import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Get the secret token from headers or body
    const authHeader = request.headers.get('authorization');
    const body = await request.json().catch(() => ({}));
    const token = authHeader?.replace('Bearer ', '') || body.token;

    // Simple token validation (you can make this more secure)
    const expectedToken = process.env.CACHE_INVALIDATION_TOKEN || 'dev-token';
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type = 'all', path, tag } = body;

    console.log('🔄 Manual cache invalidation requested:', { type, path, tag });

    switch (type) {
      case 'all':
        // Invalidate all blog-related cache
        revalidateTag('blog-posts');
        revalidateTag('blog-post');
        revalidateTag('blog-categories');
        revalidateTag('blog-authors');
        revalidatePath('/blog');
        revalidatePath('/');
        console.log('✅ All blog cache invalidated');
        break;

      case 'path':
        if (path) {
          revalidatePath(path);
          console.log(`✅ Path cache invalidated: ${path}`);
        }
        break;

      case 'tag':
        if (tag) {
          revalidateTag(tag);
          console.log(`✅ Tag cache invalidated: ${tag}`);
        }
        break;

      case 'blog':
        revalidateTag('blog-posts');
        revalidateTag('blog-post');
        revalidatePath('/blog');
        console.log('✅ Blog cache invalidated');
        break;

      default:
        return NextResponse.json({ error: 'Invalid invalidation type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Cache invalidated successfully (${type})`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Cache invalidation endpoint is active',
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      },
      body: {
        type: 'all | path | tag | blog',
        path: '/blog/some-post (for path type)',
        tag: 'blog-posts (for tag type)',
        token: 'YOUR_TOKEN (alternative to Authorization header)'
      }
    },
    timestamp: new Date().toISOString()
  });
}