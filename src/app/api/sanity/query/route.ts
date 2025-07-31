import { NextRequest, NextResponse } from 'next/server';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

/**
 * POST /api/sanity/query
 * Execute GROQ queries against Sanity
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { query, params = {} } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Missing query parameter' },
        { status: 400 }
      );
    }

    // Execute the query
    const data = await sanitySimpleService.getClient().fetch(query, params);

    return NextResponse.json({
      success: true,
      data,
      query,
      params
    });

  } catch (error) {
    console.error('❌ Error executing Sanity query:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to execute query',
        query: request.body
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sanity/query
 * Get predefined queries for common operations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const predefinedQueries = {
    posts: `*[_type == "post"] | order(_updatedAt desc) {
      _id,
      title,
      slug,
      publishedAt,
      featured,
      author->{name},
      category->{title},
      _updatedAt
    }`,
    authors: `*[_type == "author"] | order(_updatedAt desc) {
      _id,
      name,
      slug,
      email,
      _updatedAt
    }`,
    categories: `*[_type == "category"] | order(_updatedAt desc) {
      _id,
      title,
      slug,
      description,
      color,
      _updatedAt
    }`,
    stats: `{
      "totalPosts": count(*[_type == "post"]),
      "publishedPosts": count(*[_type == "post" && defined(publishedAt)]),
      "featuredPosts": count(*[_type == "post" && featured == true]),
      "totalAuthors": count(*[_type == "author"]),
      "totalCategories": count(*[_type == "category"])
    }`
  };

  if (type && predefinedQueries[type as keyof typeof predefinedQueries]) {
    try {
      const query = predefinedQueries[type as keyof typeof predefinedQueries];
      const data = await sanitySimpleService.getClient().fetch(query);

      return NextResponse.json({
        success: true,
        data,
        query,
        type
      });
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to execute predefined query'
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    availableQueries: Object.keys(predefinedQueries),
    usage: 'Use ?type=posts|authors|categories|stats to get predefined queries'
  });
}