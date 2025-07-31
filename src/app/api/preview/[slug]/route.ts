/**
 * Preview API route for unpublished content
 * Enables preview of draft posts before publication
 */

import { NextRequest, NextResponse } from 'next/server'
import { sanityService } from '@/lib/sanity/service'
import { redirect } from 'next/navigation'

interface PreviewParams {
  slug: string
}

// Enable preview mode for draft content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PreviewParams> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const secret = searchParams.get('secret')
    
    // Validate preview token/secret
    const validToken = process.env.SANITY_PREVIEW_TOKEN || 'preview'
    const validSecret = process.env.SANITY_PREVIEW_SECRET || 'preview-secret'
    
    if (!token && !secret) {
      return NextResponse.json(
        { error: 'Missing preview token or secret' },
        { status: 401 }
      )
    }
    
    if (token !== validToken && secret !== validSecret) {
      return NextResponse.json(
        { error: 'Invalid preview token or secret' },
        { status: 401 }
      )
    }
    
    // Check if the post exists (including drafts)
    const post = await sanityService.getPostBySlug(slug, { 
      includeDrafts: true,
      cache: 'no-store' // Always fetch fresh data for previews
    })
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Enable Next.js preview mode
    const response = NextResponse.redirect(new URL(`/blog/${slug}`, request.url))
    
    // Set preview mode cookies
    response.cookies.set('__prerender_bypass', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 // 1 hour
    })
    
    response.cookies.set('__next_preview_data', JSON.stringify({
      enabled: true,
      slug,
      timestamp: Date.now()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 // 1 hour
    })
    
    return response
    
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Disable preview mode
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Preview mode disabled' })
    
    // Clear preview cookies
    response.cookies.delete('__prerender_bypass')
    response.cookies.delete('__next_preview_data')
    
    return response
    
  } catch (error) {
    console.error('Preview disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable preview mode' },
      { status: 500 }
    )
  }
}