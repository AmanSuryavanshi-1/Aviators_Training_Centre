#!/usr/bin/env node

/**
 * Responsive Design Validation Script
 * Validates that all blog components have proper responsive design implementations
 */

import fs from 'fs';
import path from 'path';

// Component files to validate
const componentFiles = [
  'components/blog/BlogListingClient.tsx',
  'components/blog/BlogCard.tsx',
  'components/blog/CoursePromotionCTA.tsx',
  'components/blog/FeaturedPostsCarousel.tsx',
  'components/blog/SocialShare.tsx',
  'components/blog/ReadingProgress.tsx'
];

// Responsive patterns to check for
const responsivePatterns = {
  'Responsive Text Sizing': [
    /text-xs\s+sm:text-sm/,
    /text-sm\s+sm:text-base/,
    /text-base\s+sm:text-lg/,
    /text-lg\s+sm:text-xl/,
    /text-xl\s+sm:text-2xl/
  ],
  'Responsive Spacing': [
    /p-\d+\s+sm:p-\d+/,
    /px-\d+\s+sm:px-\d+/,
    /py-\d+\s+sm:py-\d+/,
    /gap-\d+\s+sm:gap-\d+/,
    /space-y-\d+\s+sm:space-y-\d+/
  ],
  'Responsive Layout': [
    /flex-col\s+sm:flex-row/,
    /grid-cols-1\s+sm:grid-cols-2/,
    /grid-cols-2\s+sm:grid-cols-3/,
    /w-full\s+sm:w-\w+/,
    /h-\d+\s+sm:h-\d+/
  ],
  'Touch Optimization': [
    /touch-manipulation/,
    /min-w-\[44px\]/,
    /min-h-\[44px\]/,
    /w-8\s+h-8\s+sm:w-10\s+sm:h-10/,
    /w-10\s+h-10\s+sm:w-12\s+sm:h-12/
  ],
  'Mobile-First Breakpoints': [
    /sm:/,
    /md:/,
    /lg:/,
    /xl:/
  ],
  'Responsive Visibility': [
    /hidden\s+sm:block/,
    /hidden\s+lg:block/,
    /block\s+sm:hidden/,
    /sm:hidden/
  ]
};

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function validateFile(filePath) {
  console.log(`\n🔍 Validating: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    results.failed++;
    results.details.push({
      file: filePath,
      status: 'failed',
      reason: 'File not found'
    });
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fileResults = {
    file: filePath,
    patterns: {},
    score: 0,
    maxScore: 0
  };

  // Check each responsive pattern category
  Object.entries(responsivePatterns).forEach(([category, patterns]) => {
    const categoryResults = {
      found: 0,
      total: patterns.length,
      matches: []
    };

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        categoryResults.found++;
        categoryResults.matches.push(matches[0]);
      }
    });

    fileResults.patterns[category] = categoryResults;
    fileResults.score += categoryResults.found;
    fileResults.maxScore += categoryResults.total;

    // Log category results
    const percentage = Math.round((categoryResults.found / categoryResults.total) * 100);
    const status = percentage >= 50 ? '✅' : percentage >= 25 ? '⚠️' : '❌';
    console.log(`  ${status} ${category}: ${categoryResults.found}/${categoryResults.total} (${percentage}%)`);
    
    if (categoryResults.matches.length > 0) {
      console.log(`    Examples: ${categoryResults.matches.slice(0, 2).join(', ')}`);
    }
  });

  // Calculate overall score
  const overallPercentage = Math.round((fileResults.score / fileResults.maxScore) * 100);
  
  if (overallPercentage >= 70) {
    console.log(`✅ Overall Score: ${overallPercentage}% - PASSED`);
    results.passed++;
    fileResults.status = 'passed';
  } else if (overallPercentage >= 40) {
    console.log(`⚠️ Overall Score: ${overallPercentage}% - WARNING`);
    results.warnings++;
    fileResults.status = 'warning';
  } else {
    console.log(`❌ Overall Score: ${overallPercentage}% - FAILED`);
    results.failed++;
    fileResults.status = 'failed';
  }

  results.details.push(fileResults);
}

// Specific checks for mobile optimization
function checkMobileOptimizations() {
  console.log('\n🔍 Checking Mobile Optimization Components...');
  
  const mobileOptFile = 'components/blog/MobileOptimizations.tsx';
  if (fs.existsSync(mobileOptFile)) {
    console.log('✅ MobileOptimizations component found');
    
    const content = fs.readFileSync(mobileOptFile, 'utf8');
    const checks = [
      { name: 'Touch Target Optimization', pattern: /minWidth.*44px/ },
      { name: 'Viewport Handling', pattern: /--vh/ },
      { name: 'Zoom Prevention', pattern: /preventDefault/ },
      { name: 'Touch Event Handling', pattern: /touchend/ }
    ];

    checks.forEach(check => {
      const found = check.pattern.test(content);
      console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
    });
  } else {
    console.log('❌ MobileOptimizations component not found');
    results.failed++;
  }
}

// Check for responsive image implementations
function checkResponsiveImages() {
  console.log('\n🔍 Checking Responsive Image Implementations...');
  
  const imageFiles = [
    'components/blog/OptimizedImage.tsx',
    'components/blog/BlogCard.tsx'
  ];

  imageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasResponsiveSizes = /sizes=/.test(content);
      const hasResponsiveProps = /width.*height/.test(content);
      
      console.log(`  ${hasResponsiveSizes ? '✅' : '❌'} ${file} - Responsive sizes`);
      console.log(`  ${hasResponsiveProps ? '✅' : '❌'} ${file} - Responsive props`);
    }
  });
}

// Main validation function
function runValidation() {
  console.log('🚀 Starting Responsive Design Validation...\n');
  console.log('=' .repeat(60));

  // Validate each component file
  componentFiles.forEach(validateFile);

  // Additional mobile optimization checks
  checkMobileOptimizations();
  checkResponsiveImages();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️ Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📁 Total Files: ${componentFiles.length}`);

  const totalScore = results.passed + (results.warnings * 0.5);
  const maxScore = componentFiles.length;
  const overallPercentage = Math.round((totalScore / maxScore) * 100);

  console.log(`\n🎯 Overall Responsive Design Score: ${overallPercentage}%`);

  if (overallPercentage >= 80) {
    console.log('🎉 EXCELLENT - Responsive design implementation is comprehensive!');
  } else if (overallPercentage >= 60) {
    console.log('👍 GOOD - Responsive design implementation is solid with room for improvement.');
  } else if (overallPercentage >= 40) {
    console.log('⚠️ NEEDS IMPROVEMENT - Some responsive design patterns are missing.');
  } else {
    console.log('❌ POOR - Significant responsive design improvements needed.');
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (results.failed > 0) {
    console.log('- Address failed components with missing responsive patterns');
  }
  
  if (results.warnings > 0) {
    console.log('- Enhance components with warnings to improve responsive coverage');
  }
  
  console.log('- Test on actual mobile devices for real-world validation');
  console.log('- Monitor Core Web Vitals on mobile devices');
  console.log('- Consider progressive enhancement for advanced mobile features');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the validation
runValidation();
