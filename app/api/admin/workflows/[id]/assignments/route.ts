import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// POST /api/admin/workflows/[id]/assignments - Update workflow assignments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()
    const { assignedTo, reviewer, performedBy } = body

    // Get current workflow to append to history
    const currentWorkflow = await sanityClient.fetch(
      `*[_type == "workflow" && _id == $workflowId][0]{ workflowHistory, assignedTo, reviewer }`,
      { workflowId }
    )

    if (!currentWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo ? {
        _type: 'reference',
        _ref: assignedTo
      } : null
    }
    
    if (reviewer !== undefined) {
      updateData.reviewer = reviewer ? {
        _type: 'reference',
        _ref: reviewer
      } : null
    }

    // Create history entry for assignment change
    const newHistoryEntry = {
      timestamp: new Date().toISOString(),
      action: 'reassigned',
      performedBy: {
        _type: 'reference',
        _ref: performedBy
      },
      notes: `Assignments updated - Author: ${assignedTo || 'Unassigned'}, Reviewer: ${reviewer || 'Unassigned'}`
    }

    updateData.workflowHistory = [...(currentWorkflow.workflowHistory || []), newHistoryEntry]

    // Update workflow
    const result = await sanityClient
      .patch(workflowId)
      .set(updateData)
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Assignments updated successfully'
    })

  } catch (error) {
    console.error('Error updating assignments:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update assignments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}