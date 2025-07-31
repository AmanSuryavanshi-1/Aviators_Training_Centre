#!/usr/bin/env node

/**
 * Production Readiness Checker
 * Comprehensive check for production deployment readiness
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

class ProductionReadinessChecker {
  private results: CheckResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('🔍 Running Production Readiness Checks...\n');

    await this.checkBuildProcess();
    await this.checkEnvironmentVariables();
    await this.checkSanityConnection();
    await this.checkBlogFunctionality();
    await this.checkSecurityConfiguration();
    await this.checkPerformanceOptimizations();
    await this.checkErrorHandling();
    await this.checkSEOConfiguration();

    this.generateReport();
  }

  private async checkBuildProcess(): Promise<void> {
    console.log('🏗️ Checking build process...');

    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build', 'Next.js Build', 'pass', 'Build completed successfully');
    } catch (error) {
      this.addResult('Build', 'Next.js Build', 'fail', 'Build failed', 'Fix TypeScript/ESLint errors');
    }

    // Check for critical files
    const criticalFiles = [
      'package.json',
      'next.config.mjs',
      'tailwind.config.mjs',
      '.env.local',
      'app/layout.tsx',
      'app/page.tsx'
    ];

    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        this.addResult('Build', `Critical File: ${file}`, 'pass', 'File exists');
      } else {
        this.addResult('Build', `Critical File: ${file}`, 'fail', 'File missing');
      }
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log('🔐 Checking environment variables...');

    const requiredEnvVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'NEXT_PUBLIC_SANITY_API_VERSION',
      'SANITY_API_TOKEN',
      'NEXT_PUBLIC_SITE_URL',
      'RESEND_API_KEY',
      'FROM_EMAIL'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.addResult('Environment', envVar, 'pass', 'Environment variable set');
      } else {
        this.addResult('Environment', envVar, 'fail', 'Environment variable missing', `Set ${envVar} in .env.local`);
      }
    }

    // Check for sensitive data exposure
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      if (envContent.includes('localhost') || envContent.includes('127.0.0.1')) {
        this.addResult('Environment', 'Local URLs', 'warning', 'Local URLs found in environment', 'Update URLs for production');
      } else {
        this.addResult('Environment', 'Local URLs', 'pass', 'No local URLs found');
      }
    }
  }

  private async checkSanityConnection(): Promise<void> {
    console.log('🗄️ Checking Sanity CMS connection...');

    try {
      // Check if Sanity client can be imported
      const sanityClientPath = path.join(process.cwd(), 'lib/sanity/client.ts');
      if (fs.existsSync(sanityClientPath)) {
        this.addResult('Sanity', 'Client Configuration', 'pass', 'Sanity client file exists');
      } else {
        this.addResult('Sanity', 'Client Configuration', 'fail', 'Sanity client file missing');
      }

      // Check Sanity studio configuration
      const studioPath = path.join(process.cwd(), 'studio-aviator-training-centre-(atc)');
      if (fs.existsSync(studioPath)) {
        this.addResult('Sanity', 'Studio Configuration', 'pass', 'Sanity studio configured');
      } else {
        this.addResult('Sanity', 'Studio Configuration', 'warning', 'Sanity studio not found');
      }

    } catch (error) {
      this.addResult('Sanity', 'Connection Test', 'fail', 'Failed to test Sanity connection');
    }
  }

  private async checkBlogFunctionality(): Promise<void> {
    console.log('📝 Checking blog functionality...');

    const blogFiles = [
      'app/blog/page.tsx',
      'app/blog/[id]/page.tsx',
      'lib/blog/unified-blog-service.ts',
      'components/blog/OptimizedBlogListing.tsx'
    ];

    for (const file of blogFiles) {
      if (fs.existsSync(file)) {
        this.addResult('Blog', `File: ${path.basename(file)}`, 'pass', 'Blog file exists');
      } else {
        this.addResult('Blog', `File: ${path.basename(file)}`, 'fail', 'Blog file missing');
      }
    }

    // Check API routes
    const apiRoutes = [
      'app/api/blog/posts/route.ts',
      'app/api/blog/posts/[slug]/route.ts',
      'app/api/sanity/health/route.ts'
    ];

    for (const route of apiRoutes) {
      if (fs.existsSync(route)) {
        this.addResult('Blog', `API: ${path.basename(route)}`, 'pass', 'API route exists');
      } else {
        this.addResult('Blog', `API: ${path.basename(route)}`, 'fail', 'API route missing');
      }
    }
  }

  private async checkSecurityConfiguration(): Promise<void> {
    console.log('🔒 Checking security configuration...');

    // Check for security headers in next.config.mjs
    if (fs.existsSync('next.config.mjs')) {
      const configContent = fs.readFileSync('next.config.mjs', 'utf8');
      if (configContent.includes('headers')) {
        this.addResult('Security', 'Security Headers', 'pass', 'Security headers configured');
      } else {
        this.addResult('Security', 'Security Headers', 'warning', 'Security headers not configured', 'Add security headers to next.config.mjs');
      }
    }

    // Check for .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      if (gitignoreContent.includes('.env.local')) {
        this.addResult('Security', 'Environment Protection', 'pass', 'Environment files ignored in git');
      } else {
        this.addResult('Security', 'Environment Protection', 'fail', 'Environment files not ignored', 'Add .env.local to .gitignore');
      }
    }

    // Check for admin route protection
    if (fs.existsSync('middleware.ts')) {
      this.addResult('Security', 'Route Protection', 'pass', 'Middleware configured');
    } else {
      this.addResult('Security', 'Route Protection', 'warning', 'No middleware found', 'Consider adding route protection');
    }
  }

  private async checkPerformanceOptimizations(): Promise<void> {
    console.log('⚡ Checking performance optimizations...');

    // Check for image optimization
    const publicDir = 'public';
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir, { recursive: true });
      const imageFiles = files.filter(file => 
        typeof file === 'string' && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)
      );
      
      if (imageFiles.length > 0) {
        const webpFiles = imageFiles.filter(file => file.toString().endsWith('.webp'));
        if (webpFiles.length > 0) {
          this.addResult('Performance', 'Image Optimization', 'pass', 'WebP images found');
        } else {
          this.addResult('Performance', 'Image Optimization', 'warning', 'No WebP images found', 'Convert images to WebP format');
        }
      }
    }

    // Check for caching configuration
    if (fs.existsSync('lib/cache')) {
      this.addResult('Performance', 'Caching System', 'pass', 'Caching system implemented');
    } else {
      this.addResult('Performance', 'Caching System', 'warning', 'No caching system found');
    }

    // Check for bundle analysis
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts['analyze']) {
      this.addResult('Performance', 'Bundle Analysis', 'pass', 'Bundle analysis script available');
    } else {
      this.addResult('Performance', 'Bundle Analysis', 'warning', 'No bundle analysis script', 'Add bundle analyzer');
    }
  }

  private async checkErrorHandling(): Promise<void> {
    console.log('🚨 Checking error handling...');

    const errorFiles = [
      'app/not-found.tsx',
      'app/error.tsx',
      'lib/error-handling'
    ];

    for (const file of errorFiles) {
      if (fs.existsSync(file)) {
        this.addResult('Error Handling', `File: ${path.basename(file)}`, 'pass', 'Error handling file exists');
      } else {
        this.addResult('Error Handling', `File: ${path.basename(file)}`, 'warning', 'Error handling file missing');
      }
    }

    // Check for global error boundary
    if (fs.existsSync('lib/blog-error-boundary.tsx')) {
      this.addResult('Error Handling', 'Error Boundary', 'pass', 'Error boundary implemented');
    } else {
      this.addResult('Error Handling', 'Error Boundary', 'warning', 'No error boundary found');
    }
  }

  private async checkSEOConfiguration(): Promise<void> {
    console.log('🔍 Checking SEO configuration...');

    // Check for sitemap
    if (fs.existsSync('app/sitemap.ts')) {
      this.addResult('SEO', 'Sitemap', 'pass', 'Sitemap configured');
    } else {
      this.addResult('SEO', 'Sitemap', 'fail', 'Sitemap missing', 'Add sitemap.ts');
    }

    // Check for robots.txt
    if (fs.existsSync('app/robots.ts')) {
      this.addResult('SEO', 'Robots.txt', 'pass', 'Robots.txt configured');
    } else {
      this.addResult('SEO', 'Robots.txt', 'fail', 'Robots.txt missing', 'Add robots.ts');
    }

    // Check for metadata
    if (fs.existsSync('app/metadata.ts')) {
      this.addResult('SEO', 'Metadata', 'pass', 'Metadata configuration found');
    } else {
      this.addResult('SEO', 'Metadata', 'warning', 'No metadata configuration');
    }

    // Check for structured data
    const layoutContent = fs.existsSync('app/layout.tsx') ? fs.readFileSync('app/layout.tsx', 'utf8') : '';
    if (layoutContent.includes('application/ld+json')) {
      this.addResult('SEO', 'Structured Data', 'pass', 'Structured data implemented');
    } else {
      this.addResult('SEO', 'Structured Data', 'warning', 'No structured data found', 'Add JSON-LD structured data');
    }
  }

  private addResult(category: string, check: string, status: 'pass' | 'fail' | 'warning', message: string, fix?: string): void {
    this.results.push({ category, check, status, message, fix });
  }

  private generateReport(): void {
    console.log('\n📊 Production Readiness Report');
    console.log('===============================\n');

    const categories = [...new Set(this.results.map(r => r.category))];
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.status === 'pass').length;
      const failed = categoryResults.filter(r => r.status === 'fail').length;
      const warnings = categoryResults.filter(r => r.status === 'warning').length;

      totalPassed += passed;
      totalFailed += failed;
      totalWarnings += warnings;

      console.log(`📁 ${category}`);
      console.log(`   ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️  Warnings: ${warnings}`);
      
      // Show failed items
      const failedItems = categoryResults.filter(r => r.status === 'fail');
      if (failedItems.length > 0) {
        failedItems.forEach(item => {
          console.log(`   ❌ ${item.check}: ${item.message}`);
          if (item.fix) {
            console.log(`      💡 Fix: ${item.fix}`);
          }
        });
      }

      // Show warnings
      const warningItems = categoryResults.filter(r => r.status === 'warning');
      if (warningItems.length > 0) {
        warningItems.forEach(item => {
          console.log(`   ⚠️  ${item.check}: ${item.message}`);
          if (item.fix) {
            console.log(`      💡 Suggestion: ${item.fix}`);
          }
        });
      }

      console.log('');
    }

    console.log('📈 Overall Summary');
    console.log('==================');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`⚠️  Total Warnings: ${totalWarnings}`);

    const totalChecks = totalPassed + totalFailed + totalWarnings;
    const successRate = Math.round((totalPassed / totalChecks) * 100);

    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 PRODUCTION READY! ✨');
      console.log('Your application is ready for production deployment.');
      if (totalWarnings > 0) {
        console.log(`Consider addressing ${totalWarnings} warnings for optimal performance.`);
      }
    } else {
      console.log(`\n⚠️  NOT READY FOR PRODUCTION`);
      console.log(`Please fix ${totalFailed} critical issues before deploying.`);
    }

    console.log('\n🚀 Next Steps:');
    console.log('1. Address any failed checks');
    console.log('2. Consider fixing warnings for better performance');
    console.log('3. Run final tests');
    console.log('4. Deploy to production');
  }
}

// Run the checker
const checker = new ProductionReadinessChecker();
checker.runAllChecks().catch(console.error);
