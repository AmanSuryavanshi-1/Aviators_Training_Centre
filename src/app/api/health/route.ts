import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        nextjs: 'healthy',
        sanity: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'configured' : 'not-configured',
        firebase: (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) ? 'configured' : 'not-configured',
        email: process.env.RESEND_API_KEY ? 'configured' : 'not-configured'
      },
      version: '1.0.0',
      uptime: process.uptime()
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
