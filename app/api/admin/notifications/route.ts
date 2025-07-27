import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { NotificationService } from '@/lib/notifications/notification-service'

// GET /api/admin/notifications - Get notifications for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Build query filters
    let filters = [`_type == "notification"`, `recipient._ref == "${userId}"`]
    
    if (status && status !== 'all') {
      filters.push(`status == "${status}"`)
    }
    
    if (category && category !== 'all') {
      filters.push(`category == "${category}"`)
    }

    const filterQuery = filters.join(' && ')

    // Query notifications
    const notificationsQuery = `
      *[${filterQuery}] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        notificationId,
        recipient->{
          _id,
          name,
          email
        },
        type,
        category,
        priority,
        title,
        message,
        htmlContent,
        data,
        channels,
        status,
        createdAt,
        sentAt,
        deliveredAt,
        readAt,
        expiresAt,
        relatedWorkflow->{
          _id,
          title
        },
        relatedContent->{
          _id,
          title
        },
        actionUrl,
        actionText,
        deliveryAttempts
      }
    `

    const notifications = await sanityClient.fetch(notificationsQuery)

    // Get total count
    const totalQuery = `count(*[${filterQuery}])`
    const total = await sanityClient.fetch(totalQuery)

    return NextResponse.json({
      success: true,
      data: notifications,
      total,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications - Send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      templateId, 
      recipientId, 
      recipientEmail, 
      variables, 
      options = {} 
    } = body

    if (!templateId || !recipientId || !recipientEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: templateId, recipientId, recipientEmail' 
        },
        { status: 400 }
      )
    }

    // Send notification using the service
    const notification = await NotificationService.sendNotification(
      templateId,
      recipientId,
      recipientEmail,
      variables,
      options
    )

    // Save to Sanity
    const notificationDoc = {
      _type: 'notification',
      notificationId: notification.id,
      recipient: {
        _type: 'reference',
        _ref: recipientId
      },
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      htmlContent: notification.htmlContent,
      data: {
        variables: notification.data,
        metadata: {}
      },
      channels: notification.channels,
      status: notification.status,
      createdAt: notification.createdAt,
      sentAt: notification.sentAt,
      expiresAt: notification.expiresAt,
      relatedWorkflow: options.relatedWorkflowId ? {
        _type: 'reference',
        _ref: options.relatedWorkflowId
      } : undefined,
      relatedContent: options.relatedContentId ? {
        _type: 'reference',
        _ref: options.relatedContentId
      } : undefined,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      deliveryAttempts: []
    }

    const result = await sanityClient.create(notificationDoc)

    return NextResponse.json({
      success: true,
      data: {
        notification,
        document: result
      },
      message: 'Notification sent successfully'
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}