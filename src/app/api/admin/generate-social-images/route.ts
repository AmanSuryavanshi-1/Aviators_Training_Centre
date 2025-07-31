import { NextRequest, NextResponse } from 'next/server'
import { 
  generateMissingSocialImages, 
  regenerateSocialImage, 
  cleanupOrphanedSocialImages 
} from '@/lib/sanity/socialImageService'

// Admin authentication check (implement based on your auth system)
function isAuthorized(request: NextRequest): boolean {
  // Add your admin authentication logic here
  const authHeader = request.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY
  
  if (!adminKey) {
    console.warn('ADMIN_API_KEY not configured')
    return false
  }
  
  return authHeader === `Bearer ${adminKey}`
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, postId, template } = body

    switch (action) {
      case 'generate-missing':
        const stats = await generateMissingSocialImages()
        return NextResponse.json({
          success: true,
          message: `Generated ${stats.generated} social images`,
          stats,
        })

      case 'regenerate-single':
        if (!postId) {
          return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }
        
        const success = await regenerateSocialImage(postId, template)
        return NextResponse.json({
          success,
          message: success 
            ? 'Social image regenerated successfully' 
            : 'Failed to regenerate social image',
        })

      case 'cleanup-orphaned':
        const deletedCount = await cleanupOrphanedSocialImages()
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedCount} orphaned social images`,
          deletedCount,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in social image generation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      // Return status of social image generation
      return NextResponse.json({
        success: true,
        message: 'Social image generation service is running',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in social image generation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
