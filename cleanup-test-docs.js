const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function cleanupTestDocuments() {
  try {
    console.log('🔍 Searching for test documents...');
    
    const testDocs = await client.fetch(`
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
    `);

    console.log(`📋 Found ${testDocs.length} test documents`);
    
    if (testDocs.length === 0) {
      console.log('✅ No test documents found to clean up');
      return;
    }

    console.log('🗑️ Deleting test documents...');
    let deletedCount = 0;
    
    for (const doc of testDocs) {
      try {
        await client.delete(doc._id);
        console.log(`✅ Deleted: ${doc.title || doc._id}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${doc._id}:`, error.message);
      }
    }
    
    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} out of ${testDocs.length} test documents`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupTestDocuments();