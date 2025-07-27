import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { NotificationService } from '@/lib/notifications/notification-service'

// GET /api/admin/communications - Get team communications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query filters
    let filters = ['_type == "teamCommunication"']
    
    if (type && type !== 'all') {
      filters.push(`type == "${type}"`)
    }
    
    if (category && category !== 'all') {
      filters.push(`category == "${category}"`)
    }

    // Filter by target audience if userId provided
    if (userId) {
      filters.push(`(
        targetAudience == "all" || 
        (targetAudience == "specific" && "${userId}" in specificUsers[]._ref)
      )`)
    }

    // Only show non-expired communications
    const now = new Date().toISOString()
    filters.push(`(!defined(expiresAt) || expiresAt > "${now}")`)

    const filterQuery = filters.join(' && ')

    // Query communications
    const communicationsQuery = `
      *[${filterQuery}] | order(isSticky desc, createdAt desc) [${offset}...${offset + limit}] {
        _id,
        type,
        title,
        content,
        author->{
          _id,
          name,
          image
        },
        targetAudience,
        specificUsers[]->{
          _id,
          name
        },
        priority,
        category,
        tags,
        isSticky,
        allowComments,
        expiresAt,
        comments[]{
          commentId,
          author->{
            _id,
            name,
            image
          },
          content,
          timestamp,
          parentId,
          isEdited,
          editedAt
        },
        reactions[]{
          user->{
            _id,
            name
          },
          type,
          timestamp
        },
        readBy[]{
          user->{
            _id,
            name
          },
          timestamp
        },
        createdAt,
        updatedAt
      }
    `

    const communications = await sanityClient.fetch(communicationsQuery)

    // Get total count
    const totalQuery = `count(*[${filterQuery}])`
    const total = await sanityClient.fetch(totalQuery)

    return NextResponse.json({
      success: true,
      data: communications,
      total,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch communications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/communications - Create team communication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      title, 
      content, 
      authorId, 
      targetAudience, 
      specificUsers = [],
      priority = 'medium',
      category,
      tags = [],
      isSticky = false,
      allowComments = true,
      expiresAt
    } = body

    if (!type || !title || !content || !authorId || !targetAudience || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, title, content, authorId, targetAudience, category' 
        },
        { status: 400 }
      )
    }

    // Get author details
    const author = await sanityClient.fetch(
      `*[_type == "author" && _id == $authorId][0]{ _id, name, email }`,
      { authorId }
    )

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      )
    }

    // Create communication document
    const communicationDoc = {
      _type: 'teamCommunication',
      type,
      title,
      content,
      author: {
        _type: 'reference',
        _ref: authorId
      },
      targetAudience,
      specificUsers: specificUsers.map((userId: string) => ({
        _type: 'reference',
        _ref: userId
      })),
      priority,
      category,
      tags,
      isSticky,
      allowComments,
      expiresAt,
      comments: [],
      reactions: [],
      readBy: [],
      createdAt: new Date().toISOString()
    }

    const result = await sanityClient.create(communicationDoc)

    // Send notifications to target audience
    try {
      const teamAnnouncement = await NotificationService.createTeamAnnouncement({
        type,
        title,
        content: Array.isArray(content) ? content.map(block => 
          block._type === 'block' ? block.children?.map((child: any) => child.text).join('') : ''
        ).join(' ') : content,
        authorId,
        authorName: author.name,
        targetAudience,
        specificUsers,
        priority,
        category,
        tags,
        isSticky,
        allowComments
      })

      console.log('Team announcement created:', teamAnnouncement.id)
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError)
      // Don't fail the communication creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Team communication created successfully'
    })

  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create communication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}