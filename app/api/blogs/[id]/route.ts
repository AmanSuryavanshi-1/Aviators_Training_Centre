import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await enhancedClient.fetch(`
      *[_type == "post" && _id == $id][0] {
        _id,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        featured,
        readingTime,
        category->{
          title,
          slug
        },
        author->{
          name,
          slug,
          role,
          bio
        },
        image {
          asset->,
          alt
        },
        tags,
        seoTitle,
        seoDescription,
        focusKeyword
      }
    `, { id });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await enhancedClient.delete(id);
    
    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
