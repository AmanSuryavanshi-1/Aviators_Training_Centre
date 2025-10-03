/**
 * Test Content Cleanup Utility
 * 
 * Helps identify and remove test content from Sanity CMS
 * to ensure only production-ready content appears on the website.
 */

import { enhancedClient } from '@/lib/sanity/client';
import { isTestContent } from './production-content-filter';

interface TestPost {
  _id: string;
  title: string;
  excerpt?: string;
  slug: { current: string };
  publishedAt: string;
  _createdAt: string;
}

/**
 * Find all test posts in Sanity
 */
export async function findTestPosts(): Promise<TestPost[]> {
  try {
    console.log('🔍 Scanning for test posts...');
    
    const query = `*[_type == "post"] {
      _id,
      title,
      excerpt,
      slug,
      publishedAt,
      _createdAt
    }`;
    
    const allPosts = await enhancedClient.fetch(query);
    const testPosts = allPosts.filter((post: TestPost) => isTestContent(post));
    
    console.log(`📊 Found ${testPosts.length} test posts out of ${allPosts.length} total posts`);
    
    return testPosts;
  } catch (error) {
    console.error('❌ Error finding test posts:', error);
    return [];
  }
}

/**
 * Get detailed report of test content
 */
export async function getTestContentReport(): Promise<{
  testPosts: TestPost[];
  summary: {
    totalPosts: number;
    testPosts: number;
    productionPosts: number;
    recommendations: string[];
  };
}> {
  try {
    const allPosts = await enhancedClient.fetch(`*[_type == "post"] {
      _id,
      title,
      excerpt,
      slug,
      publishedAt,
      _createdAt
    }`);
    
    const testPosts = allPosts.filter((post: TestPost) => isTestContent(post));
    const productionPosts = allPosts.length - testPosts.length;
    
    const recommendations: string[] = [];
    
    if (testPosts.length > 0) {
      recommendations.push(`Remove ${testPosts.length} test posts from Sanity`);
    }
    
    if (testPosts.some((post: TestPost) => post.publishedAt)) {
      recommendations.push('Unpublish test posts instead of deleting them');
    }
    
    if (testPosts.length > 5) {
      recommendations.push('Consider using drafts for test content');
    }
    
    return {
      testPosts,
      summary: {
        totalPosts: allPosts.length,
        testPosts: testPosts.length,
        productionPosts,
        recommendations
      }
    };
  } catch (error) {
    console.error('❌ Error generating test content report:', error);
    return {
      testPosts: [],
      summary: {
        totalPosts: 0,
        testPosts: 0,
        productionPosts: 0,
        recommendations: ['Error occurred while scanning content']
      }
    };
  }
}

/**
 * Safely remove test posts (moves to drafts first)
 */
