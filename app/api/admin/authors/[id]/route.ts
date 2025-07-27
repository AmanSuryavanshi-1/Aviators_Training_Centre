import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// GET /api/admin/authors/[id] - Get specific author
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params

    const authorQuery = `
      *[_type == "author" && _id == $authorId][0] {
        _id,
        name,
        slug,
        email,
        image,
        bio,
        role,
        credentials,
        experience,
        authorLevel,
        permissions,
        contentAreas,
        socialMedia,
        status,
        joinedDate,
        lastActive,
        notificationPreferences,
        "stats": {
          "totalPosts": count(*[_type == "post" && author._ref == ^._id]),
          "publishedPosts": count(*[_type == "post" && author._ref == ^._id && defined(publishedAt)]),
          "draftPosts": count(*[_type == "post" && author._ref == ^._id && !defined(publishedAt) && workflowStatus == "draft"]),
          "pendingReview": count(*[_type == "post" && author._ref == ^._id && workflowStatus == "review"])
        },
        "recentPosts": *[_type == "post" && author._ref == ^._id] | order(publishedAt desc, _createdAt desc)[0...5] {
          _id,
          title,
          slug,
          publishedAt,
          workflowStatus
        }
      }
    `

    const author = await sanityClient.fetch(authorQuery, { authorId })

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: author
    })

  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch author',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/authors/[id] - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params
    const body = await request.json()

    // Update slug if name changed
    let updateData = { ...body }
    if (body.name) {
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      updateData.slug = { current: slug }
    }

    // Update lastActive timestamp
    updateData.lastActive = new Date().toISOString()

    const result = await sanityClient
      .patch(authorId)
      .set(updateData)
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Author updated successfully'
    })

  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update author',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/authors/[id] - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params

    // Check if author has published posts
    const postsQuery = `count(*[_type == "post" && author._ref == $authorId && defined(publishedAt)])`
    const publishedPostsCount = await sanityClient.fetch(postsQuery, { authorId })

    if (publishedPostsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete author with published posts',
          details: `Author has ${publishedPostsCount} published posts. Please reassign or unpublish these posts first.`
        },
        { status: 400 }
      )
    }

    // Delete the author
    await sanityClient.delete(authorId)

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete author',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/authors/[id] - Update author status or specific fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params
    const body = await request.json()

    // Handle specific patch operations
    const { operation, ...updateData } = body

    switch (operation) {
      case 'updateStatus':
        await sanityClient
          .patch(authorId)
          .set({ 
            status: updateData.status,
            lastActive: new Date().toISOString()
          })
          .commit()
        break

      case 'updatePermissions':
        await sanityClient
          .patch(authorId)
          .set({ 
            permissions: updateData.permissions,
            lastActive: new Date().toISOString()
          })
          .commit()
        break

      case 'updateNotifications':
        await sanityClient
          .patch(authorId)
          .set({ 
            notificationPreferences: updateData.notificationPreferences,
            lastActive: new Date().toISOString()
          })
          .commit()
        break

      default:
        // General update
        await sanityClient
          .patch(authorId)
          .set({
            ...updateData,
            lastActive: new Date().toISOString()
          })
          .commit()
    }

    return NextResponse.json({
      success: true,
      message: 'Author updated successfully'
    })

  } catch (error) {
    console.error('Error patching author:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update author',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}