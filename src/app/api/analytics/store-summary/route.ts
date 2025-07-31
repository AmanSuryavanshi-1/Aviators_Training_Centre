import { NextRequest, NextResponse } from 'next/server';

// Store daily analytics summaries
export async function POST(request: NextRequest) {
  try {
    const summaryData = await request.json();
    
    console.log('📈 Daily Analytics Summary Stored:', summaryData);

    // In production, store in your database
    // This gives you permanent analytics history beyond Google's limits

    return NextResponse.json({
      success: true,
      message: 'Summary stored successfully'
    });

  } catch (error) {
    console.error('Error storing analytics summary:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to store summary'
    }, { status: 500 });
  }
}