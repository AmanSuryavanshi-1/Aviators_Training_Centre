/**
 * Sanity webhook handler for content updates
 * Triggers Vercel rebuilds and cache invalidation when content is published/updated/deleted
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { trackWebhookEvent } from '@/lib/webhooks/monitor'

// Webhook signature verification
function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Trigger Vercel deployment
async function triggerVercelRebuild(reason: string): Promise<boolean> {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  
  if (!deployHookUrl) {
    console.warn('VERCEL_DEPLOY_HOOK_URL not configured')
    return false
  }
  
  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason,
        timestamp: new Date().toISOString(),
      }),
    })
    
    if (response.ok) {
      console.log('Vercel rebuild triggered successfully:', reason)
      return true
    } else {
      console.error('Failed to trigger Vercel rebuild:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('Error triggering Vercel rebuild:', error)
    return false
  }
}

// Clean up analytics data for deleted posts
async function cleanupAnalyticsData(postSlug: string): Promise<void> {
  try {
    // This would typically connect to your analytics database (Firestore)
    // and remove analytics data for the deleted post
    console.log(`Cleaning up analytics data for post: ${postSlug}`)
    
    // Example: Delete from Firestore
    // const db = getFirestore()
    // await db.collection('analytics').where('postSlug', '==', postSlug).get()
    //   .then(snapshot => {
    //     const batch = db.batch()
    //     snapshot.docs.forEach(doc => batch.delete(doc.ref))
    //     return batch.commit()
    //   })
    
  } catch (error) {
    console.error('Error cleaning up analytics data:', error)
  }
}

// Handle different webhook events
async function handleWebhookEvent(event: any): Promise<{ success: boolean; message: string }> {
  const { _type, slug, title, _id } = event
  
  try {
    switch (event.webhook?.event) {
      case 'create':
        if (_type === 'post' && slug?.current) {
          // Revalidate blog pages
          revalidateTag('blog-posts')
          revalidatePath('/blog')
          revalidatePath(`/blog/${slug.current}`)
          
          // Trigger rebuild for new post
          await triggerVercelRebuild(`New blog post created: ${title}`)
          
          return {
            success: true,
            message: `Successfully processed creation of post: ${title}`
          }
        }
        break
        
      case 'update':
        if (_type === 'post' && slug?.current) {
          // Revalidate specific post and blog listing
          revalidateTag('blog-posts')
          revalidateTag(`post-${slug.current}`)
          revalidatePath('/blog')
          revalidatePath(`/blog/${slug.current}`)
          
          // If it's a featured post, revalidate home page
          if (event.featured || event.featuredOnHome) {
            revalidateTag('featured-posts')
            revalidatePath('/')
          }
          
          // Trigger rebuild for updated post
          await triggerVercelRebuild(`Blog post updated: ${title}`)
          
          return {
            success: true,
            message: `Successfully processed update of post: ${title}`
          }
        }
        break
        
      case 'delete':
        if (_type === 'post' && slug?.current) {
          // Revalidate blog pages
          revalidateTag('blog-posts')
          revalidatePath('/blog')
          
          // Clean up analytics data
          await cleanupAnalyticsData(slug.current)
          
          // Trigger rebuild to remove deleted post
          await triggerVercelRebuild(`Blog post deleted: ${title}`)
          
          return {
            success: true,
            message: `Successfully processed deletion of post: ${title}`
          }
        }
        break
        
      case 'publish':
        if (_type === 'post' && slug?.current) {
          // Revalidate all relevant pages
          revalidateTag('blog-posts')
          revalidateTag(`post-${slug.current}`)
          revalidatePath('/blog')
          revalidatePath(`/blog/${slug.current}`)
          
          // If it's featured, revalidate home page
          if (event.featured || event.featuredOnHome) {
            revalidateTag('featured-posts')
            revalidatePath('/')
          }
          
          // Trigger rebuild for published post
          await triggerVercelRebuild(`Blog post published: ${title}`)
          
          return {
            success: true,
            message: `Successfully processed publication of post: ${title}`
          }
        }
        break
        
      case 'unpublish':
        if (_type === 'post' && slug?.current) {
          // Revalidate blog pages
          revalidateTag('blog-posts')
          revalidateTag(`post-${slug.current}`)
          revalidatePath('/blog')
          
          // Trigger rebuild to hide unpublished post
          await triggerVercelRebuild(`Blog post unpublished: ${title}`)
          
          return {
            success: true,
            message: `Successfully processed unpublication of post: ${title}`
          }
        }
        break
        
      default:
        return {
          success: false,
          message: `Unhandled webhook event: ${event.webhook?.event}`
        }
    }
    
    // Handle other document types
    if (_type === 'category' || _type === 'author' || _type === 'tag') {
      // Revalidate blog pages when taxonomy changes
      revalidateTag('blog-posts')
      revalidatePath('/blog')
      
      await triggerVercelRebuild(`${_type} updated: ${title || _id}`)
      
      return {
        success: true,
        message: `Successfully processed ${_type} change`
      }
    }
    
    return {
      success: false,
      message: 'No action taken - unsupported document type or missing required fields'
    }
    
  } catch (error) {
    console.error('Error handling webhook event:', error)
    return {
      success: false,
      message: `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let eventType = 'unknown'
  let eventAction = 'unknown'
  
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    
    // Verify webhook signature
    const signature = request.headers.get('sanity-webhook-signature')
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('SANITY_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }
    
    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      )
    }
    
    // Verify the signature
    if (!verifySignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }
    
    // Parse the webhook payload
    const event = JSON.parse(body)
    eventType = event._type || 'unknown'
    eventAction = event.webhook?.event || 'unknown'
    
    console.log('Received Sanity webhook:', {
      type: event._type,
      event: event.webhook?.event,
      id: event._id,
      slug: event.slug?.current,
      title: event.title
    })
    
    // Handle the webhook event
    const result = await handleWebhookEvent(event)
    
    if (result.success) {
      // Track successful webhook event
      trackWebhookEvent(eventType, eventAction, startTime, true, undefined, event)
      
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      })
    } else {
      // Track failed webhook event
      trackWebhookEvent(eventType, eventAction, startTime, false, result.message, event)
      
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Track failed webhook event
    trackWebhookEvent(
      eventType, 
      eventAction, 
      startTime, 
      false, 
      error instanceof Error ? error.message : 'Internal server error'
    )
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'sanity-webhook-handler',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.SANITY_WEBHOOK_SECRET,
    hasDeployHook: !!process.env.VERCEL_DEPLOY_HOOK_URL
  })
}
