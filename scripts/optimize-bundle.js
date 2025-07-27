#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle optimization configuration for Core Web Vitals
const OPTIMIZATION_CONFIG = {
  // Target bundle sizes (in KB)
  targets: {
    mainBundle: 200,
    pageBundle: 150,
    chunkBundle: 100,
    cssBundle: 50,
  },
  
  // Code splitting patterns
  splitPatterns: {
    vendor: /[\\/]node_modules[\\/]/,
    ui: /[\\/]components[\\/]ui[\\/]/,
    blog: /[\\/]components[\\/]blog[\\/]/,
    icons: /[\\/]lucide-react[\\/]/,
    animations: /[\\/]framer-motion[\\/]/,
  },
  
  // Dynamic import candidates
  dynamicImports: [
    'components/blog/SocialShare',
    'components/blog/ReadingProgress',
    'components/blog/RelatedPosts',
    'components/blog/CoursePromotionCTA',
    'components/ui/Dialog',
    'components/ui/Popover',
    'lucide-react',
  ],
  
  // Critical resources that should NOT be split
  critical: [
    'components/blog/OptimizedImage',
    'components/blog/CriticalCSS',
    'components/blog/PerformanceMonitor',
    'lib/blog/api',
  ],
};

async function optimizeBundle() {
  console.log('🚀 Starting bundle optimization for Core Web Vitals...\n');

  try {
    // Step 1: Analyze current bundle
    console.log('📊 Analyzing current bundle...');
    const currentAnalysis = await analyzeCurrentBundle();
    
    // Step 2: Implement code splitting optimizations
    console.log('✂️ Implementing code splitting...');
    await implementCodeSplitting();
    
    // Step 3: Add dynamic imports
    console.log('🔄 Adding dynamic imports...');
    await addDynamicImports();
    
    // Step 4: Optimize CSS delivery
    console.log('🎨 Optimizing CSS delivery...');
    await optimizeCSSDelivery();
    
    // Step 5: Create optimized webpack config
    console.log('⚙️ Creating optimized webpack config...');
    await createOptimizedWebpackConfig();
    
    // Step 6: Build and analyze optimized bundle
    console.log('🔨 Building optimized bundle...');
    const optimizedAnalysis = await buildAndAnalyze();
    
    // Step 7: Generate optimization report
    console.log('📈 Generating optimization report...');
    generateOptimizationReport(currentAnalysis, optimizedAnalysis);
    
    console.log('✅ Bundle optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Bundle optimization failed:', error);
    process.exit(1);
  }
}

