import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { v4 as uuidv4 } from 'uuid'

// POST /api/admin/workflows/[id]/comments - Add comment to workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()
    const { comment, type, author } = body

    if (!comment || !author) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: comment, author' 
        },
        { status: 400 }
      )
    }

    // Get current workflow to append to comments
    const currentWorkflow = await sanityClient.fetch(
      `*[_type == "workflow" && _id == $workflowId][0]{ comments }`,
      { workflowId }
    )

    if (!currentWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Create new comment
    const newComment = {
      _id: uuidv4(),
      timestamp: new Date().toISOString(),
      author: {
        _type: 'reference',
        _ref: author
      },
      comment,
      type: type || 'general',
      resolved: false
    }

    // Update workflow with new comment
    const result = await sanityClient
      .patch(workflowId)
      .set({
        comments: [...(currentWorkflow.comments || []), newComment]
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Comment added successfully'
    })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}