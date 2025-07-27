import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { AuthorPermissionService } from '@/lib/permissions/author-permissions'

// GET /api/admin/authors/[id]/permissions - Get author permissions details
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
        authorLevel,
        permissions,
        contentAreas,
        credentials,
        status
      }
    `

    const author = await sanityClient.fetch(authorQuery, { authorId })

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    // Get computed permissions
    const computedPermissions = AuthorPermissionService.getAuthorPermissions(
      author.authorLevel,
      author.permissions
    )

    // Get workflow permissions
    const workflowPermissions = AuthorPermissionService.getWorkflowPermissions(author)

    // Get dashboard permissions
    const dashboardPermissions = AuthorPermissionService.getDashboardPermissions(author)

    // Get content limits
    const contentLimits = AuthorPermissionService.getContentLimits(author)

    // Check content area permissions
    const contentAreaPermissions = author.contentAreas.map((area: string) => ({
      area,
      canWrite: AuthorPermissionService.canWriteInContentArea(author, area),
      requiresExpertise: area.includes('technical') || area.includes('atpl') || area.includes('type-rating')
    }))

    return NextResponse.json({
      success: true,
      data: {
        author: {
          _id: author._id,
          name: author.name,
          authorLevel: author.authorLevel,
          status: author.status
        },
        permissions: {
          computed: computedPermissions,
          workflow: workflowPermissions,
          dashboard: dashboardPermissions,
          contentLimits,
          contentAreas: contentAreaPermissions
        }
      }
    })

  } catch (error) {
    console.error('Error fetching author permissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch author permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/authors/[id]/permissions - Update author permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params
    const body = await request.json()
    const { currentUser, permissions: newPermissions, authorLevel } = body

    // Validate current user has permission to manage authors
    if (!currentUser || !currentUser.authorLevel) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get target author
    const targetAuthor = await sanityClient.fetch(
      `*[_type == "author" && _id == $authorId][0] { _id, name, authorLevel }`,
      { authorId }
    )

    if (!targetAuthor) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    // Validate permissions update
    const validation = AuthorPermissionService.validatePermissionsUpdate(
      currentUser,
      targetAuthor,
      newPermissions
    )

    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Permission validation failed',
          details: validation.errors
        },
        { status: 403 }
      )
    }

    // Update author permissions
    const updateData: any = {
      lastActive: new Date().toISOString()
    }

    if (authorLevel && authorLevel !== targetAuthor.authorLevel) {
      updateData.authorLevel = authorLevel
    }

    if (newPermissions) {
      updateData.permissions = {
        ...targetAuthor.permissions,
        ...newPermissions
      }
    }

    const result = await sanityClient
      .patch(authorId)
      .set(updateData)
      .commit()

    // Log the permission change
    await sanityClient.create({
      _type: 'permissionChangeLog',
      changedBy: {
        _type: 'reference',
        _ref: currentUser._id
      },
      targetAuthor: {
        _type: 'reference',
        _ref: authorId
      },
      changes: {
        authorLevel: {
          from: targetAuthor.authorLevel,
          to: authorLevel
        },
        permissions: newPermissions
      },
      timestamp: new Date().toISOString(),
      reason: body.reason || 'Permission update via admin interface'
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Author permissions updated successfully'
    })

  } catch (error) {
    console.error('Error updating author permissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update author permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/authors/[id]/permissions/validate - Validate permission changes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params
    const body = await request.json()
    const { currentUser, permissions: newPermissions, authorLevel } = body

    if (!currentUser || !currentUser.authorLevel) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get target author
    const targetAuthor = await sanityClient.fetch(
      `*[_type == "author" && _id == $authorId][0] { _id, name, authorLevel, permissions }`,
      { authorId }
    )

    if (!targetAuthor) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    // Validate permissions update
    const validation = AuthorPermissionService.validatePermissionsUpdate(
      currentUser,
      { ...targetAuthor, authorLevel: authorLevel || targetAuthor.authorLevel },
      newPermissions
    )

    // Get preview of what permissions would look like
    const previewPermissions = AuthorPermissionService.getAuthorPermissions(
      authorLevel || targetAuthor.authorLevel,
      { ...targetAuthor.permissions, ...newPermissions }
    )

    return NextResponse.json({
      success: true,
      data: {
        validation,
        preview: {
          authorLevel: authorLevel || targetAuthor.authorLevel,
          permissions: previewPermissions,
          changes: {
            authorLevel: {
              from: targetAuthor.authorLevel,
              to: authorLevel || targetAuthor.authorLevel,
              changed: authorLevel && authorLevel !== targetAuthor.authorLevel
            },
            permissions: Object.keys(newPermissions || {}).map(key => ({
              permission: key,
              from: targetAuthor.permissions?.[key as keyof typeof targetAuthor.permissions],
              to: newPermissions[key],
              changed: targetAuthor.permissions?.[key as keyof typeof targetAuthor.permissions] !== newPermissions[key]
            })).filter(change => change.changed)
          }
        }
      }
    })

  } catch (error) {
    console.error('Error validating author permissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate author permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}