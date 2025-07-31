import { NextRequest, NextResponse } from 'next/server';
import { unifiedBlogService, UnifiedBlogPost } from '@/lib/blog/unified-blog-service';
import { BlogPostPreview } from '@/lib/types/blog';

// Convert UnifiedBlogPost to BlogPostPreview for listing pages
function convertToPreview(post: UnifiedBlogPost): BlogPostPreview {
  return {
    _id: post._id,
    _createdAt: post._createdAt || post.publishedAt,
    title: post.title,
    slug: post.slug,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category,
    author: post.author,
    readingTime: post.readingTime,
    featured: post.featured,
    tags: post.tags,
    difficulty: post.difficulty || 'intermediate',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const featured = searchParams.get('featured') === 'true';

    switch (action) {
      case 'posts':
        const posts = await unifiedBlogService.getAllPosts({
          limit,
          featured: featured || undefined,
          category: category || undefined,
        });
        return NextResponse.json({ 
          posts: posts.map(convertToPreview),
          total: posts.length,
          sources: posts.reduce((acc, post) => {
            acc[post.source] = (acc[post.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });
      
      case 'featured':
        const featuredPosts = await unifiedBlogService.getAllPosts({ featured: true, limit });
        return NextResponse.json({ 
          posts: featuredPosts.map(convertToPreview),
          total: featuredPosts.length
        });
      
      case 'categories':
        const categories = await unifiedBlogService.getAllCategories();
        return NextResponse.json({ categories });
      
      case 'authors':
        const authors = await unifiedBlogService.getAllAuthors();
        return NextResponse.json({ authors });
      
      case 'post':
        if (!slug) {
          return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }
        const postResult = await unifiedBlogService.getPostBySlug(slug);
        if (!postResult.success || !postResult.data) {
          return NextResponse.json({ error: postResult.error || 'Post not found' }, { status: 404 });
        }
        const post = postResult.data;
        return NextResponse.json({ 
          post,
          source: post.source,
          canEdit: post.source === 'sanity' // Only Sanity posts can be edited through admin
        });
      
      case 'slugs':
        const allPosts = await unifiedBlogService.getAllPosts();
        return NextResponse.json({ 
          slugs: allPosts.map(p => p.slug.current),
          total: allPosts.length
        });
      
      case 'category-posts':
        if (!category) {
          return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }
        const categoryPosts = await unifiedBlogService.getAllPosts({ category, limit });
        return NextResponse.json({ 
          posts: categoryPosts.map(convertToPreview),
          category,
          total: categoryPosts.length
        });

      case 'health':
        // Health check endpoint to verify both data sources
        const healthCheck = {
          timestamp: new Date().toISOString(),
          sources: {
            sanity: { status: 'unknown', count: 0 },
            markdown: { status: 'unknown', count: 0 }
          },
          total: 0
        };

        try {
          const allHealthPosts = await unifiedBlogService.getAllPosts();
          const sanityPosts = allHealthPosts.filter(p => p.source === 'sanity');
          const markdownPosts = allHealthPosts.filter(p => p.source === 'markdown');

          healthCheck.sources.sanity = {
            status: 'healthy',
            count: sanityPosts.length
          };
          healthCheck.sources.markdown = {
            status: 'healthy',
            count: markdownPosts.length
          };
          healthCheck.total = allHealthPosts.length;

          return NextResponse.json(healthCheck);
        } catch (error) {
          healthCheck.sources.sanity.status = 'error';
          healthCheck.sources.markdown.status = 'error';
          return NextResponse.json(healthCheck, { status: 500 });
        }
      
      default:
        // Default: return all posts with metadata
        const defaultPosts = await unifiedBlogService.getAllPosts({ limit });
        const defaultCategories = await unifiedBlogService.getAllCategories();
        const defaultAuthors = await unifiedBlogService.getAllAuthors();
        
        return NextResponse.json({ 
          posts: defaultPosts.map(convertToPreview),
          categories: defaultCategories,
          authors: defaultAuthors,
          totalPosts: defaultPosts.length,
          sources: defaultPosts.reduce((acc, post) => {
            acc[post.source] = (acc[post.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });
    }
  } catch (error) {
    console.error('Unified Blog API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Create new blog post (saves to Sanity)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug,
      content, 
      excerpt, 
      category, 
      author,
      tags,
      featured, 
      seoTitle,
      seoDescription,
      focusKeyword 
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (!excerpt?.trim()) {
      return NextResponse.json({ error: 'Excerpt is required' }, { status: 400 });
    }
    if (!category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Create the post using unified service
    const newPost = await unifiedBlogService.createPost({
      title: title.trim(),
      slug: slug?.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      category: category.trim(),
      author: author?.trim(),
      tags: tags || [],
      featured: Boolean(featured),
      seoTitle: seoTitle?.trim(),
      seoDescription: seoDescription?.trim(),
      focusKeyword: focusKeyword?.trim(),
    });

    return NextResponse.json(
      { 
        message: 'Blog post created successfully', 
        post: {
          id: newPost._id,
          title: newPost.title,
          slug: newPost.slug.current,
          source: newPost.source
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('permissions') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions to create blog post. Please check your Sanity configuration.' 
        }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create blog post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing blog post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const updatedPost = await unifiedBlogService.updatePost(id, updateData);

    if (!updatedPost.success || !updatedPost.data) {
      return NextResponse.json(
        { error: updatedPost.error || 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Blog post updated successfully', 
        post: {
          id: updatedPost.data._id,
          title: updatedPost.data.title,
          slug: updatedPost.data.slug.current,
          source: updatedPost.data.source
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating blog post:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update blog post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await unifiedBlogService.deletePost(id);

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Cannot delete markdown')) {
        return NextResponse.json({ 
          error: 'Markdown posts cannot be deleted through this interface' 
        }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete blog post',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
