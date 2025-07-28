import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { logAutomationAction } from '@/lib/n8n/audit-logger';
import { sendEditorNotification } from '@/lib/n8n/notifications';
import { executeWithRetry, circuitBreakers } from '@/lib/n8n/retry-handler';

// Interface for automated draft queries
interface AutomatedDraftQuery {
  status?: 'draft' | 'pending_review' | 'needs_revision' | 'approved' | 'rejected';
  automationId?: string;
  requiresHumanReview?: boolean;
  validationScoreMin?: number;
  validationScoreMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

// Interface for draft approval/rejection
interface DraftActionRequest {
  action: 'approve' | 'reject' | 'request_revision';
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

// GET - Fetch automated drafts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: AutomatedDraftQuery = {
      status: searchParams.get('status') as any || undefined,
      automationId: searchParams.get('automationId') || undefined,
      requiresHumanReview: searchParams.get('requiresHumanReview') === 'true' ? true : 
                          searchParams.get('requiresHumanReview') === 'false' ? false : undefined,
      validationScoreMin: searchParams.get('validationScoreMin') ? 
                         parseInt(searchParams.get('validationScoreMin')!) : undefined,
      validationScoreMax: searchParams.get('validationScoreMax') ? 
                         parseInt(searchParams.get('validationScoreMax')!) : undefined,
      createdAfter: searchParams.get('createdAfter') || undefined,
      createdBefore: searchParams.get('createdBefore') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Build Sanity query
    const conditions: string[] = [
      '_type == "post"',
      'defined(automationMetadata)',
      '!defined(publishedAt)' // Only drafts
    ];
    const params: Record<string, any> = {};

    if (query.status) {
      conditions.push('status == $status');
      params.status = query.status;
    }

    if (query.automationId) {
      conditions.push('automationMetadata.automationId == $automationId');
      params.automationId = query.automationId;
    }

    if (query.requiresHumanReview !== undefined) {
      conditions.push('automationMetadata.requiresHumanReview == $requiresHumanReview');
      params.requiresHumanReview = query.requiresHumanReview;
    }

    if (query.validationScoreMin !== undefined) {
      conditions.push('automationMetadata.validationScore >= $validationScoreMin');
      params.validationScoreMin = query.validationScoreMin;
    }

    if (query.validationScoreMax !== undefined) {
      conditions.push('automationMetadata.validationScore <= $validationScoreMax');
      params.validationScoreMax = query.validationScoreMax;
    }

    if (query.createdAfter) {
      conditions.push('automationMetadata.createdAt >= $createdAfter');
      params.createdAfter = query.createdAfter;
    }

    if (query.createdBefore) {
      conditions.push('automationMetadata.createdAt <= $createdBefore');
      params.createdBefore = query.createdBefore;
    }

    const sanityQuery = `
      *[${conditions.join(' && ')}] | order(automationMetadata.createdAt desc) [${query.offset}...${query.offset! + query.limit!}] {
        _id,
        title,
        slug,
        excerpt,
        status,
        readingTime,
        category->{title, slug},
        author->{name, slug},
        tags,
        automationMetadata,
        seoEnhancement,
        _createdAt,
        _updatedAt
      }
    `;

    const drafts = await enhancedClient.fetch(sanityQuery, params);

    // Get total count for pagination
    const countQuery = `count(*[${conditions.join(' && ')}])`;
    const totalCount = await enhancedClient.fetch<number>(countQuery, params);

