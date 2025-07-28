import { NextRequest, NextResponse } from 'next/server';
import { ALL_BLOG_POSTS, getBlogPostsWithAnalytics, getFeaturedPosts } from '@/lib/blog/comprehensive-blog-data';
import { BlogPostPreview } from '@/lib/types/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const useInflatedViews = searchParams.get('admin') !== 'true'; // Use real views for admin

    // Get posts with analytics
    let posts = getBlogPostsWithAnalytics(useInflatedViews);

    // Apply filters
    if (featured) {
      posts = posts.filter(post => post.featured);
    }

    if (category && category !== 'all') {
      posts = posts.filter(post => post.category.title === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.category.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort by publication date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Pagination
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);

    // Get featured posts for homepage
    const featuredPosts = getFeaturedPosts();

    // Get categories
    const categories = Array.from(new Set(ALL_BLOG_POSTS.map(post => post.category.title)));

    return NextResponse.json({
      success: true,
      data: {
        posts: paginatedPosts,
        featuredPosts,
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        meta: {
          useInflatedViews,
          timestamp: new Date().toISOString(),
          source: 'comprehensive-blog-data',
        }
      }
    });

  } catch (error) {
    console.error('Error fetching comprehensive blog data:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to fetch blog posts',
        code: 'FETCH_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      fallback: true,
      data: {
        posts: [],
        featuredPosts: [],
        categories: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      }
    }, { status: 500 });
  }
}

// POST endpoint for creating new blog posts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const category = formData.get('category') as string || 'General';
    const author = formData.get('author') as string || 'Aman Suryavanshi';
    const tags = (formData.get('tags') as string || '').split(',').filter(tag => tag.trim());
    const featured = formData.get('featured') === 'true';

    // Validate required fields
    if (!title || !content || !excerpt) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Missing required fields: title, content, and excerpt are required',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create new blog post object
    const currentTimestamp = new Date().toISOString();
    const newPost: BlogPostPreview = {
      _id: `post-${Date.now()}`,
      _createdAt: currentTimestamp,
      title,
      slug: { current: slug },
      excerpt,
      publishedAt: currentTimestamp,
      category: {
        title: category,
        slug: { current: category.toLowerCase().replace(/\s+/g, '-') },
        color: '#075E68'
      },
      author: {
        name: author,
        slug: { current: author.toLowerCase().replace(/\s+/g, '-') },
        role: 'Aviation Expert'
      },
      readingTime: Math.max(1, Math.ceil(content.split(' ').length / 200)),
      image: {
        asset: {
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMDc1RTY4Ii8+CjxzdmcgeD0iMTUwIiB5PSIxMzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkF2aWF0aW9uPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+',
        },
        alt: `${title} - Aviation Blog Post`,
      },
      tags,
      featured,
      difficulty: 'intermediate' as const,
    };

    // In a real implementation, this would save to Sanity CMS
    // For now, we'll just return success
    console.log('New blog post created:', newPost);

    return NextResponse.json({
      success: true,
      data: {
        post: newPost,
        message: 'Blog post created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to create blog post',
        code: 'CREATE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}