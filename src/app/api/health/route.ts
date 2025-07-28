import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      message: 'Blog system is operational',
      timestamp: new Date().toISOString(),
      service: 'simple-blog-service'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Blog service error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}