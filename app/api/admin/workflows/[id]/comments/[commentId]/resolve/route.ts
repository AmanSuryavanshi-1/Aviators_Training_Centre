import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// POST /api/admin/workflows/[id]/comments/[commentId]/resolve - Resolve comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: workflowId, commentId } = await params

    // Get current workflow
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

    // Find and update the comment
    const updatedComments = currentWorkflow.comments.map((comment: any) => {
      if (comment._id === commentId) {
        return { ...comment, resolved: true }
      }
      return comment
    })

    // Update workflow with resolved comment
    const result = await sanityClient
      .patch(workflowId)
      .set({
        comments: updatedComments
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Comment resolved successfully'
    })

  } catch (error) {
    console.error('Error resolving comment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to resolve comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}