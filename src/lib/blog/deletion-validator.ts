/**
 * Deletion Validator
 * 
 * Comprehensive pre-deletion validation system that checks for issues
 * before attempting deletion to prevent failures and provide better UX.
 */

import { BlogPost, BlogAPIResponse } from '@/lib/types/blog';
import { sanityBlogService } from './sanity-blog-service';

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (post: BlogPost, context: ValidationContext) => Promise<ValidationResult>;
}

export interface ValidationContext {
  userId?: string;
  userRole?: string;
  skipWarnings?: boolean;
  skipPermissionChecks?: boolean;
  allowFeaturedDeletion?: boolean;
  allowHighEngagementDeletion?: boolean;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: unknown;
  suggestedAction?: string;
  canProceed?: boolean;
}

export interface PreFlightCheckResult {
  valid: boolean;
  canProceed: boolean;
  postExists: boolean;
  postData?: BlogPost;
  errors: Array<{
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestedAction?: string;
  }>;
  warnings: Array<{
    rule: string;
    message: string;
    details?: unknown;
    suggestedAction?: string;
  }>;
  info: Array<{
    rule: string;
    message: string;
    details?: unknown;
  }>;
  metadata: {
    validationTime: number;
    rulesExecuted: number;
    postTitle?: string;
    postSlug?: string;
    publishedAt?: string;
    category?: string;
  };
}

export interface DependencyCheck {
  type: 'reference' | 'link' | 'media' | 'category';
  description: string;
  count: number;
  items?: Array<{
    id: string;
    title: string;
    type: string;
  }>;
}

/**
 * Deletion validation service
 */
