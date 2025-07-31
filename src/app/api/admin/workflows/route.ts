import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// GET /api/admin/workflows - Get all workflows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const priority = searchParams.get('priority')

    // Build query filters
    let filters = ['_type == "workflow"']
    
    if (status && status !== 'all') {
      filters.push(`currentStatus == "${status}"`)
    }
    
    if (assignedTo && assignedTo !== 'all') {
      filters.push(`assignedTo._ref == "${assignedTo}"`)
    }
    
    if (priority && priority !== 'all') {
      filters.push(`priority == "${priority}"`)
    }

    const filterQuery = filters.join(' && ')

    // Query workflows with populated references
    const workflowsQuery = `
      *[${filterQuery}] | order(_updatedAt desc) {
        _id,
        title,
        contentRef->{
          _id,
          title,
          _type
        },
        currentStatus,
        assignedTo->{
          _id,
          name,
          email,
          image,
          authorLevel
        },
        reviewer->{
          _id,
          name,
          email,
          image,
          authorLevel
        },
        priority,
        dueDate,
        workflowHistory,
        comments[]{
          _id,
          timestamp,
          author->{
            _id,
            name,
            email,
            image,
            authorLevel
          },
          comment,
          type,
          resolved
        },
        notifications,
        _createdAt,
        _updatedAt
      }
    `

    const workflows = await sanityClient.fetch(workflowsQuery)

    return NextResponse.json({
      success: true,
      data: workflows,
      total: workflows.length
    })

  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch workflows',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'contentRef']
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

    // Create workflow document
    const workflowData = {
      _type: 'workflow',
      title: body.title,
      contentRef: {
        _type: 'reference',
        _ref: body.contentRef
      },
      currentStatus: body.currentStatus || 'draft',
      assignedTo: body.assignedTo ? {
        _type: 'reference',
        _ref: body.assignedTo
      } : undefined,
      reviewer: body.reviewer ? {
        _type: 'reference',
        _ref: body.reviewer
      } : undefined,
      priority: body.priority || 'medium',
      dueDate: body.dueDate,
      workflowHistory: [{
        timestamp: new Date().toISOString(),
        action: 'created',
        performedBy: {
          _type: 'reference',
          _ref: body.createdBy
        },
        notes: body.notes || 'Workflow created'
      }],
      comments: [],
      notifications: {
        notifyOnStatusChange: body.notifications?.notifyOnStatusChange !== false,
        notifyOnComment: body.notifications?.notifyOnComment !== false,
        reminderFrequency: body.notifications?.reminderFrequency || 'weekly'
      }
    }

    const result = await sanityClient.create(workflowData)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Workflow created successfully'
    })

  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