export async function safeRemoveTestPosts(dryRun: boolean = true): Promise<{
  success: boolean;
  removed: string[];
  errors: string[];
  dryRun: boolean;
}> {
  const result = {
    success: false,
    removed: [] as string[],
    errors: [] as string[],
    dryRun
  };
  
  try {
    const testPosts = await findTestPosts();
    
    if (testPosts.length === 0) {
      console.log('✅ No test posts found to remove');
      result.success = true;
      return result;
    }
    
    console.log(`🧹 ${dryRun ? 'DRY RUN: Would remove' : 'Removing'} ${testPosts.length} test posts...`);
    
    for (const post of testPosts) {
      try {
        if (dryRun) {
          console.log(`📝 Would remove: "${post.title}" (${post._id})`);
          result.removed.push(post._id);
        } else {
          // First, move to drafts to be safe
          await enhancedClient.patch(post._id).set({
            _id: `drafts.${post._id}`,
            publishedAt: null
          }).commit();
          
          console.log(`✅ Moved to drafts: "${post.title}"`);
          result.removed.push(post._id);
        }
      } catch (error) {
        const errorMsg = `Failed to process ${post.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }
    
    result.success = result.errors.length === 0;
    
    if (!dryRun && result.success) {
      console.log(`✅ Successfully processed ${result.removed.length} test posts`);
    }
    
  } catch (error) {
    const errorMsg = `Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
  }
  
  return result;
}

/**
 * Permanently delete test posts (use with caution)
 */
export async function permanentlyDeleteTestPosts(confirmationCode: string): Promise<{
  success: boolean;
  deleted: string[];
  errors: string[];
}> {
  const result = {
    success: false,
    deleted: [] as string[],
    errors: [] as string[]
  };
  
  // Safety check
  if (confirmationCode !== 'DELETE_TEST_POSTS_PERMANENTLY') {
    result.errors.push('Invalid confirmation code. This operation requires explicit confirmation.');
    return result;
  }
  
  try {
    const testPosts = await findTestPosts();
    
    if (testPosts.length === 0) {
      console.log('✅ No test posts found to delete');
      result.success = true;
      return result;
    }
    
    console.log(`🗑️ PERMANENTLY DELETING ${testPosts.length} test posts...`);
    
    for (const post of testPosts) {
      try {
        await enhancedClient.delete(post._id);
        console.log(`🗑️ Deleted: "${post.title}" (${post._id})`);
        result.deleted.push(post._id);
      } catch (error) {
        const errorMsg = `Failed to delete ${post.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }
    
    result.success = result.errors.length === 0;
    
    if (result.success) {
      console.log(`✅ Successfully deleted ${result.deleted.length} test posts`);
    }
    
  } catch (error) {
    const errorMsg = `Error during deletion: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
  }
  
  return result;
}

/**
 * Create a backup of test posts before deletion
 */
export async function backupTestPosts(): Promise<{
  success: boolean;
  backup: TestPost[];
  backupId: string;
}> {
  try {
    const testPosts = await findTestPosts();
    const backupId = `test-posts-backup-${Date.now()}`;
    
    // In a real implementation, you might save this to a file or external storage
    console.log(`💾 Created backup: ${backupId}`);
    console.log(`📊 Backed up ${testPosts.length} test posts`);
    
    return {
      success: true,
      backup: testPosts,
      backupId
    };
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return {
      success: false,
      backup: [],
      backupId: ''
    };
  }
}

/**
 * Interactive cleanup wizard
 */
export async function runCleanupWizard(): Promise<void> {
  console.log('🧙‍♂️ Starting Test Content Cleanup Wizard...');
  
  // Step 1: Generate report
  console.log('\n📊 Step 1: Analyzing content...');
  const report = await getTestContentReport();
  
  console.log(`\n📈 Content Analysis Report:`);
  console.log(`   Total Posts: ${report.summary.totalPosts}`);
  console.log(`   Production Posts: ${report.summary.productionPosts}`);
  console.log(`   Test Posts: ${report.summary.testPosts}`);
  
  if (report.testPosts.length > 0) {
    console.log(`\n🔍 Test Posts Found:`);
    report.testPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" (${post.slug.current})`);
    });
    
    console.log(`\n💡 Recommendations:`);
    report.summary.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Step 2: Dry run
    console.log(`\n🧪 Step 2: Performing dry run...`);
    const dryRunResult = await safeRemoveTestPosts(true);
    
    if (dryRunResult.success) {
      console.log(`✅ Dry run completed successfully`);
      console.log(`📝 Would process ${dryRunResult.removed.length} posts`);
    } else {
      console.log(`❌ Dry run encountered errors:`);
      dryRunResult.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Review the test posts listed above`);
    console.log(`   2. Run safeRemoveTestPosts(false) to move them to drafts`);
    console.log(`   3. Or use permanentlyDeleteTestPosts() to delete them permanently`);
    console.log(`   4. Deploy your changes to see the cleaned website`);
    
  } else {
    console.log(`\n✅ No test posts found! Your content is production-ready.`);
  }
  
  console.log(`\n🚀 Cleanup wizard completed!`);
}

export default {
  findTestPosts,
  getTestContentReport,
  safeRemoveTestPosts,
  permanentlyDeleteTestPosts,
  backupTestPosts,
  runCleanupWizard
};