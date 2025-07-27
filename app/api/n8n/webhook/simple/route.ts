import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

// Simple interface for N8N content payload
interface SimpleN8NPayload {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  sourceUrl?: string;
  automationId?: string;
}

// Simple error logging function
async function logError(error: any, context: string) {
  console.error(`N8N Automation Error (${context}):`, error);
  
  try {
    // Create a simple error log in Sanity
    await enhancedClient.create({
      _type: 'automationErrorLog',
      error: error instanceof Error ? error.message : String(error),
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
  } catch (logError) {
    console.error('Failed to log error to Sanity:', logError);
  }
}

// POST - Handle N8N webhook for automated content ingestion
export async function POST(request: NextRequest) {
  try {
    // Verify webhook security with a simple token
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook not properly configured' },
        { status: 500 }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the incoming payload
    const payload = await request.json() as SimpleN8NPayload;
    
    // Basic validation
    if (!payload.title || !payload.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title and content are required' },
        { status: 400 }
      );
    }

    // Generate a slug from the title
    const slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create a draft blog post in Sanity
    const draftPost = await enhancedClient.create({
      _type: 'post',
      title: payload.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      excerpt: payload.excerpt || payload.content.substring(0, 160).trim() + '...',
      body: [
        {
          _type: 'block',
          _key: `content_${Date.now()}`,
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: `span_${Date.now()}`,
              text: payload.content,
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      status: 'pending_review',
      automationMetadata: {
        automationId: payload.automationId || `auto_${Date.now()}`,
        sourceUrl: payload.sourceUrl,
        createdAt: new Date().toISOString(),
        requiresHumanReview: true
      },
      tags: payload.tags || [],
      _createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Draft blog post created successfully',
        data: {
          draftId: draftPost._id,
          title: draftPost.title,
          slug: draftPost.slug.current,
          status: 'pending_review',
          reviewUrl: `/admin/blogs/review/${draftPost._id}`
        }
      },
      { status: 201 }
    );

  } catch (error) {
    await logError(error, 'webhook_processing');
    
    return NextResponse.json(
      { 
        error: 'Failed to process automated content',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Simple health check endpoint for N8N to verify webhook availability
export async function GET() {
  try {
    // Test Sanity connection
    await enhancedClient.fetch('*[_type == "post"][0]._id');
    
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}