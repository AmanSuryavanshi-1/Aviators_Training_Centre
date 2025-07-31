import { NextRequest, NextResponse } from 'next/server';
import { sanitySimpleService } from '@/lib/sanity/client.simple';

/**
 * DELETE /api/sanity/delete
 * Delete content from Sanity CMS
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, id' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['post', 'author', 'category'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Get the document first to check if it exists and get its title/name
    const document = await sanitySimpleService.getClient().fetch(
      `*[_type == $type && _id == $id][0]`,
      { type, id }
    );

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check for dependencies before deletion
    if (type === 'author') {
      const postsUsingAuthor = await sanitySimpleService.getClient().fetch(
        `*[_type == "post" && references($id)]`,
        { id }
      );

      if (postsUsingAuthor.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot delete author. ${postsUsingAuthor.length} blog post(s) are using this author.`,
            dependencies: postsUsingAuthor.map((post: any) => post.title)
          },
          { status: 409 }
        );
      }
    }

    if (type === 'category') {
      const postsUsingCategory = await sanitySimpleService.getClient().fetch(
        `*[_type == "post" && references($id)]`,
        { id }
      );

      if (postsUsingCategory.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot delete category. ${postsUsingCategory.length} blog post(s) are using this category.`,
            dependencies: postsUsingCategory.map((post: any) => post.title)
          },
          { status: 409 }
        );
      }
    }

    // Perform the deletion
    const result = await sanitySimpleService.getClient().delete(id);

    // Clean up related analytics data if it's a blog post
    if (type === 'post' && document.slug?.current) {
      try {
        // Call the analytics cleanup API
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics/cleanup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postSlug: document.slug.current })
        });
      } catch (cleanupError) {
        console.warn('Failed to clean up analytics data:', cleanupError);
        // Don't fail the deletion if analytics cleanup fails
      }
    }

    const documentTitle = document.title || document.name || 'Document';

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${documentTitle}" deleted successfully`,
      deletedDocument: {
        id: result.id,
        type,
        title: documentTitle
      }
    });

  } catch (error) {
    console.error('❌ Error deleting document:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete document'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sanity/delete (Batch delete)
 * Delete multiple documents at once
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { items } = body; // Array of { type, id } objects

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid items array' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { type, id } = item;
        
        // Get document info
        const document = await sanitySimpleService.getClient().fetch(
          `*[_type == $type && _id == $id][0]`,
          { type, id }
        );

        if (!document) {
          errors.push({ id, error: 'Document not found' });
          continue;
        }

        // Check dependencies for authors and categories
        if (type === 'author' || type === 'category') {
          const postsUsing = await sanitySimpleService.getClient().fetch(
            `*[_type == "post" && references($id)]`,
            { id }
          );

          if (postsUsing.length > 0) {
            errors.push({ 
              id, 
              error: `Cannot delete ${type}. ${postsUsing.length} post(s) are using it.` 
            });
            continue;
          }
        }

        // Delete the document
        const result = await sanitySimpleService.getClient().delete(id);
        
        results.push({
          id: result.id,
          type,
          title: document.title || document.name || 'Document',
          success: true
        });

        // Clean up analytics for blog posts
        if (type === 'post' && document.slug?.current) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analytics/cleanup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ postSlug: document.slug.current })
            });
          } catch (cleanupError) {
            console.warn('Failed to clean up analytics data:', cleanupError);
          }
        }

      } catch (error) {
        errors.push({ 
          id: item.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Deleted ${results.length} item(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`,
      results,
      errors
    });

  } catch (error) {
    console.error('❌ Error in batch delete:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete documents'
      },
      { status: 500 }
    );
  }
}