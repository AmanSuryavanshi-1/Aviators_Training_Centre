import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting test document cleanup...');
    
    // Find all test documents
    const testDocs = await enhancedClient.fetch(`
      *[_type == "post" && (
        title match "*Test*" || 
        title match "*Connection Test*" || 
        title match "*Permission Test*" ||
        title match "*Diagnostic*" ||
        title match "*Recovery*" ||
        isTestPost == true || 
        isDiagnosticTest == true ||
        isPermissionTest == true ||
        isRecoveryTest == true ||
        isRecoveryValidationTest == true
      )] {
        _id,
        title,
        _createdAt
      }
    `) as Array<{
      _id: string;
      title?: string;
      _createdAt: string;
    }>;

    console.log(`📋 Found ${testDocs.length} test documents to clean up`);
    
    if (testDocs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No test documents found to clean up',
        deletedCount: 0,
        foundCount: 0
      });
    }

    let deletedCount = 0;
    const deletionResults = [];

    for (const doc of testDocs) {
      try {
        await enhancedClient.delete(doc._id, { validateConnection: false });
        deletedCount++;
        deletionResults.push({
          id: doc._id,
          title: doc.title,
          status: 'deleted'
        });
        console.log(`✅ Deleted test document: ${doc.title || doc._id}`);
      } catch (deleteError) {
        deletionResults.push({
          id: doc._id,
          title: doc.title,
          status: 'failed',
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        });
        console.error(`❌ Failed to delete ${doc._id}:`, deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Test document cleanup completed - ${deletedCount} documents removed`,
      deletedCount,
      foundCount: testDocs.length,
      results: deletionResults
    });

  } catch (error) {
    console.error('❌ Test document cleanup failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test document cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test document cleanup endpoint',
    usage: 'POST to this endpoint to trigger cleanup'
  });
}