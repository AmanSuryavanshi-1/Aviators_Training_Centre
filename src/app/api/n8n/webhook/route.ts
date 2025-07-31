import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';
import { validateN8NPayload, sanitizeContent, createDraftFromAutomation } from '@/lib/n8n/webhook-handler';
import { logAutomationAction } from '@/lib/n8n/audit-logger';
import { sendEditorNotification } from '@/lib/n8n/notifications';
import { executeWithRetry, circuitBreakers, fallbackHandler } from '@/lib/n8n/retry-handler';

// POST - Handle N8N webhook for automated content ingestion
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let automationId: string | undefined;
  
  try {
    // Verify webhook security
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('N8N_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not properly configured' },
        { status: 500 }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      await logAutomationAction({
        type: 'webhook_unauthorized',
        status: 'failed',
        error: 'Invalid or missing authorization header',
        timestamp: new Date().toISOString(),
        metadata: {
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate the incoming payload
    const payload = await request.json();
    automationId = payload.automationId || `auto_${Date.now()}`;
    
    // Log incoming webhook
    await logAutomationAction({
      type: 'webhook_received',
      automationId,
      status: 'processing',
      timestamp: new Date().toISOString(),
      metadata: {
        payloadSize: JSON.stringify(payload).length,
        contentLength: payload.content?.length || 0
      }
    });

    // Validate the payload structure
    const validation = validateN8NPayload(payload);
    if (!validation.isValid) {
      await logAutomationAction({
        type: 'content_validation',
        automationId,
        status: 'failed',
        error: 'Payload validation failed',
        timestamp: new Date().toISOString(),
        metadata: {
          validationErrors: validation.errors,
          score: validation.score
        }
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid payload structure',
          details: validation.errors,
          score: validation.score
        },
        { status: 400 }
      );
    }

    // Sanitize and validate content
    const sanitizedContent = sanitizeContent(payload);
    if (!sanitizedContent.isValid) {
      await logAutomationAction({
        type: 'content_sanitization',
        automationId,
        status: 'failed',
        error: 'Content sanitization failed',
        timestamp: new Date().toISOString(),
        metadata: {
          sanitizationIssues: sanitizedContent.issues
        }
      });
      
      return NextResponse.json(
        { 
          error: 'Content validation failed',
          details: sanitizedContent.issues
        },
        { status: 400 }
      );
    }

    // Create draft blog post in Sanity with retry logic and circuit breaker
    const draftCreationResult = await executeWithRetry(
      () => circuitBreakers.sanityOperations.execute(
        () => createDraftFromAutomation(sanitizedContent.content, automationId),
        { operationName: 'createDraftFromAutomation', automationId }
      ),
      {
        maxRetries: 3,
        baseDelay: 2000,
        retryableErrors: ['SANITY_API_ERROR', 'NETWORK_ERROR', 'ECONNRESET']
      },
      {
        operationName: 'createDraftFromAutomation',
        automationId,
        metadata: { contentLength: sanitizedContent.content.content.length }
      }
    );

    if (!draftCreationResult.success) {
      // Try fallback mechanism
      const fallbackResult = await fallbackHandler.executeWithFallback(
        () => { throw draftCreationResult.error!; },
        'createDraftPost',
        { automationId, metadata: { originalError: draftCreationResult.error?.message } }
      );
      
      return NextResponse.json(
        {
          success: false,
          message: 'Draft creation failed, content stored for manual processing',
          automationId,
          fallbackUsed: true,
          retryAttempts: draftCreationResult.attempts
        },
        { status: 202 }
      );
    }

    const draftPost = draftCreationResult.result!;
    
    // Log successful draft creation
    await logAutomationAction({
      type: 'draft_created',
      automationId,
      status: 'success',
      timestamp: new Date().toISOString(),
      metadata: {
        draftId: draftPost._id,
        title: draftPost.title,
        processingTime: Date.now() - startTime,
        retryAttempts: draftCreationResult.attempts,
        totalRetryDuration: draftCreationResult.totalDuration
      }
    });

    // Send notification to editors with retry logic
    const notificationResult = await executeWithRetry(
      () => circuitBreakers.notificationSending.execute(
        () => sendEditorNotification({
          type: 'new_automated_draft',
          draftId: draftPost._id,
          title: draftPost.title,
          automationId,
          sourceUrl: payload.sourceUrl,
          timestamp: new Date().toISOString()
        }),
        { operationName: 'sendEditorNotification', automationId }
      ),
      {
        maxRetries: 2,
        baseDelay: 1000,
        retryableErrors: ['NETWORK_ERROR', 'TEMPORARY_ERROR']
      },
      {
        operationName: 'sendEditorNotification',
        automationId,
        metadata: { draftId: draftPost._id, notificationType: 'new_automated_draft' }
      }
    );

    if (notificationResult.success) {
      await logAutomationAction({
        type: 'editor_notification',
        automationId,
        status: 'success',
        timestamp: new Date().toISOString(),
        metadata: {
          draftId: draftPost._id,
          notificationType: 'new_automated_draft',
          retryAttempts: notificationResult.attempts
        }
      });
    } else {
      // Log notification failure but don't fail the entire request
      await logAutomationAction({
        type: 'editor_notification',
        automationId,
        status: 'failed',
        error: notificationResult.error?.message || 'Unknown notification error',
        timestamp: new Date().toISOString(),
        metadata: {
          draftId: draftPost._id,
          retryAttempts: notificationResult.attempts,
          retryLog: notificationResult.retryLog
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Draft blog post created successfully',
        data: {
          draftId: draftPost._id,
          title: draftPost.title,
          slug: draftPost.slug.current,
          automationId,
          status: 'pending_review',
          reviewUrl: `/admin/blogs/review/${draftPost._id}`,
          processingTime: Date.now() - startTime
        }
      },
      { status: 201 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Log the error
    await logAutomationAction({
      type: 'webhook_error',
      automationId,
      status: 'failed',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Date.now() - startTime,
        stack: error instanceof Error ? error.stack : undefined
      }
    });

    console.error('N8N webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process automated content',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        automationId
      },
      { status: 500 }
    );
  }
}

// GET - Health check endpoint for N8N to verify webhook availability
export async function GET() {
  try {
    // Test Sanity connection
    await enhancedClient.fetch('*[_type == "post"][0]._id');
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          sanity: 'connected',
          webhook: 'active'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          sanity: 'disconnected',
          webhook: 'active'
        }
      },
      { status: 503 }
    );
  }
}
