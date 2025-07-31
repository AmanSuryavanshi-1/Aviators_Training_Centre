import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { logAutomationError } from '@/lib/n8n/simple-error-logger';

// GET - Fetch automated drafts with simple filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query based on filters
    let query = '*[_type == "post" && defined(automationMetadata)]';
    const params: Record<string, any> = {};
    
    if (status) {
      query += ' && status == $status';
      params.status = status;
    }
    
    if (search) {
      query += ' && (title match $search || excerpt match $search)';
      params.search = search;
    }
    
    // Add sorting and limit
    query += ' | order(_createdAt desc)[0...50]';
    
    // Select fields to return
    query += '{_id, title, slug, excerpt, status, _createdAt, _updatedAt, automationMetadata}';
    
    const drafts = await enhancedClient.fetch(query, params);
    
    return NextResponse.json({
      success: true,
      data: { drafts }
    });
  } catch (error) {
    await logAutomationError(
      error instanceof Error ? error : new Error(String(error)),
      'fetch_drafts'
    );
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch automated drafts' 
      },
      { status: 500 }
    );
  }
}

// POST - Approve or reject drafts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, draftId, editorId, editorName, comments } = body;
    
    if (!draftId || !action || !editorId || !editorName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: draftId, action, editorId, and editorName are required' 
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
      'draft_action'
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
