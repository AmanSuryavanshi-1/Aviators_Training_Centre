#!/usr/bin/env tsx

/**
 * Migration Validation Script
 * 
 * This script validates that migrated content in Sanity matches
 * the original markdown files in terms of structure and content.
 * 
 * Usage: npx tsx scripts/validate-migration.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from 'next-sanity';

// Sanity client configuration
const client = createClient({
  projectId: "3u4fa9kl",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

interface ValidationResult {
  slug: string;
  title: string;
  status: 'passed' | 'failed' | 'warning';
  issues: string[];
  details: {
    titleMatch: boolean;
    excerptMatch: boolean;
    categoryMatch: boolean;
    authorMatch: boolean;
    featuredMatch: boolean;
    contentStructureMatch: boolean;
    readingTimeReasonable: boolean;
  };
}

class MigrationValidator {
  private validationResults: ValidationResult[] = [];
  private totalPosts = 0;
  private passedPosts = 0;
  private failedPosts = 0;
  private warningPosts = 0;

  constructor() {
    console.log('🔍 Starting Migration Validation...\n');
  }

  /**
   * Main validation function
   */
  async validate(): Promise<void> {
    try {
      // Read original markdown files
      const markdownPosts = await this.readMarkdownFiles();
      this.totalPosts = markdownPosts.length;

      console.log(`📄 Validating ${markdownPosts.length} posts...\n`);

      // Validate each post
      for (const markdownPost of markdownPosts) {
        await this.validatePost(markdownPost);
      }

      // Generate validation report
      this.generateValidationReport();

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Read and parse markdown files
   */
  private async readMarkdownFiles(): Promise<any[]> {
    const markdownDir = path.join(process.cwd(), 'content/blog');
    const posts: any[] = [];

    try {
      const files = fs.readdirSync(markdownDir).filter(file => file.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(markdownDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Generate slug from filename
        const slug = file.replace('.md', '');

        posts.push({
          slug,
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          category: data.category,
          coverImage: data.coverImage,
          author: data.author,
          featured: data.featured || false,
          content,
          originalFile: file,
        });
      }

      return posts;
    } catch (error) {
      console.error('❌ Error reading markdown files:', error);
      throw error;
    }
  }

  /**
   * Validate a single post
   */
  private async validatePost(markdownPost: any): Promise<void> {
    console.log(`🔍 Validating: ${markdownPost.title}`);

    const result: ValidationResult = {
      slug: markdownPost.slug,
      title: markdownPost.title,
      status: 'passed',
      issues: [],
      details: {
        titleMatch: false,
        excerptMatch: false,
        categoryMatch: false,
        authorMatch: false,
        featuredMatch: false,
        contentStructureMatch: false,
        readingTimeReasonable: false,
      }
    };

    try {
      // Fetch the corresponding Sanity post
      const sanityPost = await client.fetch(`
        *[_type == "post" && slug.current == $slug][0] {
          title,
          slug,
          excerpt,
          body,
          category->{title},
          author->{name},
          featured,
          readingTime,
          publishedAt,
          seoTitle,
          seoDescription,
          focusKeyword
        }
      `, { slug: markdownPost.slug });

      if (!sanityPost) {
        result.status = 'failed';
        result.issues.push('Post not found in Sanity CMS');
        this.validationResults.push(result);
        console.log(`❌ Post not found in Sanity: ${markdownPost.title}`);
        return;
      }

      // Validate title
      result.details.titleMatch = markdownPost.title === sanityPost.title;
      if (!result.details.titleMatch) {
        result.issues.push(`Title mismatch: "${markdownPost.title}" vs "${sanityPost.title}"`);
      }

      // Validate excerpt
      result.details.excerptMatch = markdownPost.excerpt === sanityPost.excerpt;
      if (!result.details.excerptMatch) {
        result.issues.push('Excerpt content differs');
      }

      // Validate category
      result.details.categoryMatch = markdownPost.category === sanityPost.category?.title;
      if (!result.details.categoryMatch) {
        result.issues.push(`Category mismatch: "${markdownPost.category}" vs "${sanityPost.category?.title}"`);
      }

      // Validate author
      result.details.authorMatch = markdownPost.author.name === sanityPost.author?.name;
      if (!result.details.authorMatch) {
        result.issues.push(`Author mismatch: "${markdownPost.author.name}" vs "${sanityPost.author?.name}"`);
      }

      // Validate featured status
      result.details.featuredMatch = markdownPost.featured === sanityPost.featured;
      if (!result.details.featuredMatch) {
        result.issues.push(`Featured status mismatch: ${markdownPost.featured} vs ${sanityPost.featured}`);
      }

      // Validate content structure
      const contentValidation = this.validateContentStructure(markdownPost.content, sanityPost.body);
      result.details.contentStructureMatch = contentValidation.isValid;
      if (!contentValidation.isValid) {
        result.issues.push(...contentValidation.issues);
      }

      // Validate reading time (should be reasonable)
      const expectedReadingTime = Math.ceil(markdownPost.content.split(' ').length / 200); // ~200 words per minute
      const readingTimeDiff = Math.abs(sanityPost.readingTime - expectedReadingTime);
      result.details.readingTimeReasonable = readingTimeDiff <= 2; // Allow 2 minute difference
      if (!result.details.readingTimeReasonable) {
        result.issues.push(`Reading time seems off: ${sanityPost.readingTime} minutes (expected ~${expectedReadingTime})`);
      }

      // Determine overall status
      const criticalIssues = [
        !result.details.titleMatch,
        !result.details.categoryMatch,
        !result.details.authorMatch,
        !result.details.contentStructureMatch
      ].filter(Boolean).length;

      const minorIssues = [
        !result.details.excerptMatch,
        !result.details.featuredMatch,
        !result.details.readingTimeReasonable
      ].filter(Boolean).length;

      if (criticalIssues > 0) {
        result.status = 'failed';
        this.failedPosts++;
      } else if (minorIssues > 0) {
        result.status = 'warning';
        this.warningPosts++;
      } else {
        result.status = 'passed';
        this.passedPosts++;
      }

      this.validationResults.push(result);

      // Log result
      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${markdownPost.title} - ${result.status.toUpperCase()}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`    • ${issue}`));
      }

    } catch (error) {
      result.status = 'failed';
      result.issues.push(`Validation error: ${error}`);
      this.validationResults.push(result);
      this.failedPosts++;
      console.log(`❌ Error validating ${markdownPost.title}:`, error);
    }
  }

  /**
   * Convert Portable Text to plain text for comparison
   */
  private portableTextToPlainText(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks
      .filter(block => block._type === 'block')
      .map(block => {
        if (block.children && Array.isArray(block.children)) {
          return block.children
            .filter((child: any) => child._type === 'span')
            .map((child: any) => child.text || '')
            .join('');
        }
        return '';
      })
      .join(' ');
  }

  /**
   * Validate content structure between markdown and Portable Text
   */
  private validateContentStructure(markdownContent: string, portableTextBody: any[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    try {
      // Convert Portable Text to plain text for comparison
      const sanityPlainText = this.portableTextToPlainText(portableTextBody);

      // Basic content length comparison (should be similar)
      const markdownLength = markdownContent.replace(/[#*\[\]()]/g, '').length;
      const sanityLength = sanityPlainText.length;
      const lengthDiff = Math.abs(markdownLength - sanityLength) / markdownLength;

      if (lengthDiff > 0.2) { // More than 20% difference
        issues.push(`Content length differs significantly: ${markdownLength} vs ${sanityLength} characters`);
      }

      // Check for presence of key headings
      const markdownHeadings = markdownContent.match(/^#+\s+(.+)$/gm) || [];
      const sanityHeadings = portableTextBody.filter(block => 
        block._type === 'block' && ['h2', 'h3', 'h4'].includes(block.style)
      );

      if (markdownHeadings.length > 0 && sanityHeadings.length === 0) {
        issues.push('Headings not properly converted from markdown');
      }

      // Check for links (basic check)
      const markdownLinks = (markdownContent.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
      const sanityLinks = portableTextBody.reduce((count, block) => {
        if (block._type === 'block' && block.markDefs) {
          return count + block.markDefs.filter((mark: any) => mark._type === 'link').length;
        }
        return count;
      }, 0);

      if (markdownLinks > 0 && sanityLinks === 0) {
        issues.push('Links may not have been properly converted');
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      return {
        isValid: false,
        issues: [`Content structure validation error: ${error}`]
      };
    }
  }

  /**
   * Generate comprehensive validation report
   */
  private generateValidationReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION VALIDATION REPORT');
    console.log('='.repeat(60));

    // Summary statistics
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total Posts: ${this.totalPosts}`);
    console.log(`✅ Passed: ${this.passedPosts} (${Math.round(this.passedPosts / this.totalPosts * 100)}%)`);
    console.log(`⚠️  Warnings: ${this.warningPosts} (${Math.round(this.warningPosts / this.totalPosts * 100)}%)`);
    console.log(`❌ Failed: ${this.failedPosts} (${Math.round(this.failedPosts / this.totalPosts * 100)}%)`);

    // Detailed results
    if (this.failedPosts > 0) {
      console.log(`\n❌ FAILED POSTS:`);
      this.validationResults
        .filter(result => result.status === 'failed')
        .forEach(result => {
          console.log(`\n  • ${result.title} (${result.slug})`);
          result.issues.forEach(issue => console.log(`    - ${issue}`));
        });
    }

    if (this.warningPosts > 0) {
      console.log(`\n⚠️  POSTS WITH WARNINGS:`);
      this.validationResults
        .filter(result => result.status === 'warning')
        .forEach(result => {
          console.log(`\n  • ${result.title} (${result.slug})`);
          result.issues.forEach(issue => console.log(`    - ${issue}`));
        });
    }

    // Validation details breakdown
    console.log(`\n🔍 VALIDATION DETAILS:`);
    const detailsBreakdown = {
      titleMatch: 0,
      excerptMatch: 0,
      categoryMatch: 0,
      authorMatch: 0,
      featuredMatch: 0,
      contentStructureMatch: 0,
      readingTimeReasonable: 0,
    };

    this.validationResults.forEach(result => {
      Object.keys(detailsBreakdown).forEach(key => {
        if (result.details[key as keyof typeof detailsBreakdown]) {
          detailsBreakdown[key as keyof typeof detailsBreakdown]++;
        }
      });
    });

    Object.entries(detailsBreakdown).forEach(([key, count]) => {
      const percentage = Math.round(count / this.totalPosts * 100);
      const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      console.log(`  ${status} ${key}: ${count}/${this.totalPosts} (${percentage}%)`);
    });

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    
    if (this.failedPosts > 0) {
      console.log(`  • Review and fix ${this.failedPosts} failed migrations`);
      console.log(`  • Check Sanity schema configuration for missing fields`);
      console.log(`  • Verify author and category references are correct`);
    }

    if (this.warningPosts > 0) {
      console.log(`  • Review ${this.warningPosts} posts with warnings`);
      console.log(`  • Consider manual content review for complex formatting`);
    }

    if (detailsBreakdown.contentStructureMatch < this.totalPosts) {
      console.log(`  • Improve markdown to Portable Text conversion`);
      console.log(`  • Consider using a more sophisticated markdown parser`);
    }

    console.log(`\n🎯 NEXT STEPS:`);
    if (this.passedPosts === this.totalPosts) {
      console.log(`  ✅ All posts validated successfully!`);
      console.log(`  • You can safely remove markdown files`);
      console.log(`  • Update import references in the codebase`);
    } else {
      console.log(`  • Fix critical issues in failed posts`);
      console.log(`  • Re-run migration for failed posts`);
      console.log(`  • Validate again before removing markdown files`);
    }

    console.log(`\n📝 VALIDATION LOG SAVED`);
    this.saveValidationLog();
  }

  /**
   * Save detailed validation log to file
   */
  private saveValidationLog(): void {
    const logData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.totalPosts,
        passed: this.passedPosts,
        warnings: this.warningPosts,
        failed: this.failedPosts,
      },
      results: this.validationResults,
    };

    const logPath = path.join(process.cwd(), 'migration-validation-log.json');
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`  • Detailed log saved to: ${logPath}`);
  }
}

// Run validation if this script is executed directly
if (process.argv[1]?.includes('validate-migration.ts')) {
  const validator = new MigrationValidator();
  validator.validate().catch(console.error);
}

export { MigrationValidator };