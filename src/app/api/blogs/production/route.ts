import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_BLOG_POSTS, getBlogPostsWithAnalytics } from '@/lib/blog/production-blog-data';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInflatedViews = searchParams.get('inflated') === 'true';
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    // Get blog posts with analytics
    let posts = getBlogPostsWithAnalytics(includeInflatedViews);

    // Apply filters
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category.slug.current === category);
    }

    if (featured === 'true') {
      posts = posts.filter(post => post.featured);
    }

    if (limit) {
      posts = posts.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      data: posts,
      total: posts.length,
      message: `Retrieved ${posts.length} blog posts successfully`
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog posts',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, category, tags, featured = false } = body;

    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, content, excerpt, category' 
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create new blog post object
    const newPost = {
      _id: `production-post-${Date.now()}`,
      title,
      slug: { current: slug },
      excerpt,
      content,
      publishedAt: new Date().toISOString(),
      category: {
        title: category,
        slug: { current: category.toLowerCase().replace(/\s+/g, '-') },
        color: '#075E68'
      },
      author: {
        name: 'Aviators Training Center Admin',
        slug: { current: 'aviators-training-center-admin' },
        role: 'Aviation Training Expert'
      },
      readingTime: Math.ceil(content.split(' ').length / 200), // Estimate reading time
      tags: tags || [],
      featured,
      difficulty: 'intermediate' as const,
    };

    // In a real implementation, you would save this to your database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      data: newPost,
      message: 'Blog post created successfully'
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create blog post' 
      },
      { status: 500 }
    );
  }
}
