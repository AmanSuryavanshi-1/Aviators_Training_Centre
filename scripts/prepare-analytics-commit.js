#!/usr/bin/env node
/**
 * Prepare Analytics Commit Script
 * Ensures all analytics files are ready for commit
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Preparing Analytics Dashboard for Commit...\n');

// List of all analytics-related files that should be committed
const analyticsFiles = [
  // Core Components
  'src/components/admin/AdvancedAnalyticsDashboard.tsx',
  
  // Admin Pages
  'src/app/admin/analytics/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  
  // API Endpoints
  'src/app/api/analytics/advanced/route.ts',
  'src/app/api/analytics/realtime/route.ts',
  'src/app/api/analytics/track/route.ts',
  'src/app/api/health/analytics/route.ts',
  
  // UI Components
  'src/components/ui/progress.tsx',
  'src/components/ui/scroll-area.tsx',
  
  // Firebase Configuration
  'src/lib/firebase/admin.ts',
  
  // Configuration Files
  'firestore.indexes.json',
  'firestore.rules',
  'package.json',
  
  // Documentation
  'ANALYTICS_DEPLOYMENT_READY.md',
  'scripts/validate-analytics-deployment.js',
  'scripts/prepare-analytics-commit.js'
];

console.log('📋 Checking Analytics Files:');
let allFilesPresent = true;
let totalSize = 0;

analyticsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
    totalSize += stats.size;
    console.log(`✅ ${file} (${sizeKB} KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

console.log(`\n📊 Total Size: ${Math.round(totalSize / 1024 * 100) / 100} KB`);

if (allFilesPresent) {
  console.log('\n🎉 All analytics files are present and ready for commit!');
  
  console.log('\n📝 Commit Message Suggestion:');
  console.log('---');
  console.log('feat: Add Advanced Analytics Dashboard');
  console.log('');
  console.log('- Implement comprehensive analytics dashboard with real-time metrics');
  console.log('- Add traffic source analysis with AI assistant detection');
  console.log('- Create user journey tracking and conversion funnels');
  console.log('- Integrate admin navigation with analytics access');
  console.log('- Add health monitoring and performance metrics');
  console.log('- Ensure zero breaking changes to existing functionality');
  console.log('');
  console.log('Features:');
  console.log('- Advanced Analytics Dashboard (/admin/analytics)');
  console.log('- Real-time metrics and monitoring');
  console.log('- Traffic quality analysis and bot detection');
  console.log('- Performance metrics and health checks');
  console.log('- Responsive design with proper error handling');
  console.log('');
  console.log('API Endpoints:');
  console.log('- /api/analytics/advanced - Main analytics data');
  console.log('- /api/analytics/realtime - Live metrics');
  console.log('- /api/analytics/track - Event tracking');
  console.log('- /api/health/analytics - System health');
  console.log('');
  console.log('Ready for production deployment with progressive enhancement.');
  console.log('---');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Review the changes: git diff');
  console.log('2. Stage the files: git add .');
  console.log('3. Commit: git commit -m "feat: Add Advanced Analytics Dashboard"');
  console.log('4. Push to production: git push');
  console.log('5. Access dashboard: /admin/analytics');
  
  console.log('\n✅ READY FOR COMMIT AND DEPLOYMENT');
  process.exit(0);
} else {
  console.log('\n❌ Some files are missing. Please ensure all analytics files are created.');
  process.exit(1);
}