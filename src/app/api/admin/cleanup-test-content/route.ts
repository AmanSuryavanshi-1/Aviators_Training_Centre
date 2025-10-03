import { NextRequest, NextResponse } from 'next/server';
import { getTestContentReport, safeRemoveTestPosts, permanentlyDeleteTestPosts } from '@/lib/blog/test-content-cleanup';

export async function GET() {
  try {
    const report = await getTestContentReport();
    
    return NextResponse.json({
      success: true,
      data: report,
      message: `Found ${report.summary.testPosts} test posts out of ${report.summary.totalPosts} total posts`
    });
  } catch (error) {
    console.error('Error getting test content report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate test content report'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dryRun = true, confirmationCode } = body;
    
    if (action === 'remove') {
      const result = await safeRemoveTestPosts(dryRun);
      
      return NextResponse.json({
        success: result.success,
        data: result,
        message: dryRun 
          ? `Dry run: Would process ${result.removed.length} test posts`
          : `Successfully processed ${result.removed.length} test posts`
      });
    }
    
    if (action === 'delete' && confirmationCode) {
      const result = await permanentlyDeleteTestPosts(confirmationCode);
      
      return NextResponse.json({
        success: result.success,
        data: result,
        message: `Permanently deleted ${result.deleted.length} test posts`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing parameters'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error processing cleanup request:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process cleanup request'
    }, { status: 500 });
  }
}