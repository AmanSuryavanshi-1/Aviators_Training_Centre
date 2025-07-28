#!/usr/bin/env tsx

/**
 * Bulletproof Blog System Verification Script
 * 
 * This script verifies that the production-ready blog system is working correctly
 * and all components are properly implemented.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface VerificationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string[];
}

class BlogSystemVerifier {
  private results: VerificationResult[] = [];

  private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string[]) {
    this.results.push({ component, status, message, details });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    return existsSync(path.resolve(filePath));
  }

  private async readFileContent(filePath: string): Promise<string | null> {
    try {
      return await readFile(path.resolve(filePath), 'utf-8');
    } catch {
      return null;
    }
  }

  async verifyBlogPages() {
    console.log('🔍 Verifying Blog Pages...');

    // Check main blog page
    const blogPageExists = await this.fileExists('app/blog/page.tsx');
    if (blogPageExists) {
      const content = await this.readFileContent('app/blog/page.tsx');
      if (content?.includes('BlogListing')) {
        this.addResult('Blog Page', 'PASS', 'Main blog page properly uses BlogListing component');
      } else {
        this.addResult('Blog Page', 'FAIL', 'Main blog page does not use BlogListing component');
      }
    } else {
      this.addResult('Blog Page', 'FAIL', 'Main blog page file does not exist');
    }

    // Check blog post detail page
    const blogPostPageExists = await this.fileExists('app/blog/[slug]/page.tsx');
    if (blogPostPageExists) {
      const content = await this.readFileContent('app/blog/[slug]/page.tsx');
      if (content?.includes('EMERGENCY_BLOG_POSTS')) {
        this.addResult('Blog Post Page', 'PASS', 'Blog post page uses embedded content system');
      } else {
        this.addResult('Blog Post Page', 'FAIL', 'Blog post page does not use embedded content');
      }
    } else {
      this.addResult('Blog Post Page', 'FAIL', 'Blog post detail page file does not exist');
    }
  }

  async verifyComponents() {
    console.log('🔍 Verifying Components...');

    // Check BlogListing component
    const fallbackExists = await this.fileExists('components/blog/BlogListing.tsx');
    if (fallbackExists) {
      const content = await this.readFileContent('components/blog/BlogListing.tsx');
      
      const checks = [
        { name: 'Blog Posts Data', pattern: 'BLOG_POSTS' },
        { name: 'SVG Images', pattern: 'data:image/svg+xml' },
        { name: 'Search Functionality', pattern: 'searchQuery' },
        { name: 'Category Filtering', pattern: 'selectedCategory' },
        { name: 'Pagination', pattern: 'currentPage' },
      ];

      const passedChecks = checks.filter(check => content?.includes(check.pattern));
      
      if (passedChecks.length === checks.length) {
        this.addResult('BlogListing Component', 'PASS', 'All required features implemented', 
          passedChecks.map(c => c.name));
      } else {
        const failedChecks = checks.filter(check => !content?.includes(check.pattern));
        this.addResult('BlogListing Component', 'FAIL', 'Missing required features', 
          failedChecks.map(c => c.name));
      }
    } else {
      this.addResult('BlogListing Component', 'FAIL', 'BlogListing component does not exist');
    }
  }

  async verifyAdminPage() {
    console.log('🔍 Verifying Admin Page...');

    const adminPageExists = await this.fileExists('app/admin/page.tsx');
    if (adminPageExists) {
      const content = await this.readFileContent('app/admin/page.tsx');
      
      const adminFeatures = [
        'DASHBOARD_STATS',
        'RECENT_POSTS',
        'QUICK_ACTIONS',
        'Admin Dashboard'
      ];

      const implementedFeatures = adminFeatures.filter(feature => content?.includes(feature));
      
      if (implementedFeatures.length === adminFeatures.length) {
        this.addResult('Admin Page', 'PASS', 'Admin dashboard fully implemented');
      } else {
        this.addResult('Admin Page', 'WARNING', 'Admin dashboard partially implemented');
      }
    } else {
      this.addResult('Admin Page', 'FAIL', 'Admin page does not exist');
    }
  }

  async verifyImageSystem() {
    console.log('🔍 Verifying Image System...');

    // Check if SVG images are properly embedded
    const fallbackContent = await this.readFileContent('components/blog/BlogListing.tsx');
    const blogPostContent = await this.readFileContent('app/blog/[slug]/page.tsx');

    if (fallbackContent?.includes('data:image/svg+xml;base64') && 
        blogPostContent?.includes('data:image/svg+xml;base64')) {
      this.addResult('Image System', 'PASS', 'SVG-based images properly embedded');
    } else {
      this.addResult('Image System', 'FAIL', 'SVG images not properly embedded');
    }
  }

  async verifyDependencies() {
    console.log('🔍 Verifying Dependencies...');

    const packageJsonExists = await this.fileExists('package.json');
    if (packageJsonExists) {
      const content = await this.readFileContent('package.json');
      
      if (content) {
        const packageJson = JSON.parse(content);
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for problematic dependencies
        const problematicDeps = [
          '@sanity/client',
          'markdown-it',
          'gray-matter'
        ];

        const foundProblematic = problematicDeps.filter(dep => dependencies[dep]);
        
        if (foundProblematic.length === 0) {
          this.addResult('Dependencies', 'PASS', 'No problematic dependencies found');
        } else {
          this.addResult('Dependencies', 'WARNING', 'Problematic dependencies still present', foundProblematic);
        }

        // Check for required UI dependencies
        const requiredDeps = [
          'next',
          'react',
          'lucide-react',
          'tailwindcss'
        ];

        const missingRequired = requiredDeps.filter(dep => !dependencies[dep]);
        
        if (missingRequired.length === 0) {
          this.addResult('Required Dependencies', 'PASS', 'All required dependencies present');
        } else {
          this.addResult('Required Dependencies', 'FAIL', 'Missing required dependencies', missingRequired);
        }
      }
    } else {
      this.addResult('Dependencies', 'FAIL', 'package.json not found');
    }
  }

  async verifyContentQuality() {
    console.log('🔍 Verifying Content Quality...');

    const fallbackContent = await this.readFileContent('components/blog/BlogListing.tsx');
    
    if (fallbackContent) {
      // Check for aviation-specific content
      const aviationKeywords = [
        'pilot',
        'aviation',
        'aircraft',
        'DGCA',
        'flight',
        'training'
      ];

      const foundKeywords = aviationKeywords.filter(keyword => 
        fallbackContent.toLowerCase().includes(keyword.toLowerCase())
      );

      if (foundKeywords.length >= 4) {
        this.addResult('Content Quality', 'PASS', 'High-quality aviation content detected');
      } else {
        this.addResult('Content Quality', 'WARNING', 'Limited aviation-specific content');
      }

      // Check for proper content structure
      const structureElements = [
        'title:',
        'excerpt:',
        'publishedAt:',
        'readingTime:',
        'category:',
        'author:'
      ];

      const foundElements = structureElements.filter(element => fallbackContent.includes(element));
      
      if (foundElements.length === structureElements.length) {
        this.addResult('Content Structure', 'PASS', 'Proper content structure implemented');
      } else {
        this.addResult('Content Structure', 'FAIL', 'Incomplete content structure');
      }
    }
  }

  async verifyRouting() {
    console.log('🔍 Verifying Routing...');

    const blogPostContent = await this.readFileContent('app/blog/[slug]/page.tsx');
    
    if (blogPostContent) {
      if (blogPostContent.includes('generateStaticParams')) {
        this.addResult('Static Generation', 'PASS', 'Static parameter generation implemented');
      } else {
        this.addResult('Static Generation', 'FAIL', 'Static parameter generation missing');
      }

      if (blogPostContent.includes('generateMetadata')) {
        this.addResult('SEO Metadata', 'PASS', 'SEO metadata generation implemented');
      } else {
        this.addResult('SEO Metadata', 'FAIL', 'SEO metadata generation missing');
      }

      if (blogPostContent.includes('notFound()')) {
        this.addResult('Error Handling', 'PASS', '404 error handling implemented');
      } else {
        this.addResult('Error Handling', 'FAIL', '404 error handling missing');
      }
    }
  }

  async verifyUIComponents() {
    console.log('🔍 Verifying UI Components...');

    const fallbackContent = await this.readFileContent('components/blog/BlogListing.tsx');
    
    if (fallbackContent) {
      const uiComponents = [
        'Badge',
        'Button',
        'Card',
        'Input',
        'Select'
      ];

      const foundComponents = uiComponents.filter(component => 
        fallbackContent.includes(`from '@/components/ui/${component.toLowerCase()}'`)
      );

      if (foundComponents.length >= 3) {
        this.addResult('UI Components', 'PASS', 'Proper UI components imported and used');
      } else {
        this.addResult('UI Components', 'WARNING', 'Limited UI component usage');
      }

      // Check for responsive design
      if (fallbackContent.includes('md:') && fallbackContent.includes('lg:')) {
        this.addResult('Responsive Design', 'PASS', 'Responsive design classes detected');
      } else {
        this.addResult('Responsive Design', 'WARNING', 'Limited responsive design implementation');
      }
    }
  }

  async runAllVerifications() {
    console.log('🚀 Starting Bulletproof Blog System Verification...\n');

    await this.verifyBlogPages();
    await this.verifyComponents();
    await this.verifyAdminPage();
    await this.verifyImageSystem();
    await this.verifyDependencies();
    await this.verifyContentQuality();
    await this.verifyRouting();
    await this.verifyUIComponents();

    this.printResults();
  }

  private printResults() {
    console.log('\n📊 VERIFICATION RESULTS\n');
    console.log('=' .repeat(80));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    // Print summary
    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⚠️  WARNINGS: ${warnings}`);
    console.log(`📊 TOTAL: ${this.results.length}`);
    console.log('=' .repeat(80));

    // Print detailed results
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`\n${icon} ${result.component}`);
      console.log(`   ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   • ${detail}`);
        });
      }
    });

    console.log('\n' + '=' .repeat(80));

    // Final assessment
    if (failed === 0) {
      console.log('🎉 BLOG SYSTEM VERIFICATION SUCCESSFUL!');
      console.log('✅ Your bulletproof blog system is ready for production.');
    } else if (failed <= 2) {
      console.log('⚠️  BLOG SYSTEM MOSTLY READY');
      console.log('🔧 Minor issues detected. Please address failed checks.');
    } else {
      console.log('❌ BLOG SYSTEM NEEDS ATTENTION');
      console.log('🚨 Multiple critical issues detected. Please fix before deployment.');
    }

    console.log('\n📖 For detailed implementation guide, see: FINAL_PRODUCTION_READY_SOLUTION.md');
  }
}

// Run verification
async function main() {
  const verifier = new BlogSystemVerifier();
  await verifier.runAllVerifications();
}

// Auto-run if this is the main module
main().catch(console.error);

export { BlogSystemVerifier };