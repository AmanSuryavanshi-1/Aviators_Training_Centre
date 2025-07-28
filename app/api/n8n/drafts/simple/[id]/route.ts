import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { logAutomationError } from '@/lib/n8n/simple-error-logger';

// GET - Fetch a specific automated draft by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let draftId: string = 'unknown';
  
  try {
    const { id } = await params;
    draftId = id;
    
    // Fetch the draft with all details
    const draft = await enhancedClient.fetch(
      '*[_type == "post" && _id == $draftId][0]{_id, title, slug, excerpt, body, status, _createdAt, _updatedAt, automationMetadata, tags, category->, author->}',
      { draftId }
    );
    
    if (!draft) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Draft not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { draft }
    });
  } catch (error) {
    await logAutomationError(
      error instanceof Error ? error : new Error(String(error)),
      'fetch_draft_details',
      { draftId }
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch draft details' 
      },
      { status: 500 }
    );
  }
}

// PUT - Approve or reject a specific draft
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let draftId: string = 'unknown';
  
  try {
    const { id } = await params;
    draftId = id;
    const body = await request.json();
    const { action, editorId, editorName, comments } = body;
    
    if (!action || !editorId || !editorName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: action, editorId, and editorName are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid action. Must be either "approve" or "reject"' 
        },
        { status: 400 }
      );
    }
    
    // Get the draft
    const draft = await enhancedClient.fetch('*[_type == "post" && _id == $draftId][0]', { draftId });
    
    if (!draft) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Draft not found' 
        },
        { status: 404 }
      );
    }
    
    // Update the draft based on action
    if (action === 'approve') {
      await enhancedClient
        .patch(draftId)
        .set({
          status: 'approved',
          'automationMetadata.approvedBy': editorId,
          'automationMetadata.approvedByName': editorName,
          'automationMetadata.approvedAt': new Date().toISOString(),
          'automationMetadata.approvalComments': comments || ''
        })
        .commit();
    } else {
      await enhancedClient
        .patch(draftId)
        .set({
          status: 'rejected',
          'automationMetadata.rejectedBy': editorId,
          'automationMetadata.rejectedByName': editorName,
          'automationMetadata.rejectedAt': new Date().toISOString(),
          'automationMetadata.rejectionReason': comments || ''
        })
        .commit();
    }
    
    return NextResponse.json({
      success: true,
      message: `Draft ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    await logAutomationError(
      error instanceof Error ? error : new Error(String(error)),
      'draft_action',
      { draftId }
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process draft action' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a draft
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const draftId = id;
    const { searchParams } = new URL(request.url);
    const editorId = searchParams.get('editorId');
    const editorName = searchParams.get('editorName');
    const reason = searchParams.get('reason');
    
    if (!editorId || !editorName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameters: editorId and editorName are required' 
        },
        { status: 400 }
      );
    }
    
    // Log the deletion for audit purposes
    await enhancedClient.create({
      _type: 'automationAuditLog',
      action: 'delete_draft',
      draftId,
      editorId,
      editorName,
      reason: reason || 'Manual deletion',
      timestamp: new Date().toISOString()
    });
    
    // Delete the draft
    await enhancedClient.delete(draftId);
    
    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    const { id } = await params;
    await logAutomationError(
      error instanceof Error ? error : new Error(String(error)),
      'delete_draft',
      { draftId: id }
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete draft' 
      },
      { status: 500 }
    );
  }
}
