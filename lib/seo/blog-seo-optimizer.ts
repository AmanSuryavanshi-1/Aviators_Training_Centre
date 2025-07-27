/**
 * Blog SEO Optimization Service
 * Handles automatic meta tag generation, structured data, and SEO enhancements
 */

import { BlogPost, BlogPostPreview } from '@/lib/types/blog';

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    siteName: string;
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
    creator?: string;
    site?: string;
  };
  structuredData: any;
}

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

class BlogSEOOptimizer {
  private static instance: BlogSEOOptimizer;
  private readonly baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aviatorstrainingcentre.com';
  private readonly siteName = 'Aviators Training Centre';
  private readonly twitterHandle = '@AviatorsTrain';

  private constructor() {}

  static getInstance(): BlogSEOOptimizer {
    if (!BlogSEOOptimizer.instance) {
      BlogSEOOptimizer.instance = new BlogSEOOptimizer();
    }
    return BlogSEOOptimizer.instance;
  }

  /**
   * Generate comprehensive SEO metadata for a blog post
   */
  generatePostMetadata(post: BlogPost): SEOMetadata {
    const postUrl = `${this.baseUrl}/blog/${post.slug.current}`;
    const imageUrl = this.getOptimizedImageUrl(post.image, { width: 1200, height: 630 });
    
    // Generate optimized title (max 60 characters)
    const title = this.optimizeTitle(post.title, post.seoEnhancement?.focusKeyword);
    
    // Generate optimized description (max 160 characters)
    const description = this.optimizeDescription(post.excerpt, post.seoEnhancement?.focusKeyword);
    
    // Generate keywords
    const keywords = this.generateKeywords(post);
    
    // Create structured data
    const structuredData = this.generateStructuredData(post, postUrl, imageUrl);

    return {
      title,
      description,
      keywords,
      canonicalUrl: postUrl,
      openGraph: {
        title,
        description,
        type: 'article',
        url: postUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.image?.alt || post.title,
          },
        ],
        siteName: this.siteName,
        publishedTime: post.publishedAt,
        modifiedTime: post._updatedAt,
        authors: [post.author?.name || 'Aviation Expert'],
        tags: post.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: title.length > 70 ? title.substring(0, 67) + '...' : title,
        description: description.length > 200 ? description.substring(0, 197) + '...' : description,
        images: [imageUrl],
        creator: this.twitterHandle,
        site: this.twitterHandle,
      },
      structuredData,
    };
  }

  /**
   * Generate SEO metadata for blog listing page
   */
  generateListingMetadata(category?: string, page: number = 1): SEOMetadata {
    const baseTitle = 'Aviation Blog | Expert Flight Training & Career Guidance';
    const baseDescription = 'Discover expert aviation insights, pilot training tips, and career advice from certified aviation professionals.';
    
    let title = baseTitle;
    let description = baseDescription;
    let url = `${this.baseUrl}/blog`;
    
    if (category) {
      title = `${category} Articles | ${this.siteName}`;
      description = `Expert ${category.toLowerCase()} articles and guides for aspiring pilots and aviation professionals.`;
      url += `?category=${encodeURIComponent(category)}`;
    }
    
    if (page > 1) {
      title += ` - Page ${page}`;
      url += `${category ? '&' : '?'}page=${page}`;
    }

    const structuredData = this.generateBlogListingStructuredData(url);

    return {
      title,
      description,
      keywords: [
        'aviation blog',
        'pilot training',
        'DGCA exam',
        'flight training',
        'aviation career',
        'commercial pilot license',
        'aviation courses',
        'pilot salary',
        'aviation medical',
        'flight school',
      ],
      canonicalUrl: url,
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        images: [
          {
            url: `${this.baseUrl}/images/blog-og-image.jpg`,
            width: 1200,
            height: 630,
            alt: 'Aviators Training Centre Blog',
          },
        ],
        siteName: this.siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${this.baseUrl}/images/blog-og-image.jpg`],
        site: this.twitterHandle,
      },
      structuredData,
    };
  }

  /**
   * Optimize title for SEO (max 60 characters, include focus keyword)
   */
  private optimizeTitle(originalTitle: string, focusKeyword?: string): string {
    if (!originalTitle) return 'Aviation Training Article | Aviators Training Centre';
    
    let optimizedTitle = originalTitle;
    
    // Add focus keyword if not already present and there's space
    if (focusKeyword && !originalTitle.toLowerCase().includes(focusKeyword.toLowerCase())) {
      const titleWithKeyword = `${focusKeyword}: ${originalTitle}`;
      if (titleWithKeyword.length <= 60) {
        optimizedTitle = titleWithKeyword;
      }
    }
    
    // Add brand name if there's space
    const withBrand = `${optimizedTitle} | Aviators Training Centre`;
    if (withBrand.length <= 60) {
      optimizedTitle = withBrand;
    } else if (optimizedTitle.length <= 60) {
      // Keep original if adding brand makes it too long
      optimizedTitle = optimizedTitle;
    } else {
      // Truncate if too long
      optimizedTitle = optimizedTitle.substring(0, 57) + '...';
    }
    
    return optimizedTitle;
  }

  /**
   * Optimize description for SEO (max 160 characters, include focus keyword)
   */
  private optimizeDescription(originalDescription: string, focusKeyword?: string): string {
    if (!originalDescription) return 'Expert aviation training insights and career guidance for aspiring pilots and aviation professionals.';
    
    let optimizedDescription = originalDescription;
    
    // Ensure focus keyword is included
    if (focusKeyword && !originalDescription.toLowerCase().includes(focusKeyword.toLowerCase())) {
      optimizedDescription = `${focusKeyword}: ${originalDescription}`;
    }
    
    // Truncate if too long
    if (optimizedDescription.length > 160) {
      optimizedDescription = optimizedDescription.substring(0, 157) + '...';
    }
    
    return optimizedDescription;
  }

  /**
   * Generate relevant keywords for a blog post
   */
  private generateKeywords(post: BlogPost): string[] {
    const keywords = new Set<string>();
    
    // Add explicit tags
    if (post.tags) {
      post.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    }
    
    // Add focus keyword
    if (post.seoEnhancement?.focusKeyword) {
      keywords.add(post.seoEnhancement.focusKeyword.toLowerCase());
    }
    
    // Add category
    if (post.category?.title) {
      keywords.add(post.category.title.toLowerCase());
    }
    
    // Add common aviation keywords based on content
    const aviationKeywords = [
      'aviation', 'pilot training', 'DGCA', 'commercial pilot', 'flight training',
      'aviation career', 'pilot license', 'aviation course', 'flight school',
      'pilot exam', 'aviation medical', 'airline pilot', 'CPL', 'ATPL'
    ];
    
    const content = `${post.title} ${post.excerpt}`.toLowerCase();
    aviationKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        keywords.add(keyword);
      }
    });
    
    return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Generate structured data (JSON-LD) for a blog post
   */
  private generateStructuredData(post: BlogPost, postUrl: string, imageUrl: string): any {
    const publishedDate = new Date(post.publishedAt).toISOString();
    const modifiedDate = new Date(post._updatedAt || post.publishedAt).toISOString();
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 1200,
        height: 630,
      },
      author: {
        '@type': 'Person',
        name: post.author?.name || 'Aviation Expert',
        url: post.author?.bio ? `${this.baseUrl}/about#${post.author.name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png`,
          width: 300,
          height: 100,
        },
      },
      datePublished: publishedDate,
      dateModified: modifiedDate,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
      articleSection: post.category?.title || 'Aviation Training',
      keywords: this.generateKeywords(post).join(', '),
      wordCount: this.estimateWordCount(post),
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      about: {
        '@type': 'Thing',
        name: 'Aviation Training',
        description: 'Professional pilot training and aviation career guidance',
      },
      mentions: this.generateMentions(post),
    };
  }

  /**
   * Generate structured data for blog listing page
   */
  private generateBlogListingStructuredData(url: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${this.siteName} Blog`,
      description: 'Expert aviation training insights, pilot career guidance, and DGCA exam preparation tips.',
      url: url,
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png`,
          width: 300,
          height: 100,
        },
      },
      inLanguage: 'en-US',
      about: {
        '@type': 'Thing',
        name: 'Aviation Training',
        description: 'Professional pilot training and aviation career guidance',
      },
    };
  }

  /**
   * Generate mentions for structured data
   */
  private generateMentions(post: BlogPost): any[] {
    const mentions = [];
    
    // Add course mentions if intelligent CTA routing is configured
    if (post.intelligentCTARouting?.primaryCourseTarget) {
      mentions.push({
        '@type': 'Course',
        name: post.intelligentCTARouting.primaryCourseTarget.name,
        description: 'Professional aviation training course',
      });
    }
    
    // Add common aviation entities
    const content = `${post.title} ${post.excerpt}`.toLowerCase();
    const aviationEntities = [
      { name: 'DGCA', type: 'Organization', description: 'Directorate General of Civil Aviation' },
      { name: 'Commercial Pilot License', type: 'Certification', description: 'Professional pilot certification' },
      { name: 'ATPL', type: 'Certification', description: 'Airline Transport Pilot License' },
      { name: 'CPL', type: 'Certification', description: 'Commercial Pilot License' },
    ];
    
    aviationEntities.forEach(entity => {
      if (content.includes(entity.name.toLowerCase())) {
        mentions.push({
          '@type': entity.type,
          name: entity.name,
          description: entity.description,
        });
      }
    });
    
    return mentions.slice(0, 5); // Limit to 5 mentions
  }

  /**
   * Estimate word count for structured data
   */
  private estimateWordCount(post: BlogPost): number {
    const textContent = `${post.title} ${post.excerpt}`;
    // Rough estimation - in production, you'd count actual body content
    return textContent.split(/\s+/).length * 10; // Multiply by 10 as rough estimate for full article
  }

  /**
   * Get optimized image URL
   */
  private getOptimizedImageUrl(image: any, options: { width: number; height: number }): string {
    if (!image?.asset?.url) {
      return `${this.baseUrl}/Blogs/Blog_Header.webp`;
    }
    
    return `${image.asset.url}?w=${options.width}&h=${options.height}&fit=crop&auto=format`;
  }

  /**
   * Generate sitemap entries for blog posts
   */
  generateSitemapEntries(posts: BlogPostPreview[]): SitemapEntry[] {
    return posts.map(post => ({
      url: `${this.baseUrl}/blog/${post.slug.current}`,
      lastModified: new Date(post._updatedAt || post.publishedAt).toISOString(),
      changeFrequency: 'weekly' as const,
      priority: post.featured ? 0.9 : 0.7,
    }));
  }

  /**
   * Generate robots.txt directives for blog
   */
  generateRobotsDirectives(): string[] {
    return [
      'User-agent: *',
      'Allow: /blog',
      'Allow: /blog/*',
      `Sitemap: ${this.baseUrl}/sitemap.xml`,
      '',
      '# Blog-specific rules',
      'Disallow: /blog/draft/*',
      'Disallow: /blog/preview/*',
      'Disallow: /blog/*?preview=true',
    ];
  }

  /**
   * Validate SEO metadata
   */
  validateMetadata(metadata: SEOMetadata): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Title validation
    if (!metadata.title) {
      issues.push('Title is missing');
    } else if (metadata.title.length > 60) {
      issues.push(`Title is too long (${metadata.title.length} chars, max 60)`);
    } else if (metadata.title.length < 30) {
      issues.push(`Title is too short (${metadata.title.length} chars, min 30)`);
    }
    
    // Description validation
    if (!metadata.description) {
      issues.push('Description is missing');
    } else if (metadata.description.length > 160) {
      issues.push(`Description is too long (${metadata.description.length} chars, max 160)`);
    } else if (metadata.description.length < 120) {
      issues.push(`Description is too short (${metadata.description.length} chars, min 120)`);
    }
    
    // Keywords validation
    if (metadata.keywords.length === 0) {
      issues.push('No keywords specified');
    } else if (metadata.keywords.length > 10) {
      issues.push(`Too many keywords (${metadata.keywords.length}, max 10)`);
    }
    
    // Image validation
    if (!metadata.openGraph.images[0]?.url) {
      issues.push('Open Graph image is missing');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate SEO report for a blog post
   */
  generateSEOReport(post: BlogPost): {
    score: number;
    metadata: SEOMetadata;
    validation: { isValid: boolean; issues: string[] };
    recommendations: string[];
  } {
    const metadata = this.generatePostMetadata(post);
    const validation = this.validateMetadata(metadata);
    
    let score = 100;
    const recommendations: string[] = [];
    
    // Deduct points for issues
    validation.issues.forEach(issue => {
      if (issue.includes('missing')) {
        score -= 20;
        recommendations.push(`Fix: ${issue}`);
      } else if (issue.includes('too long') || issue.includes('too short')) {
        score -= 10;
        recommendations.push(`Optimize: ${issue}`);
      } else {
        score -= 5;
        recommendations.push(`Improve: ${issue}`);
      }
    });
    
    // Additional recommendations
    if (!post.seoEnhancement?.focusKeyword) {
      score -= 15;
      recommendations.push('Add a focus keyword for better SEO targeting');
    }
    
    if (!post.tags || post.tags.length === 0) {
      score -= 10;
      recommendations.push('Add relevant tags to improve discoverability');
    }
    
    if (!post.image?.alt) {
      score -= 5;
      recommendations.push('Add alt text to the featured image');
    }
    
    return {
      score: Math.max(0, score),
      metadata,
      validation,
      recommendations,
    };
  }
}

// Export singleton instance
export const blogSEOOptimizer = BlogSEOOptimizer.getInstance();
export type { SEOMetadata, SitemapEntry };