import { PortableTextBlock } from '@portabletext/types';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Base Sanity document interface
export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

// Sanity image interface with enhanced metadata
export interface SanityImage {
  asset: SanityImageSource;
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Author interface for blog posts
export interface BlogAuthor extends SanityDocument {
  name: string;
  slug: {
    current: string;
  };
  image?: SanityImage;
  bio?: PortableTextBlock[];
  role?: string;
  credentials?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

// Course interface for CTA routing and recommendations
export interface Course extends SanityDocument {
  name: string;
  slug: {
    current: string;
  };
  category: 'technical-general' | 'technical-specific' | 'cpl-ground-school' | 'atpl-ground-school' | 'type-rating' | 'general';
  description: string;
  shortDescription: string;
  targetUrl: string;
  price?: number;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  keywords: string[];
  ctaSettings: {
    primaryButtonText: string;
    secondaryButtonText: string;
    ctaTitle: string;
    ctaMessage: string;
    urgencyText?: string;
  };
  active: boolean;
  featured?: boolean;
  image?: SanityImage;
  prerequisites?: string[];
  outcomes?: string[];
  syllabus?: PortableTextBlock[];
}

// Blog category interface with intelligent routing capabilities
export interface BlogCategory extends SanityDocument {
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  color?: string;
  image?: SanityImage;
  intelligentRouting?: {
    defaultCourse?: Course;
    keywords?: string[];
    courseMapping?: Array<{
      keywords: string[];
      targetCourse: Course;
      priority?: number;
    }>;
  };
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
}

// CTA placement configuration interface
export interface CTAPlacement {
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  ctaType: 'course-promo' | 'consultation' | 'newsletter' | 'download' | 'contact';
  targetCourse?: Course;
  customTitle?: string;
  customMessage?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal' | 'gradient';
  priority?: number;
  conditions?: {
    showAfterSeconds?: number;
    showAfterScrollPercent?: number;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
  };
}

// Intelligent CTA routing configuration
export interface IntelligentCTARouting {
  enableIntelligentRouting?: boolean;
  primaryCourseTarget?: Course;
  fallbackAction?: 'contact' | 'courses-overview' | 'consultation' | 'newsletter';
  routingRules?: Array<{
    keywords: string[];
    targetCourse: Course;
    priority: number;
  }>;
  contextualSettings?: {
    considerCategory?: boolean;
    considerTags?: boolean;
    considerReadingTime?: boolean;
    considerPublishDate?: boolean;
  };
}

// SEO enhancement interface
export interface SEOEnhancement {
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  additionalKeywords?: string[];
  canonicalUrl?: string;
  openGraphImage?: SanityImage;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: {
    articleType?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechnicalArticle' | 'EducationalArticle';
    learningResourceType?: 'Article' | 'Course' | 'Tutorial' | 'Guide' | 'Reference';
    educationalLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    timeRequired?: string;
    skillLevel?: string;
    prerequisites?: string[];
    learningOutcomes?: string[];
  };
  additionalMetaTags?: Array<{
    name: string;
    content: string;
    property?: string;
  }>;
}

// Main blog post interface with all enhancements
export interface BlogPost extends SanityDocument {
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt: string;
  body: PortableTextBlock[];
  image: SanityImage;
  category: BlogCategory;
  author: BlogAuthor;
  readingTime: number;
  featured?: boolean;
  tags?: string[];
  
  // SEO enhancements
  seoEnhancement?: SEOEnhancement;
  
  // CTA configurations
  ctaPlacements?: CTAPlacement[];
  intelligentCTARouting?: IntelligentCTARouting;
  
  // Content metadata
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  contentType?: 'tutorial' | 'guide' | 'news' | 'opinion' | 'case-study' | 'reference';
  lastModified?: string;
  
  // Engagement features
  enableComments?: boolean;
  enableSocialSharing?: boolean;
  enableNewsletterSignup?: boolean;
  
  // Analytics and performance
  viewCount?: number;
  shareCount?: number;
  engagementScore?: number;
}

// Simplified blog post interface for listings and previews
export interface BlogPostPreview {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  excerpt: string;
  image: SanityImage;
  category: {
    title: string;
    slug: {
      current: string;
    };
    color?: string;
  };
  author: {
    name: string;
    slug: {
      current: string;
    };
    image?: SanityImage;
    role?: string;
  };
  readingTime: number;
  featured?: boolean;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// Blog listing page data interface
export interface BlogListingData {
  posts: BlogPostPreview[];
  featuredPosts: BlogPostPreview[];
  categories: BlogCategory[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Blog post page data interface
export interface BlogPostPageData {
  post: BlogPost;
  relatedPosts: BlogPostPreview[];
  recommendedCourse?: Course;
  nextPost?: BlogPostPreview;
  previousPost?: BlogPostPreview;
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
}

// Search and filtering interfaces
export interface BlogSearchParams {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  contentType?: 'tutorial' | 'guide' | 'news' | 'opinion' | 'case-study' | 'reference';
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'title' | 'readingTime' | 'viewCount' | 'engagementScore';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogSearchResult {
  posts: BlogPostPreview[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  searchParams: BlogSearchParams;
  suggestions?: string[];
  facets?: {
    categories: Array<{ title: string; count: number; slug: string }>;
    tags: Array<{ title: string; count: number }>;
    authors: Array<{ name: string; count: number; slug: string }>;
    difficulties: Array<{ level: string; count: number }>;
    contentTypes: Array<{ type: string; count: number }>;
  };
}

// CTA performance tracking interfaces
export interface CTAInteraction {
  ctaId: string;
  blogPostId: string;
  blogPostSlug: string;
  ctaType: string;
  ctaPosition: string;
  targetCourse?: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  userAgent?: string;
  referrer?: string;
  conversionValue?: number;
}

export interface CTAPerformanceMetrics {
  ctaId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averageTimeToClick: number;
  bounceRate: number;
  revenueGenerated?: number;
  topPerformingPosts: Array<{
    postId: string;
    postTitle: string;
    clicks: number;
    conversions: number;
  }>;
}

// API response interfaces
export interface BlogAPIResponse<T> {
  success: boolean;
  data?: T;
  fallback?: boolean;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    cached?: boolean;
    cacheExpiry?: string;
    source?: 'sanity' | 'markdown' | 'mock';
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Error handling interfaces
export interface BlogError extends Error {
  code?: string;
  statusCode?: number;
  context?: {
    operation: string;
    params?: any;
    timestamp: string;
  };
  retryable?: boolean;
}

// Cache configuration interface
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  tags: string[];
  revalidateOnStale?: boolean;
  backgroundRefresh?: boolean;
}

// Query options interface for enhanced flexibility
export interface QueryOptions {
  cache?: CacheConfig;
  retries?: number;
  timeout?: number;
  fallback?: any;
  transform?: (data: any) => any;
  validate?: (data: any) => boolean;
}

// Sanity query builder interface for type-safe queries
export interface SanityQueryBuilder {
  select(fields: string[]): SanityQueryBuilder;
  where(condition: string): SanityQueryBuilder;
  order(field: string, direction?: 'asc' | 'desc'): SanityQueryBuilder;
  limit(count: number): SanityQueryBuilder;
  offset(count: number): SanityQueryBuilder;
  build(): string;
}

// Export utility type for making properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export utility type for making properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export utility type for blog post creation (without Sanity metadata)
export type CreateBlogPost = Omit<BlogPost, keyof SanityDocument | 'viewCount' | 'shareCount' | 'engagementScore'>;

// Export utility type for blog post updates
export type UpdateBlogPost = PartialBy<BlogPost, keyof SanityDocument>;