export class DeletionValidator {
  private static instance: DeletionValidator;
  private validationRules: Map<string, ValidationRule> = new Map();

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): DeletionValidator {
    if (!DeletionValidator.instance) {
      DeletionValidator.instance = new DeletionValidator();
    }
    return DeletionValidator.instance;
  }

  /**
   * Perform comprehensive pre-flight checks
   */
  async performPreFlightChecks(
    identifier: string,
    context: ValidationContext = {}
  ): Promise<PreFlightCheckResult> {
    const startTime = Date.now();
    
    const result: PreFlightCheckResult = {
      valid: false,
      canProceed: false,
      postExists: false,
      errors: [],
      warnings: [],
      info: [],
      metadata: {
        validationTime: 0,
        rulesExecuted: 0
      }
    };

    try {
      console.log('🔍 Starting pre-flight checks for:', identifier);

      // Step 1: Check if post exists and get data
      const postData = await this.getPostData(identifier);
      if (!postData) {
        result.errors.push({
          rule: 'post_existence',
          message: 'Post not found',
          severity: 'error',
          suggestedAction: 'Verify the post ID or slug is correct'
        });
        result.metadata.validationTime = Date.now() - startTime;
        return result;
      }

      result.postExists = true;
      result.postData = postData;
      result.metadata.postTitle = postData.title;
      result.metadata.postSlug = postData.slug?.current;
      result.metadata.publishedAt = postData.publishedAt;
      result.metadata.category = postData.category?.title;

      // Step 2: Run all validation rules
      const rules = Array.from(this.validationRules.values());
      let rulesExecuted = 0;

      for (const rule of rules) {
        try {
          const ruleResult = await rule.check(postData, context);
          rulesExecuted++;

          if (!ruleResult.passed) {
            const issue = {
              rule: rule.name,
              message: ruleResult.message,
              severity: rule.severity,
              suggestedAction: ruleResult.suggestedAction
            };

            switch (rule.severity) {
              case 'error':
                result.errors.push(issue);
                break;
              case 'warning':
                result.warnings.push({
                  rule: rule.name,
                  message: ruleResult.message,
                  details: ruleResult.details,
                  suggestedAction: ruleResult.suggestedAction
                });
                break;
              case 'info':
                result.info.push({
                  rule: rule.name,
                  message: ruleResult.message,
                  details: ruleResult.details
                });
                break;
            }
          }
        } catch (error) {
          console.error(`Error executing validation rule ${rule.name}:`, error);
          result.warnings.push({
            rule: rule.name,
            message: `Validation rule failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
            suggestedAction: 'Contact support if this persists'
          });
        }
      }

      result.metadata.rulesExecuted = rulesExecuted;

      // Step 3: Determine overall validation result
      result.valid = result.errors.length === 0;
      result.canProceed = result.valid && (
        context.skipWarnings || 
        result.warnings.length === 0 ||
        result.warnings.every(w => this.isWarningOverridable(w.rule, context))
      );

      result.metadata.validationTime = Date.now() - startTime;

      console.log('✅ Pre-flight checks completed:', {
        identifier,
        valid: result.valid,
        canProceed: result.canProceed,
        errors: result.errors.length,
        warnings: result.warnings.length,
        info: result.info.length,
        duration: result.metadata.validationTime
      });

      return result;

    } catch (error) {
      console.error('Error during pre-flight checks:', error);
      result.errors.push({
        rule: 'system_error',
        message: `Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        suggestedAction: 'Try again or contact support'
      });
      result.metadata.validationTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Check for dependencies that might be affected by deletion
   */
  async checkDependencies(postId: string): Promise<DependencyCheck[]> {
    const dependencies: DependencyCheck[] = [];

    try {
      // Check for references from other posts
      const referencingPosts = await this.findReferencingPosts(postId);
      if (referencingPosts.length > 0) {
        dependencies.push({
          type: 'reference',
          description: 'Other blog posts reference this post',
          count: referencingPosts.length,
          items: referencingPosts.map(post => ({
            id: post._id,
            title: post.title,
            type: 'blog_post'
          }))
        });
      }

      // Check for external links (mock implementation)
      const externalLinks = await this.findExternalLinks(postId);
      if (externalLinks.length > 0) {
        dependencies.push({
          type: 'link',
          description: 'External sources link to this post',
          count: externalLinks.length,
          items: externalLinks.map(link => ({
            id: link.url,
            title: link.title || link.url,
            type: 'external_link'
          }))
        });
      }

      // Check for media usage
      const mediaUsage = await this.checkMediaUsage(postId);
      if (mediaUsage.length > 0) {
        dependencies.push({
          type: 'media',
          description: 'Media files are used by this post',
          count: mediaUsage.length,
          items: mediaUsage.map(media => ({
            id: media.id,
            title: media.filename,
            type: 'media_file'
          }))
        });
      }

    } catch (error) {
      console.error('Error checking dependencies:', error);
    }

    return dependencies;
  }

  /**
   * Validate bulk deletion request
   */
  async validateBulkDeletion(
    identifiers: string[],
    context: ValidationContext = {}
  ): Promise<{
    valid: boolean;
    canProceed: boolean;
    results: Array<{
      identifier: string;
      result: PreFlightCheckResult;
    }>;
    summary: {
      totalPosts: number;
      validPosts: number;
      errorCount: number;
      warningCount: number;
      featuredPosts: number;
      highEngagementPosts: number;
    };
  }> {
    console.log(`🔍 Validating bulk deletion of ${identifiers.length} posts`);

    const results: Array<{ identifier: string; result: PreFlightCheckResult }> = [];
    const summary = {
      totalPosts: identifiers.length,
      validPosts: 0,
      errorCount: 0,
      warningCount: 0,
      featuredPosts: 0,
      highEngagementPosts: 0
    };

    // Validate each post
    for (const identifier of identifiers) {
      const result = await this.performPreFlightChecks(identifier, context);
      results.push({ identifier, result });

      if (result.valid) {
        summary.validPosts++;
      }

      summary.errorCount += result.errors.length;
      summary.warningCount += result.warnings.length;

      if (result.postData?.featured) {
        summary.featuredPosts++;
      }

      // Check for high engagement (mock check)
      if (result.postData?.viewCount && result.postData.viewCount > 1000) {
        summary.highEngagementPosts++;
      }
    }

    const valid = summary.errorCount === 0;
    const canProceed = valid && (
      context.skipWarnings ||
      summary.warningCount === 0 ||
      (context.allowFeaturedDeletion && context.allowHighEngagementDeletion)
    );

    console.log('✅ Bulk validation completed:', {
      totalPosts: summary.totalPosts,
      validPosts: summary.validPosts,
      valid,
      canProceed
    });

    return {
      valid,
      canProceed,
      results,
      summary
    };
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.name, rule);
    console.log(`📋 Added validation rule: ${rule.name}`);
  }

  /**
   * Remove validation rule
   */
  removeValidationRule(ruleName: string): boolean {
    const removed = this.validationRules.delete(ruleName);
    if (removed) {
      console.log(`🗑️ Removed validation rule: ${ruleName}`);
    }
    return removed;
  }

  /**
   * Get all validation rules
   */
  getValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values());
  }

  /**
   * Private helper methods
   */
  private async getPostData(identifier: string): Promise<BlogPost | null> {
    try {
      const isId = identifier.includes('_') || identifier.length > 20;
      const response: BlogAPIResponse<BlogPost> = isId
        ? await sanityBlogService.getPostById(identifier)
        : await sanityBlogService.getPostBySlug(identifier);

      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Error fetching post data:', error);
      return null;
    }
  }

  private async findReferencingPosts(postId: string): Promise<BlogPost[]> {
    // Mock implementation - in real app, query Sanity for references
    try {
      // This would be a Sanity query to find posts that reference this post
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error finding referencing posts:', error);
      return [];
    }
  }

  private async findExternalLinks(postId: string): Promise<Array<{ url: string; title?: string }>> {
    // Mock implementation - in real app, check analytics or external tools
    return [];
  }

  private async checkMediaUsage(postId: string): Promise<Array<{ id: string; filename: string }>> {
    // Mock implementation - in real app, check media references
    return [];
  }

  private isWarningOverridable(ruleName: string, context: ValidationContext): boolean {
    switch (ruleName) {
      case 'featured_post':
        return context.allowFeaturedDeletion === true;
      case 'high_engagement':
        return context.allowHighEngagementDeletion === true;
      default:
        return context.skipWarnings === true;
    }
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Rule: Check if post is published
    this.addValidationRule({
      name: 'post_published',
      description: 'Verify post is published',
      severity: 'info',
      check: async (post: BlogPost) => ({
        passed: true,
        message: post.publishedAt 
          ? `Post published on ${new Date(post.publishedAt).toLocaleDateString()}`
          : 'Post is not published',
        details: { publishedAt: post.publishedAt }
      })
    });

    // Rule: Check if post is featured
    this.addValidationRule({
      name: 'featured_post',
      description: 'Warn about deleting featured posts',
      severity: 'warning',
      check: async (post: BlogPost) => ({
        passed: !post.featured,
        message: post.featured 
          ? 'This is a featured post - deletion will affect homepage display'
          : 'Post is not featured',
        suggestedAction: post.featured 
          ? 'Consider unfeaturing the post first or confirm deletion'
          : undefined,
        canProceed: true
      })
    });

    // Rule: Check post age
    this.addValidationRule({
      name: 'post_age',
      description: 'Check post age for recent posts',
      severity: 'warning',
      check: async (post: BlogPost) => {
        const publishedDate = new Date(post.publishedAt);
        const daysSincePublished = Math.floor(
          (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isRecent = daysSincePublished < 7;
        return {
          passed: !isRecent,
          message: isRecent
            ? `Post was published ${daysSincePublished} days ago - consider if deletion is necessary`
            : `Post is ${daysSincePublished} days old`,
          details: { daysSincePublished },
          suggestedAction: isRecent
            ? 'Consider editing instead of deleting recent content'
            : undefined
        };
      }
    });

    // Rule: Check for high engagement (mock)
    this.addValidationRule({
      name: 'high_engagement',
      description: 'Warn about deleting high-engagement posts',
      severity: 'warning',
      check: async (post: BlogPost) => {
        const viewCount = post.viewCount || 0;
        const isHighEngagement = viewCount > 1000;

        return {
          passed: !isHighEngagement,
          message: isHighEngagement
            ? `Post has high engagement (${viewCount} views) - deletion may impact SEO`
            : `Post has ${viewCount} views`,
          details: { viewCount },
          suggestedAction: isHighEngagement
            ? 'Consider archiving or redirecting instead of deleting'
            : undefined
        };
      }
    });

    // Rule: Check category impact
    this.addValidationRule({
      name: 'category_impact',
      description: 'Check if deletion affects category',
      severity: 'info',
      check: async (post: BlogPost) => ({
        passed: true,
        message: `Post belongs to category: ${post.category?.title || 'Unknown'}`,
        details: { 
          categoryTitle: post.category?.title,
          categorySlug: post.category?.slug?.current
        }
      })
    });

    // Rule: Check for required fields
    this.addValidationRule({
      name: 'required_fields',
      description: 'Verify post has required fields',
      severity: 'error',
      check: async (post: BlogPost) => {
        const missingFields: string[] = [];
        
        if (!post.title) missingFields.push('title');
        if (!post.slug?.current) missingFields.push('slug');
        if (!post._id) missingFields.push('_id');

        return {
          passed: missingFields.length === 0,
          message: missingFields.length > 0
            ? `Post is missing required fields: ${missingFields.join(', ')}`
            : 'All required fields are present',
          details: { missingFields },
          suggestedAction: missingFields.length > 0
            ? 'Post data may be corrupted - contact support'
            : undefined
        };
      }
    });

    console.log(`📋 Initialized ${this.validationRules.size} default validation rules`);
  }
}

// Export singleton instance
export const deletionValidator = DeletionValidator.getInstance();
