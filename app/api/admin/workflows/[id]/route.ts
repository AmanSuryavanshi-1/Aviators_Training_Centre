import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// GET /api/admin/workflows/[id] - Get specific workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params

    const workflowQuery = `
      *[_type == "workflow" && _id == $workflowId][0] {
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
        workflowHistory[]{
          timestamp,
          action,
          performedBy->{
            _id,
            name,
            email,
            image,
            authorLevel
          },
          notes
        },
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

    const workflow = await sanityClient.fetch(workflowQuery, { workflowId })

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workflow
    })

  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/workflows/[id] - Update workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()

    const result = await sanityClient
      .patch(workflowId)
      .set(body)
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Workflow updated successfully'
    })

  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/workflows/[id] - Delete workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params

    await sanityClient.delete(workflowId)

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}