    return NextResponse.json({
      success: true,
      data: {
        drafts,
        pagination: {
          total: totalCount,
          limit: query.limit,
          offset: query.offset,
          hasMore: (query.offset! + query.limit!) < totalCount
        },
        query
      }
    });

  } catch (error) {
    console.error('Error fetching automated drafts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch automated drafts',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Bulk actions on automated drafts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, draftIds, editorInfo } = body;

    if (!action || !draftIds || !Array.isArray(draftIds) || draftIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: action, draftIds' 
        },
        { status: 400 }
      );
    }

    if (!editorInfo || !editorInfo.editorId || !editorInfo.editorName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing editor information' 
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const draftId of draftIds) {
      try {
        let result;
        
        switch (action) {
          case 'approve_all':
            result = await approveDraft(draftId, {
              action: 'approve',
              editorId: editorInfo.editorId,
              editorName: editorInfo.editorName,
              comments: 'Bulk approval',
              publishImmediately: body.publishImmediately || false
            });
            break;
            
          case 'reject_all':
            result = await rejectDraft(draftId, {
              action: 'reject',
              editorId: editorInfo.editorId,
              editorName: editorInfo.editorName,
              comments: body.rejectionReason || 'Bulk rejection'
            });
            break;
            
          case 'mark_for_review':
            result = await requestRevision(draftId, {
              action: 'request_revision',
              editorId: editorInfo.editorId,
              editorName: editorInfo.editorName,
              comments: 'Marked for detailed review',
              revisionRequests: body.revisionRequests || []
            });
            break;
            
          default:
            throw new Error(`Unknown bulk action: ${action}`);
        }
        
        results.push({ draftId, success: true, result });
        
      } catch (error) {
        errors.push({ 
          draftId, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: {
        processed: results.length,
        errors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process bulk action',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to approve a draft
async function approveDraft(draftId: string, actionData: DraftActionRequest) {
  const result = await executeWithRetry(
    () => circuitBreakers.sanityOperations.execute(
      async () => {
        // Get the draft
        const draft = await enhancedClient.fetch(
          `*[_type == "post" && _id == $draftId][0]`,
          { draftId }
        );

        if (!draft) {
          throw new Error('Draft not found');
        }

        if (!draft.automationMetadata) {
          throw new Error('Not an automated draft');
        }

        // Update the draft status and add approval metadata
        const updateData = {
          status: 'approved',
          ...(actionData.publishImmediately && {
            publishedAt: new Date().toISOString()
          }),
          ...(actionData.scheduledPublishAt && {
            publishedAt: actionData.scheduledPublishAt
          }),
          automationMetadata: {
            ...draft.automationMetadata,
            approvedBy: actionData.editorId,
            approvedByName: actionData.editorName,
            approvedAt: new Date().toISOString(),
            approvalComments: actionData.comments,
            publishImmediately: actionData.publishImmediately || false
          }
        };

        const updatedDraft = await enhancedClient
          .patch(draftId)
          .set(updateData)
          .commit();

        // Log the approval
        await logAutomationAction({
          type: 'draft_approved',
          automationId: draft.automationMetadata.automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          userId: actionData.editorId,
          metadata: {
            draftId,
            draftTitle: draft.title,
            editorName: actionData.editorName,
            publishImmediately: actionData.publishImmediately,
            comments: actionData.comments
          }
        });

        // Send notification about approval
        await sendEditorNotification({
          type: 'system_alert',
          title: 'Draft Approved',
          message: `Blog post "${draft.title}" has been approved by ${actionData.editorName}${actionData.publishImmediately ? ' and published immediately' : ''}.`,
          priority: 'low',
          automationId: draft.automationMetadata.automationId,
          timestamp: new Date().toISOString(),
          recipientRole: 'all'
        });

        return updatedDraft;
      },
      { operationName: 'approveDraft', automationId: draftId }
    ),
    {
      maxRetries: 2,
      baseDelay: 1000
    },
    {
      operationName: 'approveDraft',
      automationId: draftId,
      metadata: { editorId: actionData.editorId }
    }
  );

  if (!result.success) {
    throw result.error || new Error('Failed to approve draft');
  }

  return result.result;
}

// Helper function to reject a draft
async function rejectDraft(draftId: string, actionData: DraftActionRequest) {
  const result = await executeWithRetry(
    () => circuitBreakers.sanityOperations.execute(
      async () => {
        // Get the draft
        const draft = await enhancedClient.fetch(
          `*[_type == "post" && _id == $draftId][0]`,
          { draftId }
        );

        if (!draft) {
          throw new Error('Draft not found');
        }

        if (!draft.automationMetadata) {
          throw new Error('Not an automated draft');
        }

        // Update the draft status and add rejection metadata
        const updateData = {
          status: 'rejected',
          automationMetadata: {
            ...draft.automationMetadata,
            rejectedBy: actionData.editorId,
            rejectedByName: actionData.editorName,
            rejectedAt: new Date().toISOString(),
            rejectionComments: actionData.comments,
            rejectionReason: actionData.comments
          }
        };

        const updatedDraft = await enhancedClient
          .patch(draftId)
          .set(updateData)
          .commit();

        // Log the rejection
        await logAutomationAction({
          type: 'draft_rejected',
          automationId: draft.automationMetadata.automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          userId: actionData.editorId,
          metadata: {
            draftId,
            draftTitle: draft.title,
            editorName: actionData.editorName,
            rejectionReason: actionData.comments
          }
        });

        // Send notification about rejection
        await sendEditorNotification({
          type: 'system_alert',
          title: 'Draft Rejected',
          message: `Blog post "${draft.title}" has been rejected by ${actionData.editorName}. Reason: ${actionData.comments}`,
          priority: 'medium',
          automationId: draft.automationMetadata.automationId,
          timestamp: new Date().toISOString(),
          recipientRole: 'admin'
        });

        return updatedDraft;
      },
      { operationName: 'rejectDraft', automationId: draftId }
    ),
    {
      maxRetries: 2,
      baseDelay: 1000
    },
    {
      operationName: 'rejectDraft',
      automationId: draftId,
      metadata: { editorId: actionData.editorId }
    }
  );

  if (!result.success) {
    throw result.error || new Error('Failed to reject draft');
  }

  return result.result;
}

// Helper function to request revision
async function requestRevision(draftId: string, actionData: DraftActionRequest) {
  const result = await executeWithRetry(
    () => circuitBreakers.sanityOperations.execute(
      async () => {
        // Get the draft
        const draft = await enhancedClient.fetch(
          `*[_type == "post" && _id == $draftId][0]`,
          { draftId }
        );

        if (!draft) {
          throw new Error('Draft not found');
        }

        if (!draft.automationMetadata) {
          throw new Error('Not an automated draft');
        }

        // Update the draft status and add revision request metadata
        const updateData = {
          status: 'needs_revision',
          automationMetadata: {
            ...draft.automationMetadata,
            revisionRequestedBy: actionData.editorId,
            revisionRequestedByName: actionData.editorName,
            revisionRequestedAt: new Date().toISOString(),
            revisionComments: actionData.comments,
            revisionRequests: actionData.revisionRequests || [],
            requiresHumanReview: true
          }
        };

        const updatedDraft = await enhancedClient
          .patch(draftId)
          .set(updateData)
          .commit();

        // Log the revision request
        await logAutomationAction({
          type: 'draft_updated',
          automationId: draft.automationMetadata.automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          userId: actionData.editorId,
          metadata: {
            draftId,
            draftTitle: draft.title,
            editorName: actionData.editorName,
            action: 'revision_requested',
            revisionRequests: actionData.revisionRequests?.length || 0
          }
        });

        // Send notification about revision request
        await sendEditorNotification({
          type: 'draft_needs_review',
          title: 'Revision Requested',
          message: `Blog post "${draft.title}" requires revision. ${actionData.revisionRequests?.length || 0} specific items need attention.`,
          priority: 'medium',
          draftId,
          automationId: draft.automationMetadata.automationId,
          timestamp: new Date().toISOString(),
          recipientRole: 'editor'
        });

        return updatedDraft;
      },
      { operationName: 'requestRevision', automationId: draftId }
    ),
    {
      maxRetries: 2,
      baseDelay: 1000
    },
    {
      operationName: 'requestRevision',
      automationId: draftId,
      metadata: { editorId: actionData.editorId }
    }
  );

  if (!result.success) {
    throw result.error || new Error('Failed to request revision');
  }

  return result.result;
}