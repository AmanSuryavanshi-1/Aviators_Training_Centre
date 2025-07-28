import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { logAutomationAction } from '@/lib/n8n/audit-logger';
import { sendEditorNotification } from '@/lib/n8n/notifications';
import { executeWithRetry, circuitBreakers } from '@/lib/n8n/retry-handler';
import { updateAutomatedDraft } from '@/lib/n8n/webhook-handler';

// Interface for draft update requests
interface DraftUpdateRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  category?: string;
  seoEnhancement?: {
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  };
  editorId: string;
  editorName: string;
  updateReason?: string;
}

// Interface for draft action requests
interface DraftActionRequest {
  action: 'approve' | 'reject' | 'request_revision' | 'publish' | 'schedule';
  editorId: string;
  editorName: string;
  comments?: string;
  revisionRequests?: Array<{
    section: string;
    comment: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  publishImmediately?: boolean;
  scheduledPublishAt?: string;
}

// GET - Fetch individual automated draft with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const draft = await enhancedClient.fetch(
      `*[_type == "post" && _id == $id][0] {
        _id,
        title,
        slug,
        excerpt,
        body,
        status,
        readingTime,
        featured,
        tags,
        category->{
          _id,
          title,
          slug,
          description
        },
        author->{
          _id,
          name,
          slug,
          role,
          image
        },
        automationMetadata,
        seoEnhancement,
        _createdAt,
        _updatedAt,
        publishedAt
      }`,
      { id }
    );

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (!draft.automationMetadata) {
      return NextResponse.json(
        { success: false, error: 'Not an automated draft' },
        { status: 400 }
      );
    }

    // Get related audit logs for this draft
    const auditLogs = await enhancedClient.fetch(
      `*[_type == "automationAuditLog" && (automationId == $automationId || metadata.draftId == $draftId)] | order(timestamp desc) [0...10]`,
      { 
        automationId: draft.automationMetadata.automationId,
        draftId: id
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        draft,
        auditLogs,
        metadata: {
          canEdit: draft.status === 'draft' || draft.status === 'needs_revision',
          canApprove: draft.status === 'pending_review' || draft.status === 'needs_revision',
          canPublish: draft.status === 'approved',
          isPublished: !!draft.publishedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching automated draft:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch draft',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update automated draft content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData: DraftUpdateRequest = await request.json();

    if (!updateData.editorId || !updateData.editorName) {
      return NextResponse.json(
        { success: false, error: 'Editor information is required' },
        { status: 400 }
      );
    }

    // Get the current draft
    const currentDraft = await enhancedClient.fetch(
      `*[_type == "post" && _id == $id][0]`,
      { id }
    );

    if (!currentDraft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (!currentDraft.automationMetadata) {
      return NextResponse.json(
        { success: false, error: 'Not an automated draft' },
        { status: 400 }
      );
    }

    // Check if draft can be edited
    if (!['draft', 'needs_revision', 'pending_review'].includes(currentDraft.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot edit draft with status: ${currentDraft.status}` 
        },
        { status: 400 }
      );
    }

    const result = await executeWithRetry(
      () => circuitBreakers.sanityOperations.execute(
        async () => {
          // Prepare update payload for the webhook handler
          const webhookUpdatePayload: any = {};
          
          if (updateData.title) webhookUpdatePayload.title = updateData.title;
          if (updateData.excerpt) webhookUpdatePayload.excerpt = updateData.excerpt;
          if (updateData.content) webhookUpdatePayload.content = updateData.content;
          if (updateData.tags) webhookUpdatePayload.suggestedTags = updateData.tags;

          // Update the draft using the webhook handler (for consistency)
          let updatedDraft;
          if (Object.keys(webhookUpdatePayload).length > 0) {
            updatedDraft = await updateAutomatedDraft(id, webhookUpdatePayload);
          } else {
            updatedDraft = currentDraft;
          }

          // Update additional fields directly in Sanity
          const directUpdates: any = {};
          
          if (updateData.category) {
            directUpdates.category = {
              _type: 'reference',
              _ref: updateData.category
            };
          }

          if (updateData.seoEnhancement) {
            directUpdates.seoEnhancement = {
              ...currentDraft.seoEnhancement,
              ...updateData.seoEnhancement
            };
          }

          // Add editor information to automation metadata
          directUpdates.automationMetadata = {
            ...updatedDraft.automationMetadata,
            lastEditedBy: updateData.editorId,
            lastEditedByName: updateData.editorName,
            lastEditedAt: new Date().toISOString(),
            editHistory: [
              ...(updatedDraft.automationMetadata.editHistory || []),
              {
                editorId: updateData.editorId,
                editorName: updateData.editorName,
                timestamp: new Date().toISOString(),
                reason: updateData.updateReason || 'Content update',
                changes: Object.keys(updateData).filter(key => 
                  !['editorId', 'editorName', 'updateReason'].includes(key)
                )
              }
            ].slice(-10) // Keep only last 10 edit history entries
          };

          // Apply direct updates if any
          if (Object.keys(directUpdates).length > 0) {
            updatedDraft = await enhancedClient
              .patch(id)
              .set(directUpdates)
              .commit();
          }

          return updatedDraft;
        },
        { operationName: 'updateAutomatedDraft', automationId: id }
      ),
      {
        maxRetries: 2,
        baseDelay: 1000
      },
      {
        operationName: 'updateAutomatedDraft',
        automationId: currentDraft.automationMetadata.automationId,
        metadata: { 
          editorId: updateData.editorId,
          changesCount: Object.keys(updateData).length
        }
      }
    );

    if (!result.success) {
      throw result.error || new Error('Failed to update draft');
    }

    const updatedDraft = result.result;

    // Log the update
    await logAutomationAction({
      type: 'draft_updated',
      automationId: currentDraft.automationMetadata.automationId,
      status: 'success',
      timestamp: new Date().toISOString(),
      userId: updateData.editorId,
      metadata: {
        draftId: id,
        draftTitle: updatedDraft.title,
        editorName: updateData.editorName,
        changesCount: Object.keys(updateData).length,
        updateReason: updateData.updateReason
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        draft: updatedDraft,
        message: 'Draft updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating automated draft:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update draft',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Perform actions on automated draft (approve, reject, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actionData: DraftActionRequest = await request.json();

    if (!actionData.action || !actionData.editorId || !actionData.editorName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, editorId, editorName' },
        { status: 400 }
      );
    }

    // Get the current draft
    const currentDraft = await enhancedClient.fetch(
      `*[_type == "post" && _id == $id][0]`,
      { id }
    );

    if (!currentDraft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (!currentDraft.automationMetadata) {
      return NextResponse.json(
        { success: false, error: 'Not an automated draft' },
        { status: 400 }
      );
    }

    let result;
    
    switch (actionData.action) {
      case 'approve':
        result = await approveDraft(id, currentDraft, actionData);
        break;
        
      case 'reject':
        result = await rejectDraft(id, currentDraft, actionData);
        break;
        
      case 'request_revision':
        result = await requestRevision(id, currentDraft, actionData);
        break;
        
      case 'publish':
        result = await publishDraft(id, currentDraft, actionData);
        break;
        
      case 'schedule':
        result = await scheduleDraft(id, currentDraft, actionData);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${actionData.action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        draft: result,
        action: actionData.action,
        message: `Draft ${actionData.action} completed successfully`
      }
    });

  } catch (error) {
    console.error('Error performing draft action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform action',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete automated draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const editorId = searchParams.get('editorId');
    const editorName = searchParams.get('editorName');
    const reason = searchParams.get('reason') || 'Draft deleted';

    if (!editorId || !editorName) {
      return NextResponse.json(
        { success: false, error: 'Editor information is required' },
        { status: 400 }
      );
    }

    // Get the draft before deletion
    const draft = await enhancedClient.fetch(
      `*[_type == "post" && _id == $id][0]`,
      { id }
    );

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    if (!draft.automationMetadata) {
      return NextResponse.json(
        { success: false, error: 'Not an automated draft' },
        { status: 400 }
      );
    }

    // Check if draft can be deleted (shouldn't delete published posts)
    if (draft.publishedAt) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete published posts' },
        { status: 400 }
      );
    }

    const result = await executeWithRetry(
      () => circuitBreakers.sanityOperations.execute(
        () => enhancedClient.delete(id),
        { operationName: 'deleteAutomatedDraft', automationId: id }
      ),
      {
        maxRetries: 2,
        baseDelay: 1000
      },
      {
        operationName: 'deleteAutomatedDraft',
        automationId: draft.automationMetadata.automationId,
        metadata: { editorId, reason }
      }
    );

    if (!result.success) {
      throw result.error || new Error('Failed to delete draft');
    }

    // Log the deletion
    await logAutomationAction({
      type: 'draft_updated',
      automationId: draft.automationMetadata.automationId,
      status: 'success',
      timestamp: new Date().toISOString(),
      userId: editorId,
      metadata: {
        draftId: id,
        draftTitle: draft.title,
        editorName,
        action: 'deleted',
        reason
      }
    });

    // Send notification about deletion
    await sendEditorNotification({
      type: 'system_alert',
      title: 'Draft Deleted',
      message: `Automated draft "${draft.title}" has been deleted by ${editorName}. Reason: ${reason}`,
      priority: 'low',
      automationId: draft.automationMetadata.automationId,
      timestamp: new Date().toISOString(),
      recipientRole: 'admin'
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Draft deleted successfully',
        deletedDraft: {
          id: draft._id,
          title: draft.title,
          automationId: draft.automationMetadata.automationId
        }
      }
    });

  } catch (error) {
    console.error('Error deleting automated draft:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete draft',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions for draft actions
async function approveDraft(id: string, draft: any, actionData: DraftActionRequest) {
  const updateData = {
    status: 'approved',
    automationMetadata: {
      ...draft.automationMetadata,
      approvedBy: actionData.editorId,
      approvedByName: actionData.editorName,
      approvedAt: new Date().toISOString(),
      approvalComments: actionData.comments
    }
  };

  if (actionData.publishImmediately) {
    updateData.publishedAt = new Date().toISOString();
  }

  const updatedDraft = await enhancedClient
    .patch(id)
    .set(updateData)
    .commit();

  await logAutomationAction({
    type: 'draft_approved',
    automationId: draft.automationMetadata.automationId,
    status: 'success',
    timestamp: new Date().toISOString(),
    userId: actionData.editorId,
    metadata: {
      draftId: id,
      draftTitle: draft.title,
      editorName: actionData.editorName,
      publishImmediately: actionData.publishImmediately
    }
  });

  return updatedDraft;
}

async function rejectDraft(id: string, draft: any, actionData: DraftActionRequest) {
  const updateData = {
    status: 'rejected',
    automationMetadata: {
      ...draft.automationMetadata,
      rejectedBy: actionData.editorId,
      rejectedByName: actionData.editorName,
      rejectedAt: new Date().toISOString(),
      rejectionComments: actionData.comments
    }
  };

  const updatedDraft = await enhancedClient
    .patch(id)
    .set(updateData)
    .commit();

  await logAutomationAction({
    type: 'draft_rejected',
    automationId: draft.automationMetadata.automationId,
    status: 'success',
    timestamp: new Date().toISOString(),
    userId: actionData.editorId,
    metadata: {
      draftId: id,
      draftTitle: draft.title,
      editorName: actionData.editorName,
      rejectionReason: actionData.comments
    }
  });

  return updatedDraft;
}

async function requestRevision(id: string, draft: any, actionData: DraftActionRequest) {
  const updateData = {
    status: 'needs_revision',
    automationMetadata: {
      ...draft.automationMetadata,
      revisionRequestedBy: actionData.editorId,
      revisionRequestedByName: actionData.editorName,
      revisionRequestedAt: new Date().toISOString(),
      revisionComments: actionData.comments,
      revisionRequests: actionData.revisionRequests || []
    }
  };

  const updatedDraft = await enhancedClient
    .patch(id)
    .set(updateData)
    .commit();

  await logAutomationAction({
    type: 'draft_updated',
    automationId: draft.automationMetadata.automationId,
    status: 'success',
    timestamp: new Date().toISOString(),
    userId: actionData.editorId,
    metadata: {
      draftId: id,
      draftTitle: draft.title,
      editorName: actionData.editorName,
      action: 'revision_requested'
    }
  });

  return updatedDraft;
}

async function publishDraft(id: string, draft: any, actionData: DraftActionRequest) {
  if (draft.status !== 'approved') {
    throw new Error('Only approved drafts can be published');
  }

  const updateData = {
    publishedAt: new Date().toISOString(),
    automationMetadata: {
      ...draft.automationMetadata,
      publishedBy: actionData.editorId,
      publishedByName: actionData.editorName,
      publishedAt: new Date().toISOString()
    }
  };

  const updatedDraft = await enhancedClient
    .patch(id)
    .set(updateData)
    .commit();

  await logAutomationAction({
    type: 'draft_updated',
    automationId: draft.automationMetadata.automationId,
    status: 'success',
    timestamp: new Date().toISOString(),
    userId: actionData.editorId,
    metadata: {
      draftId: id,
      draftTitle: draft.title,
      editorName: actionData.editorName,
      action: 'published'
    }
  });

  return updatedDraft;
}

async function scheduleDraft(id: string, draft: any, actionData: DraftActionRequest) {
  if (draft.status !== 'approved') {
    throw new Error('Only approved drafts can be scheduled');
  }

  if (!actionData.scheduledPublishAt) {
    throw new Error('Scheduled publish date is required');
  }

  const updateData = {
    publishedAt: actionData.scheduledPublishAt,
    automationMetadata: {
      ...draft.automationMetadata,
      scheduledBy: actionData.editorId,
      scheduledByName: actionData.editorName,
      scheduledAt: new Date().toISOString(),
      scheduledPublishAt: actionData.scheduledPublishAt
    }
  };

  const updatedDraft = await enhancedClient
    .patch(id)
    .set(updateData)
    .commit();

  await logAutomationAction({
    type: 'draft_updated',
    automationId: draft.automationMetadata.automationId,
    status: 'success',
    timestamp: new Date().toISOString(),
    userId: actionData.editorId,
    metadata: {
      draftId: id,
      draftTitle: draft.title,
      editorName: actionData.editorName,
      action: 'scheduled',
      scheduledPublishAt: actionData.scheduledPublishAt
    }
  });

  return updatedDraft;
}