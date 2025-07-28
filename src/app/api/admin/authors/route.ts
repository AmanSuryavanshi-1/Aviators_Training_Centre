import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { checkPermission } from '@/studio/lib/permissions'

// GET /api/admin/authors - Get all authors with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query filters
    let filters = ['_type == "author"']
    
    if (level && level !== 'all') {
      filters.push(`authorLevel == "${level}"`)
    }
    
    if (status && status !== 'all') {
      filters.push(`status == "${status}"`)
    }
    
    if (search) {
      filters.push(`(name match "${search}*" || email match "${search}*")`)
    }

    const filterQuery = filters.join(' && ')

    // Query authors with their post statistics
    const authorsQuery = `
      *[${filterQuery}] | order(name asc) {
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
        }
      }
    `

    const authors = await sanityClient.fetch(authorsQuery)

    return NextResponse.json({
      success: true,
      data: authors,
      total: authors.length
    })

  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch authors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/authors - Create new author
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'bio', 'role']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create author document
    const authorData = {
      _type: 'author',
      name: body.name,
      slug: { current: slug },
      email: body.email,
      bio: body.bio,
      role: body.role,
      credentials: body.credentials || [],
      experience: body.experience || {},
      authorLevel: body.authorLevel || 'regular',
      permissions: {
        canPublishDirectly: body.permissions?.canPublishDirectly || false,
        canEditOthersContent: body.permissions?.canEditOthersContent || false,
        canManageCategories: body.permissions?.canManageCategories || false,
        canManageCourses: body.permissions?.canManageCourses || false,
        requiresApproval: body.permissions?.requiresApproval !== false // Default to true
      },
      contentAreas: body.contentAreas || [],
      socialMedia: body.socialMedia || {},
      status: body.status || 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      notificationPreferences: {
        emailNotifications: body.notificationPreferences?.emailNotifications !== false,
        reviewReminders: body.notificationPreferences?.reviewReminders !== false,
        publishingUpdates: body.notificationPreferences?.publishingUpdates !== false
      }
    }

    const result = await sanityClient.create(authorData)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Author created successfully'
    })

  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create author',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}