import { NextRequest, NextResponse } from 'next/server';
import {
  getMarkdownBlogPosts,
  getMarkdownFeaturedBlogPosts,
  getMarkdownBlogPostBySlug,
  getMarkdownBlogPostsByCategory,
  searchMarkdownBlogPosts,
  getMarkdownBlogCategories,
  getMarkdownBlogTags,
  isMarkdownBlogAvailable
} from '@/lib/blog/markdown-server-utils';

/**
 * Server-only API route for markdown file operations
 * This replaces direct fs imports in client components
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (action) {
      case 'test':
        // Simple test endpoint for fallback system health checks
        const testAvailable = await isMarkdownBlogAvailable();
        return NextResponse.json({
          success: true,
          data: { status: 'ok', available: testAvailable },
          meta: {
            test: true,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'all':
        const allPosts = await getMarkdownBlogPosts({ limit: 1000 }); // Get all for counting
        const paginatedPosts = allPosts.slice(offset, offset + limit);
        return NextResponse.json({
          success: true,
          data: paginatedPosts,
          meta: {
            count: paginatedPosts.length,
            total: allPosts.length,
            source: 'markdown',
            timestamp: new Date().toISOString(),
            pagination: {
              limit,
              offset,
              hasMore: offset + limit < allPosts.length,
            },
          },
        });

      case 'featured':
        const featuredPosts = await getMarkdownFeaturedBlogPosts();
        return NextResponse.json({
          success: true,
          data: featuredPosts,
          meta: {
            count: featuredPosts.length,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'single':
        if (!slug) {
          return NextResponse.json(
            { success: false, error: 'Slug is required for single post' },
            { status: 400 }
          );
        }
        const post = await getMarkdownBlogPostBySlug(slug);
        return NextResponse.json({
          success: true,
          data: post,
          meta: {
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'categories':
        const categories = await getMarkdownBlogCategories();
        return NextResponse.json({
          success: true,
          data: categories,
          meta: {
            count: categories.length,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'tags':
        const tags = await getMarkdownBlogTags();
        return NextResponse.json({
          success: true,
          data: tags,
          meta: {
            count: tags.length,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'by-category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category is required for by-category action' },
            { status: 400 }
          );
        }
        const categoryPosts = await getMarkdownBlogPostsByCategory(category);
        return NextResponse.json({
          success: true,
          data: categoryPosts,
          meta: {
            count: categoryPosts.length,
            category,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'search':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query is required for search action' },
            { status: 400 }
          );
        }
        const searchResults = await searchMarkdownBlogPosts(query);
        return NextResponse.json({
          success: true,
          data: searchResults,
          meta: {
            count: searchResults.length,
            query,
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      case 'availability':
        const isAvailable = await isMarkdownBlogAvailable();
        return NextResponse.json({
          success: true,
          data: isAvailable,
          meta: {
            source: 'markdown',
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Markdown blog API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch markdown blog data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}