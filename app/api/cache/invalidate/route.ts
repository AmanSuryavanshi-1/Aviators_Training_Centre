import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * POST /api/cache/invalidate
 * Server-side cache invalidation endpoint for client-side requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { success: false, error: 'Missing type or value' },
        { status: 400 }
      );
    }

    console.log(`🔄 Cache invalidation request: ${type} = ${value}`);

    if (type === 'tag') {
      revalidateTag(value);
      console.log(`✅ Invalidated cache tag: ${value}`);
    } else if (type === 'path') {
      revalidatePath(value);
      console.log(`✅ Invalidated cache path: ${value}`);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "tag" or "path"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cache ${type} invalidated successfully`,
      invalidated: { type, value }
    });

  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to invalidate cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cache/invalidate
 * Get cache invalidation endpoint information
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cache invalidation endpoint',
    usage: {
      method: 'POST',
      body: {
        type: 'tag | path',
        value: 'string'
      }
    },
    examples: [
      {
        type: 'tag',
        value: 'blog-posts'
      },
      {
        type: 'path',
        value: '/blog'
      }
    ]
  });
}