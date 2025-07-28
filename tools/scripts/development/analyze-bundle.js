#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Bundle analysis configuration
const BUNDLE_SIZE_LIMITS = {
  // Main bundle limits (in KB)
  'pages/_app': 250,
  'pages/blog': 150,
  'pages/blog/[slug]': 200,
  
  // Chunk limits
  'chunks/framework': 130,
  'chunks/main': 50,
  'chunks/commons': 100,
  
  // Static assets
  'static/css': 50,
  'static/js': 300,
};

// Performance budget thresholds
const PERFORMANCE_BUDGET = {
  totalJavaScript: 500, // KB
  totalCSS: 100, // KB
  totalImages: 2000, // KB
  totalFonts: 200, // KB
};

async function analyzeBundles() {
  console.log('🔍 Starting bundle analysis...\n');

  try {
    // Build the application first
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Analyze the build output
    const buildDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(buildDir, 'static');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Please run npm run build first.');
    }

    // Analyze JavaScript bundles
    const jsAnalysis = analyzeJavaScriptBundles(staticDir);
    
    // Analyze CSS bundles
    const cssAnalysis = analyzeCSSBundles(staticDir);
    
    // Analyze static assets
    const assetsAnalysis = analyzeStaticAssets();
    
    // Generate report
    generateReport({
      javascript: jsAnalysis,
      css: cssAnalysis,
      assets: assetsAnalysis,
    });

    // Check against performance budget
    checkPerformanceBudget({
      javascript: jsAnalysis,
      css: cssAnalysis,
      assets: assetsAnalysis,
    });

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function analyzeJavaScriptBundles(staticDir) {
  const jsDir = path.join(staticDir, 'chunks');
  const analysis = {
    totalSize: 0,
    bundles: [],
    warnings: [],
  };

  if (!fs.existsSync(jsDir)) {
    console.warn('⚠️ JavaScript chunks directory not found');
    return analysis;
  }

  const files = fs.readdirSync(jsDir, { recursive: true });
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      analysis.bundles.push({
        name: file,
        size: sizeKB,
        path: filePath,
      });
      
      analysis.totalSize += sizeKB;
      
      // Check against limits
      const bundleType = getBundleType(file);
      const limit = BUNDLE_SIZE_LIMITS[bundleType];
      
      if (limit && sizeKB > limit) {
        analysis.warnings.push({
          type: 'size_exceeded',
          bundle: file,
          size: sizeKB,
          limit: limit,
          message: `Bundle ${file} (${sizeKB}KB) exceeds limit of ${limit}KB`,
        });
      }
    }
  });

  // Sort bundles by size (largest first)
  analysis.bundles.sort((a, b) => b.size - a.size);

  return analysis;
}

function analyzeCSSBundles(staticDir) {
  const cssDir = path.join(staticDir, 'css');
  const analysis = {
    totalSize: 0,
    bundles: [],
    warnings: [],
  };

  if (!fs.existsSync(cssDir)) {
    console.warn('⚠️ CSS directory not found');
    return analysis;
  }

  const files = fs.readdirSync(cssDir);
  
  files.forEach(file => {
    if (file.endsWith('.css')) {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      analysis.bundles.push({
        name: file,
        size: sizeKB,
        path: filePath,
      });
      
      analysis.totalSize += sizeKB;
    }
  });

  // Sort bundles by size (largest first)
  analysis.bundles.sort((a, b) => b.size - a.size);

  return analysis;
}

function analyzeStaticAssets() {
  const publicDir = path.join(process.cwd(), 'public');
  const analysis = {
    images: { totalSize: 0, files: [] },
    fonts: { totalSize: 0, files: [] },
    other: { totalSize: 0, files: [] },
  };

  if (!fs.existsSync(publicDir)) {
    return analysis;
  }

  function analyzeDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativeFilePath = path.join(relativePath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        analyzeDirectory(filePath, relativeFilePath);
      } else {
        const sizeKB = Math.round(stats.size / 1024);
        const ext = path.extname(file).toLowerCase();
        
        const fileInfo = {
          name: relativeFilePath,
          size: sizeKB,
          extension: ext,
        };
        
        if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'].includes(ext)) {
          analysis.images.files.push(fileInfo);
          analysis.images.totalSize += sizeKB;
        } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
          analysis.fonts.files.push(fileInfo);
          analysis.fonts.totalSize += sizeKB;
        } else {
          analysis.other.files.push(fileInfo);
          analysis.other.totalSize += sizeKB;
        }
      }
    });
  }

  analyzeDirectory(publicDir);

  // Sort files by size
  analysis.images.files.sort((a, b) => b.size - a.size);
  analysis.fonts.files.sort((a, b) => b.size - a.size);
  analysis.other.files.sort((a, b) => b.size - a.size);

  return analysis;
}

function getBundleType(filename) {
  if (filename.includes('framework')) return 'chunks/framework';
  if (filename.includes('main')) return 'chunks/main';
  if (filename.includes('commons')) return 'chunks/commons';
  return 'unknown';
}

