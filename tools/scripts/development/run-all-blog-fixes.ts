#!/usr/bin/env tsx

/**
 * Master script to run all blog fixes and optimizations
 * This script should be run to ensure the blog system is production-ready
 */

import { createLogger } from '@/lib/logging/production-logger';
import { 
  fixBlogPostImages, 
  fixBlogPostSEO, 
  validateBlogPosts, 
  createFallbackContent, 
  optimizeBlogPerformance 
} from './fix-blog-issues';

const logger = createLogger('blog-master-fix');

async function runAllBlogFixes(): Promise<void> {
  const startTime = Date.now();
  logger.info('🚀 Starting comprehensive blog system fixes...');

  try {
    // Step 1: Create fallback content first
    logger.info('📝 Step 1: Creating fallback content...');
    await createFallbackContent();
    
    // Step 2: Fix blog post images
    logger.info('🖼️ Step 2: Fixing blog post images...');
    await fixBlogPostImages();
    
    // Step 3: Fix SEO issues
    logger.info('🔍 Step 3: Fixing SEO issues...');
    await fixBlogPostSEO();
    
    // Step 4: Optimize performance
    logger.info('⚡ Step 4: Optimizing performance...');
    await optimizeBlogPerformance();
    
    // Step 5: Final validation
    logger.info('✅ Step 5: Running final validation...');
    await validateBlogPosts();
    
    const duration = Date.now() - startTime;
    logger.info(`🎉 All blog fixes completed successfully in ${Math.round(duration / 1000)}s`);
    
    // Summary
    logger.info('📊 Fix Summary:');
    logger.info('  ✅ Fallback content created');
    logger.info('  ✅ Blog post images fixed');
    logger.info('  ✅ SEO metadata optimized');
    logger.info('  ✅ Performance metrics added');
    logger.info('  ✅ Content validation completed');
    logger.info('');
    logger.info('🚀 Your blog system is now production-ready!');
    
  } catch (error) {
    logger.error('❌ Blog fixes failed:', error);
    process.exit(1);
  }
}

// Health check function
async function runHealthCheck(): Promise<void> {
  logger.info('🏥 Running blog system health check...');
  
  try {
    // Import health checker
    const { BlogHealthChecker } = await import('@/lib/blog/error-handling');
    
    // Run comprehensive health check
    const healthResult = await BlogHealthChecker.performHealthCheck();
    
    if (healthResult.isHealthy) {
      logger.info('✅ Blog system is healthy');
    } else {
      logger.warn('⚠️ Blog system has issues:', healthResult.issues);
    }
    
    return healthResult;
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    throw error;
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--health-check') || args.includes('-h')) {
    await runHealthCheck();
    return;
  }
  
  if (args.includes('--help')) {
    console.log(`
Blog System Fix Script

Usage:
  npm run fix:blog              Run all blog fixes
  npm run fix:blog --health-check   Run health check only
  npm run fix:blog --help          Show this help

What this script does:
  1. Creates fallback content for error scenarios
  2. Fixes missing or broken blog post images
  3. Optimizes SEO metadata for all posts
  4. Adds performance metrics to posts
  5. Validates all blog content
  6. Ensures production readiness

Environment Variables:
  SANITY_API_TOKEN              Required for write operations
  NEXT_PUBLIC_SANITY_PROJECT_ID Required for Sanity connection
  NEXT_PUBLIC_SANITY_DATASET    Dataset to use (default: production)
    `);
    return;
  }
  
  // Run all fixes by default
  await runAllBlogFixes();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Script execution failed:', error);
    process.exit(1);
  });
}

export { runAllBlogFixes, runHealthCheck };
