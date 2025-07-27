import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// POST /api/admin/workflows/[id]/status - Change workflow status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()
    const { newStatus, performedBy, notes } = body

    if (!newStatus || !performedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: newStatus, performedBy' 
        },
        { status: 400 }
      )
    }

    // Get current workflow to append to history
    const currentWorkflow = await sanityClient.fetch(
      `*[_type == "workflow" && _id == $workflowId][0]{ workflowHistory }`,
      { workflowId }
    )

    if (!currentWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Create new history entry
    const newHistoryEntry = {
      timestamp: new Date().toISOString(),
      action: getActionFromStatus(newStatus),
      performedBy: {
        _type: 'reference',
        _ref: performedBy
      },
      notes: notes || `Status changed to ${newStatus}`
    }

    // Update workflow with new status and history
    const result = await sanityClient
      .patch(workflowId)
      .set({
        currentStatus: newStatus,
        workflowHistory: [...(currentWorkflow.workflowHistory || []), newHistoryEntry]
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Workflow status changed to ${newStatus}`
    })

  } catch (error) {
    console.error('Error updating workflow status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update workflow status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getActionFromStatus(status: string): string {
  const statusActionMap: Record<string, string> = {
    'draft': 'created',
    'review': 'submitted',
    'approved': 'approved',
    'published': 'published',
    'archived': 'archived'
  }
  
  return statusActionMap[status] || 'updated'
}