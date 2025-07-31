/**
 * ISR (Incremental Static Regeneration) configuration
 * Centralized configuration for Next.js ISR settings across the application
 */

export interface ISRConfig {
  revalidate: number | false
  tags?: string[]
  description: string
}

// ISR configurations for different page types
export const ISR_CONFIGS = {
  // Home page - frequently updated with featured content
  home: {
    revalidate: 1800, // 30 minutes
    tags: ['featured-posts', 'home-content'],
    description: 'Home page with featured posts and dynamic content'
  } as ISRConfig,

  // Blog listing page - updated when new posts are published
  blogListing: {
    revalidate: 3600, // 1 hour
    tags: ['blog-posts', 'blog-listing'],
    description: 'Blog listing page with pagination and filtering'
  } as ISRConfig,

  // Individual blog posts - longer cache for stable content
  blogPost: {
    revalidate: 7200, // 2 hours
    tags: ['blog-posts'],
    description: 'Individual blog post pages with content and comments'
  } as ISRConfig,

  // Category pages - updated when posts in category change
  categoryPage: {
    revalidate: 3600, // 1 hour
    tags: ['blog-posts', 'categories'],
    description: 'Category-specific blog post listings'
  } as ISRConfig,

  // Author pages - updated when author posts change
  authorPage: {
    revalidate: 3600, // 1 hour
    tags: ['blog-posts', 'authors'],
    description: 'Author-specific blog post listings'
  } as ISRConfig,

  // Course pages - less frequent updates
  coursePage: {
    revalidate: 14400, // 4 hours
    tags: ['courses'],
    description: 'Course detail pages with curriculum and pricing'
  } as ISRConfig,

  // Static pages - very infrequent updates
  staticPage: {
    revalidate: 86400, // 24 hours
    tags: ['static-content'],
    description: 'Static pages like About, Contact, etc.'
  } as ISRConfig,

  // Admin dashboard - no ISR (always fresh)
  adminDashboard: {
    revalidate: false,
    description: 'Admin dashboard with real-time data'
  } as ISRConfig,

  // API routes - short cache for dynamic data
  apiRoute: {
    revalidate: 300, // 5 minutes
    description: 'API routes with dynamic data'
  } as ISRConfig
} as const

// Helper function to get ISR config by page type
export function getISRConfig(pageType: keyof typeof ISR_CONFIGS): ISRConfig {
  return ISR_CONFIGS[pageType]
}

// Cache tags for different content types
export const CACHE_TAGS = {
  // Blog-related tags
  BLOG_POSTS: 'blog-posts',
  BLOG_POST: (slug: string) => `post-${slug}`,
  BLOG_LISTING: 'blog-listing',
  FEATURED_POSTS: 'featured-posts',
  
  // Taxonomy tags
  CATEGORIES: 'categories',
  CATEGORY: (slug: string) => `category-${slug}`,
  AUTHORS: 'authors',
  AUTHOR: (slug: string) => `author-${slug}`,
  TAGS: 'tags',
  TAG: (slug: string) => `tag-${slug}`,
  
  // Course-related tags
  COURSES: 'courses',
  COURSE: (slug: string) => `course-${slug}`,
  
  // General content tags
  HOME_CONTENT: 'home-content',
  STATIC_CONTENT: 'static-content',
  NAVIGATION: 'navigation',
  
  // Analytics tags
  ANALYTICS: 'analytics',
  PERFORMANCE: 'performance'
} as const

// Revalidation utilities
export class ISRManager {
  /**
   * Get revalidation time based on content type and update frequency
   */
  static getRevalidationTime(contentType: string, updateFrequency: 'high' | 'medium' | 'low' = 'medium'): number {
    const baseRevalidation = {
      high: 900,    // 15 minutes
      medium: 3600, // 1 hour
      low: 14400    // 4 hours
    }
    
    const contentMultipliers = {
      'blog-post': 2,     // Blog posts change less frequently
      'blog-listing': 1,  // Listings change with new posts
      'home': 0.5,        // Home page changes frequently
      'course': 4,        // Courses change infrequently
      'static': 24        // Static pages rarely change
    }
    
    const multiplier = contentMultipliers[contentType as keyof typeof contentMultipliers] || 1
    return baseRevalidation[updateFrequency] * multiplier
  }
  
  /**
   * Generate cache tags for a blog post
   */
  static getBlogPostTags(post: any): string[] {
    const tags = [
      CACHE_TAGS.BLOG_POSTS,
      CACHE_TAGS.BLOG_POST(post.slug.current)
    ]
    
    if (post.category) {
      tags.push(CACHE_TAGS.CATEGORY(post.category.slug.current))
    }
    
    if (post.author) {
      tags.push(CACHE_TAGS.AUTHOR(post.author.slug.current))
    }
    
    if (post.tags) {
      post.tags.forEach((tag: any) => {
        tags.push(CACHE_TAGS.TAG(tag.slug.current))
      })
    }
    
    if (post.featured || post.featuredOnHome) {
      tags.push(CACHE_TAGS.FEATURED_POSTS)
    }
    
    return tags
  }
  
  /**
   * Generate cache tags for a course
   */
  static getCourseTags(course: any): string[] {
    return [
      CACHE_TAGS.COURSES,
      CACHE_TAGS.COURSE(course.slug.current)
    ]
  }
  
  /**
   * Determine if a page should use ISR based on content type
   */
  static shouldUseISR(pageType: string, isDevelopment: boolean = false): boolean {
    // Disable ISR in development for faster iteration
    if (isDevelopment) return false
    
    // Pages that should not use ISR
    const noISRPages = ['admin', 'preview', 'api']
    
    return !noISRPages.some(type => pageType.includes(type))
  }
  
  /**
   * Get optimal revalidation strategy based on content analysis
   */
  static getOptimalStrategy(content: {
    type: string
    updateFrequency: number // updates per day
    importance: 'high' | 'medium' | 'low'
    userTraffic: number // daily page views
  }): ISRConfig {
    let revalidate: number
    
    // High traffic pages need more frequent updates
    if (content.userTraffic > 1000) {
      revalidate = Math.max(900, 3600 / content.updateFrequency) // Min 15 minutes
    } else if (content.userTraffic > 100) {
      revalidate = Math.max(1800, 7200 / content.updateFrequency) // Min 30 minutes
    } else {
      revalidate = Math.max(3600, 14400 / content.updateFrequency) // Min 1 hour
    }
    
    // Adjust based on importance
    if (content.importance === 'high') {
      revalidate = Math.floor(revalidate * 0.5)
    } else if (content.importance === 'low') {
      revalidate = Math.floor(revalidate * 2)
    }
    
    return {
      revalidate: Math.floor(revalidate),
      description: `Optimized ISR for ${content.type} with ${content.updateFrequency} updates/day`
    }
  }
}

// Environment-specific configurations
export const getEnvironmentISRConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isPreview = process.env.VERCEL_ENV === 'preview'
  
  if (isDevelopment) {
    // Shorter revalidation times in development
    return {
      ...ISR_CONFIGS,
      blogPost: { ...ISR_CONFIGS.blogPost, revalidate: 60 }, // 1 minute
      blogListing: { ...ISR_CONFIGS.blogListing, revalidate: 60 },
      home: { ...ISR_CONFIGS.home, revalidate: 60 }
    }
  }
  
  if (isPreview) {
    // Disable ISR in preview environments for immediate updates
    return Object.fromEntries(
      Object.entries(ISR_CONFIGS).map(([key, config]) => [
        key,
        { ...config, revalidate: false }
      ])
    )
  }
  
  return ISR_CONFIGS
}

export default ISRManager
