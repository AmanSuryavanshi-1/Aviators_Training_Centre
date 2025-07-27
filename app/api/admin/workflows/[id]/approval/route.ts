import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'
import { ApprovalWorkflowService, type ApprovalDecision } from '@/lib/workflows/approval-system'

// GET /api/admin/workflows/[id]/approval - Get approval workflow for content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params

    const approvalWorkflowQuery = `
      *[_type == "approvalWorkflow" && workflowId == $workflowId][0] {
        _id,
        contentRef->{
          _id,
          title,
          _type
        },
        workflowId,
        currentStage,
        status,
        stages[]{
          stageId,
          name,
          description,
          order,
          status,
          requiredApprovals,
          approverLevels,
          specificApprovers[]->{
            _id,
            name,
            email,
            authorLevel
          },
          startedAt,
          completedAt,
          dueDate,
          canSkip,
          isParallel,
          escalationHours,
          escalateTo
        },
        decisions[]{
          decisionId,
          stageId,
          approver->{
            _id,
            name,
            email,
            authorLevel
          },
          decision,
          timestamp,
          notes,
          conditions,
          priority,
          relatedFields
        },
        totalApprovals,
        totalRejections,
        createdAt,
        completedAt,
        escalations,
        metadata,
        notifications
      }
    `

    const approvalWorkflow = await sanityClient.fetch(approvalWorkflowQuery, { workflowId })

    if (!approvalWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Approval workflow not found' },
        { status: 404 }
      )
    }

    // Check for escalations
    const escalations = ApprovalWorkflowService.checkEscalation({
      id: approvalWorkflow.workflowId,
      contentId: approvalWorkflow.contentRef._id,
      contentType: approvalWorkflow.contentRef._type,
      currentStage: approvalWorkflow.currentStage,
      stages: approvalWorkflow.stages.map((stage: any) => ({
        id: stage.stageId,
        name: stage.name,
        description: stage.description,
        order: stage.order,
        rule: {
          id: stage.stageId,
          name: stage.name,
          description: stage.description,
          conditions: {},
          approvers: {
            required: stage.requiredApprovals,
            authorLevels: stage.approverLevels
          },
          escalationRules: stage.escalationHours ? {
            timeoutHours: stage.escalationHours,
            escalateTo: stage.escalateTo
          } : undefined
        },
        status: stage.status,
        startedAt: stage.startedAt,
        completedAt: stage.completedAt,
        approvals: approvalWorkflow.decisions.filter((d: any) => 
          d.stageId === stage.stageId && d.decision === 'approve'
        ),
        rejections: approvalWorkflow.decisions.filter((d: any) => 
          d.stageId === stage.stageId && d.decision !== 'approve'
        ),
        canSkip: stage.canSkip,
        isParallel: stage.isParallel
      })),
      status: approvalWorkflow.status,
      createdAt: approvalWorkflow.createdAt,
      completedAt: approvalWorkflow.completedAt,
      totalApprovals: approvalWorkflow.totalApprovals,
      totalRejections: approvalWorkflow.totalRejections
    })

    return NextResponse.json({
      success: true,
      data: {
        ...approvalWorkflow,
        pendingEscalations: escalations.filter(e => e.shouldEscalate)
      }
    })

  } catch (error) {
    console.error('Error fetching approval workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch approval workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/workflows/[id]/approval - Create or update approval workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params
    const body = await request.json()
    const { 
      contentType, 
      authorId, 
      authorLevel, 
      contentArea, 
      wordCount, 
      hasImages, 
      hasSEOData,
      customRules = []
    } = body

    // Get applicable approval rules
    const applicableRules = ApprovalWorkflowService.getApplicableRules({
      authorId,
      authorLevel,
      contentType,
      contentArea,
      wordCount,
      hasImages,
      hasSEOData
    }, customRules)

    // Check if auto-approval is possible
    const canAutoApprove = applicableRules.some(rule => 
      ApprovalWorkflowService.canAutoApprove({
        authorId,
        authorLevel,
        previousApprovals: body.previousApprovals,
        contentScore: body.contentScore
      }, rule)
    )

    if (canAutoApprove) {
      // Auto-approve the content
      return NextResponse.json({
        success: true,
        data: {
          autoApproved: true,
          message: 'Content automatically approved based on author credentials and history'
        }
      })
    }

    // Create approval workflow
    const workflow = ApprovalWorkflowService.createApprovalWorkflow(
      contentId,
      contentType,
      applicableRules
    )

    // Convert to Sanity document format
    const approvalWorkflowDoc = {
      _type: 'approvalWorkflow',
      contentRef: {
        _type: 'reference',
        _ref: contentId
      },
      workflowId: workflow.id,
      currentStage: workflow.currentStage,
      status: workflow.status,
      stages: workflow.stages.map(stage => ({
        stageId: stage.id,
        name: stage.name,
        description: stage.description,
        order: stage.order,
        status: stage.status,
        requiredApprovals: stage.rule.approvers.required,
        approverLevels: stage.rule.approvers.authorLevels,
        specificApprovers: stage.rule.approvers.specificAuthors?.map(id => ({
          _type: 'reference',
          _ref: id
        })) || [],
        startedAt: stage.startedAt,
        completedAt: stage.completedAt,
        canSkip: stage.canSkip,
        isParallel: stage.isParallel,
        escalationHours: stage.rule.escalationRules?.timeoutHours,
        escalateTo: stage.rule.escalationRules?.escalateTo || []
      })),
      decisions: [],
      totalApprovals: workflow.totalApprovals,
      totalRejections: workflow.totalRejections,
      createdAt: workflow.createdAt,
      metadata: {
        contentType,
        contentArea,
        wordCount,
        hasImages,
        hasSEOData,
        originalAuthor: {
          _type: 'reference',
          _ref: authorId
        },
        requestedBy: {
          _type: 'reference',
          _ref: body.requestedBy || authorId
        },
        priority: body.priority || 'medium'
      },
      notifications: {
        notifyOnDecision: true,
        notifyOnEscalation: true,
        reminderFrequency: 'every_2_days'
      }
    }

    const result = await sanityClient.create(approvalWorkflowDoc)

    return NextResponse.json({
      success: true,
      data: {
        workflowId: workflow.id,
        approvalWorkflow: result,
        stages: workflow.stages.length,
        message: 'Approval workflow created successfully'
      }
    })

  } catch (error) {
    console.error('Error creating approval workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create approval workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/workflows/[id]/approval - Submit approval decision
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()
    const { 
      stageId, 
      approverId, 
      decision, 
      notes, 
      conditions = [], 
      priority = 'medium',
      relatedFields = []
    } = body

    if (!stageId || !approverId || !decision) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: stageId, approverId, decision' 
        },
        { status: 400 }
      )
    }

    // Get current approval workflow
    const currentWorkflow = await sanityClient.fetch(
      `*[_type == "approvalWorkflow" && workflowId == $workflowId][0]`,
      { workflowId }
    )

    if (!currentWorkflow) {
      return NextResponse.json(
        { success: false, error: 'Approval workflow not found' },
        { status: 404 }
      )
    }

    // Get approver details
    const approver = await sanityClient.fetch(
      `*[_type == "author" && _id == $approverId][0]{ _id, name, email, authorLevel }`,
      { approverId }
    )

    if (!approver) {
      return NextResponse.json(
        { success: false, error: 'Approver not found' },
        { status: 404 }
      )
    }

    // Create approval decision
    const approvalDecision: ApprovalDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      approverId,
      approverName: approver.name,
      decision: decision as 'approve' | 'reject' | 'request_changes',
      timestamp: new Date().toISOString(),
      notes,
      conditions,
      priority: priority as 'high' | 'medium' | 'low'
    }

    // Convert current workflow to the format expected by ApprovalWorkflowService
    const workflowForService = {
      id: currentWorkflow.workflowId,
      contentId: currentWorkflow.contentRef._id,
      contentType: currentWorkflow.contentRef._type,
      currentStage: currentWorkflow.currentStage,
      stages: currentWorkflow.stages.map((stage: any) => ({
        id: stage.stageId,
        name: stage.name,
        description: stage.description,
        order: stage.order,
        rule: {
          id: stage.stageId,
          name: stage.name,
          description: stage.description,
          conditions: {},
          approvers: {
            required: stage.requiredApprovals,
            authorLevels: stage.approverLevels
          }
        },
        status: stage.status,
        startedAt: stage.startedAt,
        completedAt: stage.completedAt,
        approvals: currentWorkflow.decisions?.filter((d: any) => 
          d.stageId === stage.stageId && d.decision === 'approve'
        ) || [],
        rejections: currentWorkflow.decisions?.filter((d: any) => 
          d.stageId === stage.stageId && d.decision !== 'approve'
        ) || [],
        canSkip: stage.canSkip,
        isParallel: stage.isParallel
      })),
      status: currentWorkflow.status,
      createdAt: currentWorkflow.createdAt,
      completedAt: currentWorkflow.completedAt,
      totalApprovals: currentWorkflow.totalApprovals,
      totalRejections: currentWorkflow.totalRejections
    }

    // Process the approval decision
    const result = ApprovalWorkflowService.processApprovalDecision(
      workflowForService,
      stageId,
      approvalDecision
    )

    // Create new decision document for Sanity
    const newDecision = {
      decisionId: approvalDecision.id,
      stageId,
      approver: {
        _type: 'reference',
        _ref: approverId
      },
      decision,
      timestamp: approvalDecision.timestamp,
      notes,
      conditions,
      priority,
      relatedFields
    }

    // Update the approval workflow in Sanity
    const updatedWorkflow = await sanityClient
      .patch(currentWorkflow._id)
      .set({
        currentStage: result.updatedWorkflow.currentStage,
        status: result.updatedWorkflow.status,
        stages: result.updatedWorkflow.stages.map(stage => ({
          stageId: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          status: stage.status,
          requiredApprovals: stage.rule.approvers.required,
          approverLevels: stage.rule.approvers.authorLevels,
          startedAt: stage.startedAt,
          completedAt: stage.completedAt,
          canSkip: stage.canSkip,
          isParallel: stage.isParallel
        })),
        decisions: [...(currentWorkflow.decisions || []), newDecision],
        totalApprovals: result.updatedWorkflow.totalApprovals,
        totalRejections: result.updatedWorkflow.totalRejections,
        completedAt: result.updatedWorkflow.completedAt
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: {
        decision: approvalDecision,
        workflow: updatedWorkflow,
        stageCompleted: result.stageCompleted,
        workflowCompleted: result.workflowCompleted,
        nextActions: result.nextActions
      },
      message: `Decision "${decision}" recorded successfully`
    })

  } catch (error) {
    console.error('Error processing approval decision:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process approval decision',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/workflows/[id]/approval - Cancel approval workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params
    const body = await request.json()
    const { reason, cancelledBy } = body

    // Update workflow status to cancelled
    const result = await sanityClient
      .patch(workflowId)
      .set({
        status: 'cancelled',
        completedAt: new Date().toISOString(),
        'metadata.cancellationReason': reason,
        'metadata.cancelledBy': {
          _type: 'reference',
          _ref: cancelledBy
        }
      })
      .commit()

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Approval workflow cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling approval workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel approval workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}