function generateReport(analysis) {
  console.log('\n📊 Bundle Analysis Report\n');
  console.log('=' .repeat(50));

  // JavaScript Analysis
  console.log('\n🟨 JavaScript Bundles:');
  console.log(`Total Size: ${analysis.javascript.totalSize}KB`);
  console.log('\nLargest Bundles:');
  
  analysis.javascript.bundles.slice(0, 10).forEach((bundle, index) => {
    const indicator = bundle.size > 100 ? '🔴' : bundle.size > 50 ? '🟡' : '🟢';
    console.log(`  ${index + 1}. ${indicator} ${bundle.name}: ${bundle.size}KB`);
  });

  // CSS Analysis
  console.log('\n🟦 CSS Bundles:');
  console.log(`Total Size: ${analysis.css.totalSize}KB`);
  
  if (analysis.css.bundles.length > 0) {
    console.log('\nCSS Files:');
    analysis.css.bundles.forEach((bundle, index) => {
      const indicator = bundle.size > 20 ? '🔴' : bundle.size > 10 ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${indicator} ${bundle.name}: ${bundle.size}KB`);
    });
  }

  // Static Assets Analysis
  console.log('\n🖼️ Static Assets:');
  console.log(`Images: ${analysis.assets.images.totalSize}KB (${analysis.assets.images.files.length} files)`);
  console.log(`Fonts: ${analysis.assets.fonts.totalSize}KB (${analysis.assets.fonts.files.length} files)`);
  console.log(`Other: ${analysis.assets.other.totalSize}KB (${analysis.assets.other.files.length} files)`);

  // Show largest images
  if (analysis.assets.images.files.length > 0) {
    console.log('\nLargest Images:');
    analysis.assets.images.files.slice(0, 5).forEach((file, index) => {
      const indicator = file.size > 500 ? '🔴' : file.size > 200 ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${indicator} ${file.name}: ${file.size}KB`);
    });
  }

  // Show warnings
  if (analysis.javascript.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    analysis.javascript.warnings.forEach(warning => {
      console.log(`  • ${warning.message}`);
    });
  }
}

function checkPerformanceBudget(analysis) {
  console.log('\n💰 Performance Budget Check\n');
  console.log('=' .repeat(50));

  const results = [];
  
  // Check JavaScript budget
  const jsResult = checkBudget(
    'JavaScript',
    analysis.javascript.totalSize,
    PERFORMANCE_BUDGET.totalJavaScript
  );
  results.push(jsResult);

  // Check CSS budget
  const cssResult = checkBudget(
    'CSS',
    analysis.css.totalSize,
    PERFORMANCE_BUDGET.totalCSS
  );
  results.push(cssResult);

  // Check Images budget
  const imagesResult = checkBudget(
    'Images',
    analysis.assets.images.totalSize,
    PERFORMANCE_BUDGET.totalImages
  );
  results.push(imagesResult);

  // Check Fonts budget
  const fontsResult = checkBudget(
    'Fonts',
    analysis.assets.fonts.totalSize,
    PERFORMANCE_BUDGET.totalFonts
  );
  results.push(fontsResult);

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📈 Budget Summary: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('✅ All performance budgets are within limits!');
  } else {
    console.log('❌ Some performance budgets exceeded. Consider optimization.');
    process.exit(1);
  }
}

function checkBudget(category, actual, budget) {
  const percentage = Math.round((actual / budget) * 100);
  const passed = actual <= budget;
  const indicator = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  
  console.log(`${indicator} ${category}: ${actual}KB / ${budget}KB (${percentage}%) - ${status}`);
  
  return { category, actual, budget, percentage, passed };
}

// Optimization suggestions
function generateOptimizationSuggestions(analysis) {
  const suggestions = [];

  // Large JavaScript bundles
  const largeBundles = analysis.javascript.bundles.filter(b => b.size > 100);
  if (largeBundles.length > 0) {
    suggestions.push({
      type: 'javascript',
      priority: 'high',
      message: `Consider code splitting for large bundles: ${largeBundles.map(b => b.name).join(', ')}`,
    });
  }

  // Large images
  const largeImages = analysis.assets.images.files.filter(f => f.size > 500);
  if (largeImages.length > 0) {
    suggestions.push({
      type: 'images',
      priority: 'medium',
      message: `Optimize large images: ${largeImages.map(f => f.name).join(', ')}`,
    });
  }

  // Too many small chunks
  const smallChunks = analysis.javascript.bundles.filter(b => b.size < 10);
  if (smallChunks.length > 10) {
    suggestions.push({
      type: 'javascript',
      priority: 'low',
      message: `Consider combining ${smallChunks.length} small chunks to reduce HTTP requests`,
    });
  }

  if (suggestions.length > 0) {
    console.log('\n💡 Optimization Suggestions\n');
    console.log('=' .repeat(50));
    
    suggestions.forEach((suggestion, index) => {
      const priorityIcon = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }[suggestion.priority];
      
      console.log(`${index + 1}. ${priorityIcon} ${suggestion.message}`);
    });
  }
}

// Run the analysis
if (require.main === module) {
  analyzeBundles();
}

module.exports = {
  analyzeBundles,
  BUNDLE_SIZE_LIMITS,
  PERFORMANCE_BUDGET,
};