async function analyzeCurrentBundle() {
  try {
    // Build current version for analysis
    execSync('npm run build', { stdio: 'pipe' });
    
    const buildDir = path.join(process.cwd(), '.next');
    const analysis = {
      totalSize: 0,
      bundles: [],
      chunks: [],
      css: [],
    };
    
    // Analyze JavaScript bundles
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      const jsDir = path.join(staticDir, 'chunks');
      if (fs.existsSync(jsDir)) {
        const files = fs.readdirSync(jsDir, { recursive: true });
        files.forEach(file => {
          if (file.endsWith('.js')) {
            const filePath = path.join(jsDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            analysis.bundles.push({
              name: file,
              size: sizeKB,
              type: getBundleType(file),
            });
            analysis.totalSize += sizeKB;
          }
        });
      }
      
      // Analyze CSS
      const cssDir = path.join(staticDir, 'css');
      if (fs.existsSync(cssDir)) {
        const files = fs.readdirSync(cssDir);
        files.forEach(file => {
          if (file.endsWith('.css')) {
            const filePath = path.join(cssDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            analysis.css.push({
              name: file,
              size: sizeKB,
            });
          }
        });
      }
    }
    
    return analysis;
  } catch (error) {
    console.warn('Could not analyze current bundle:', error.message);
    return { totalSize: 0, bundles: [], chunks: [], css: [] };
  }
}

async function implementCodeSplitting() {
  // Update Next.js config with enhanced code splitting
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add enhanced webpack configuration for code splitting
  const webpackConfig = `
  // Enhanced webpack configuration for Core Web Vitals optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for better caching and performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
            enforce: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui',
            priority: 15,
            chunks: 'all',
          },
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 10,
            chunks: 'all',
          },
          blog: {
            test: /[\\/]components[\\/]blog[\\/]/,
            name: 'blog',
            priority: 5,
            chunks: 'all',
            minChunks: 2,
          },
          animations: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'animations',
            priority: 8,
            chunks: 'all',
          },
        },
      };
      
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize module concatenation
      config.optimization.concatenateModules = true;
    }

    return config;
  },`;
  
  // Insert webpack config if not already present
  if (!nextConfig.includes('webpack:')) {
    nextConfig = nextConfig.replace(
      'export default nextConfig;',
      `  ${webpackConfig}\n};\n\nexport default nextConfig;`
    );
    
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ Enhanced webpack configuration added to next.config.mjs');
  }
}

async function addDynamicImports() {
  const componentsToOptimize = [
    {
      file: 'app/blog/[slug]/page.tsx',
      imports: [
        {
          original: "import SocialShare from '@/components/blog/SocialShare';",
          dynamic: "const SocialShare = dynamic(() => import('@/components/blog/SocialShare'), {\n  loading: () => <div className=\"h-12 w-full bg-muted animate-pulse rounded\" />,\n});"
        },
        {
          original: "import ReadingProgress from '@/components/blog/ReadingProgress';",
          dynamic: "const ReadingProgress = dynamic(() => import('@/components/blog/ReadingProgress'), {\n  loading: () => null,\n});"
        },
        {
          original: "import RelatedPosts from '@/components/blog/RelatedPosts';",
          dynamic: "const RelatedPosts = dynamic(() => import('@/components/blog/RelatedPosts'), {\n  ssr: true,\n});"
        }
      ]
    }
  ];
  
  for (const component of componentsToOptimize) {
    const filePath = path.join(process.cwd(), component.file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add dynamic import if not already present
      if (!content.includes('dynamic(')) {
        // Add dynamic import
        content = "import dynamic from 'next/dynamic';\n" + content;
      }
      
      // Replace static imports with dynamic imports
      component.imports.forEach(({ original, dynamic }) => {
        if (content.includes(original)) {
          content = content.replace(original, dynamic);
          console.log(`✅ Added dynamic import for ${original.split("'")[1]}`);
        }
      });
      
      fs.writeFileSync(filePath, content);
    }
  }
}

async function optimizeCSSDelivery() {
  // Create a CSS optimization configuration
  const cssOptimizationConfig = {
    critical: [
      'globals.css',
      'components.css',
    ],
    deferred: [
      'animations.css',
      'utilities.css',
    ],
  };
  
  // Create CSS loading optimization component
  const cssLoaderComponent = `
"use client";

import { useEffect } from 'react';

interface CSSLoaderProps {
  href: string;
  media?: string;
  critical?: boolean;
}

const CSSLoader: React.FC<CSSLoaderProps> = ({ href, media = 'all', critical = false }) => {
  useEffect(() => {
    if (!critical) {
      // Load non-critical CSS asynchronously
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => {
        link.media = media;
      };
      document.head.appendChild(link);
      
      // Fallback for browsers that don't support onload
      setTimeout(() => {
        link.media = media;
      }, 100);
    }
  }, [href, media, critical]);
  
  // Render critical CSS synchronously
  if (critical) {
    return <link rel="stylesheet" href={href} media={media} />;
  }
  
  return null;
};

export default CSSLoader;
`;
  
  const cssLoaderPath = path.join(process.cwd(), 'components/blog/CSSLoader.tsx');
  fs.writeFileSync(cssLoaderPath, cssLoaderComponent);
  console.log('✅ Created CSS loader component for optimized delivery');
}

async function createOptimizedWebpackConfig() {
  // Create a separate webpack optimization file
  const webpackOptimizations = `
// Webpack optimizations for Core Web Vitals
module.exports = {
  // Bundle analysis and optimization
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Enable module concatenation for better performance
    concatenateModules: true,
    // Minimize bundle size
    minimize: true,
    // Use deterministic module ids for better caching
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  },
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 250000, // 250KB
    maxAssetSize: 250000, // 250KB
  },
  
  // Resolve optimizations
  resolve: {
    // Reduce resolve time
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // Use aliases for better tree shaking
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
};
`;
  
  const webpackConfigPath = path.join(process.cwd(), 'webpack.optimization.js');
  fs.writeFileSync(webpackConfigPath, webpackOptimizations);
  console.log('✅ Created optimized webpack configuration');
}

async function buildAndAnalyze() {
  try {
    // Build the optimized version
    execSync('npm run build', { stdio: 'inherit' });
    
    // Analyze the new bundle
    return await analyzeCurrentBundle();
  } catch (error) {
    console.error('Build failed:', error);
    throw error;
  }
}

function generateOptimizationReport(before, after) {
  console.log('\n📊 Bundle Optimization Report\n');
  console.log('=' .repeat(60));
  
  const sizeDiff = before.totalSize - after.totalSize;
  const percentImprovement = before.totalSize > 0 ? ((sizeDiff / before.totalSize) * 100).toFixed(1) : 0;
  
  console.log(`\n📈 Overall Results:`);
  console.log(`Before: ${before.totalSize}KB`);
  console.log(`After: ${after.totalSize}KB`);
  console.log(`Reduction: ${sizeDiff}KB (${percentImprovement}% improvement)`);
  
  console.log(`\n📦 Bundle Analysis:`);
  console.log(`JavaScript bundles: ${after.bundles.length}`);
  console.log(`CSS files: ${after.css.length}`);
  
  // Show largest bundles
  if (after.bundles.length > 0) {
    console.log(`\n🔍 Largest Bundles:`);
    after.bundles
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach((bundle, index) => {
        const status = bundle.size > OPTIMIZATION_CONFIG.targets.chunkBundle ? '🔴' : 
                      bundle.size > OPTIMIZATION_CONFIG.targets.chunkBundle * 0.8 ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${status} ${bundle.name}: ${bundle.size}KB`);
      });
  }
  
  // Performance recommendations
  console.log(`\n💡 Recommendations:`);
  
  const largeChunks = after.bundles.filter(b => b.size > OPTIMIZATION_CONFIG.targets.chunkBundle);
  if (largeChunks.length > 0) {
    console.log(`  • Consider further splitting ${largeChunks.length} large chunks`);
  }
  
  const totalCSS = after.css.reduce((sum, css) => sum + css.size, 0);
  if (totalCSS > OPTIMIZATION_CONFIG.targets.cssBundle) {
    console.log(`  • CSS size (${totalCSS}KB) exceeds target (${OPTIMIZATION_CONFIG.targets.cssBundle}KB)`);
  }
  
  if (sizeDiff > 0) {
    console.log(`  ✅ Great job! Bundle size reduced by ${sizeDiff}KB`);
  } else {
    console.log(`  • Consider implementing more aggressive code splitting`);
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    before,
    after,
    improvement: {
      sizeReduction: sizeDiff,
      percentImprovement: parseFloat(percentImprovement),
    },
    recommendations: generateDetailedRecommendations(after),
  };
  
  const reportPath = path.join(process.cwd(), 'bundle-optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

function generateDetailedRecommendations(analysis) {
  const recommendations = [];
  
  // Check for oversized bundles
  analysis.bundles.forEach(bundle => {
    if (bundle.size > OPTIMIZATION_CONFIG.targets.chunkBundle) {
      recommendations.push({
        type: 'bundle_size',
        priority: 'high',
        message: `Bundle ${bundle.name} (${bundle.size}KB) exceeds target size`,
        suggestion: 'Consider code splitting or dynamic imports',
      });
    }
  });
  
  // Check for too many small chunks
  const smallChunks = analysis.bundles.filter(b => b.size < 10);
  if (smallChunks.length > 10) {
    recommendations.push({
      type: 'chunk_fragmentation',
      priority: 'medium',
      message: `${smallChunks.length} very small chunks detected`,
      suggestion: 'Consider combining small chunks to reduce HTTP requests',
    });
  }
  
  // Check CSS optimization
  const totalCSS = analysis.css.reduce((sum, css) => sum + css.size, 0);
  if (totalCSS > OPTIMIZATION_CONFIG.targets.cssBundle) {
    recommendations.push({
      type: 'css_size',
      priority: 'medium',
      message: `CSS size (${totalCSS}KB) exceeds target`,
      suggestion: 'Implement critical CSS extraction and async loading',
    });
  }
  
  return recommendations;
}

function getBundleType(filename) {
  if (filename.includes('framework')) return 'framework';
  if (filename.includes('main')) return 'main';
  if (filename.includes('commons')) return 'commons';
  if (filename.includes('vendor')) return 'vendor';
  if (filename.includes('react')) return 'react';
  return 'chunk';
}

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeBundle();
}

export { optimizeBundle, OPTIMIZATION_CONFIG };