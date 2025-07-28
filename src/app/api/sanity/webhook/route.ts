import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';

// Webhook secret for security
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const signature = request.headers.get('sanity-webhook-signature');
      if (!signature || signature !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { _type, _id, slug } = body;

    // Only handle blog post changes
    if (_type !== 'post') {
      return NextResponse.json({ message: 'Not a blog post, ignoring' });
    }

    console.log(`Webhook received for post: ${_id}, slug: ${slug?.current}`);

    // Invalidate unified blog service cache
    await unifiedBlogService.invalidateCache('all');

    // Revalidate Next.js cache
    revalidateTag('blog-posts');
    revalidateTag('blog-post');
    revalidatePath('/blog');
    
    if (slug?.current) {
      revalidatePath(`/blog/${slug.current}`);
    }

    // Broadcast to connected clients (if using WebSocket/SSE)
    await broadcastUpdate({
      type: 'blog-update',
      postId: _id,
      slug: slug?.current,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Cache invalidated successfully',
      postId: _id,
      slug: slug?.current
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Broadcast update to connected clients
async function broadcastUpdate(update: any) {
  try {
    // This would integrate with your WebSocket/SSE implementation
    // For now, we'll just log the update
    console.log('Broadcasting update:', update);
    
    // You could integrate with services like:
    // - Pusher
    // - Socket.io
    // - Server-Sent Events
    // - WebSocket
    
  } catch (error) {
    console.error('Error broadcasting update:', error);
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Sanity webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}