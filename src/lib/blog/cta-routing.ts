import { BlogPost, Course, BlogCategory, CTAPlacement, IntelligentCTARouting } from '../types/blog';
import { getAllCourses } from './api';

// Enhanced intelligent CTA routing with comprehensive error handling and fallbacks
export class IntelligentCTARouter {
  private static instance: IntelligentCTARouter;
  private coursesCache: Course[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  static getInstance(): IntelligentCTARouter {
    if (!IntelligentCTARouter.instance) {
      IntelligentCTARouter.instance = new IntelligentCTARouter();
    }
    return IntelligentCTARouter.instance;
  }

  // Get recommended course for a blog post with intelligent routing
  async getRecommendedCourse(
    blogPost: BlogPost,
    options: {
      fallbackToDefault?: boolean;
      useCache?: boolean;
      debugMode?: boolean;
    } = {}
  ): Promise<Course | null> {
    const { fallbackToDefault = true, useCache = true, debugMode = false } = options;

    try {
      if (!blogPost || !blogPost._id) {
        if (debugMode) console.warn('Invalid blog post provided to getRecommendedCourse');
        return fallbackToDefault ? this.getDefaultCourse() : null;
      }

      // Get courses with caching
      const courses = await this.getCourses(useCache);
      if (!courses || courses.length === 0) {
        if (debugMode) console.warn('No courses available for CTA routing');
        return fallbackToDefault ? this.getDefaultCourse() : null;
      }

      // Step 1: Check explicit course target from post's intelligent routing
      if (blogPost.intelligentCTARouting?.enableIntelligentRouting) {
        const explicitCourse = await this.getExplicitCourseTarget(blogPost, courses, debugMode);
        if (explicitCourse) return explicitCourse;
      }

      // Step 2: Check post's CTA placements for specific course targets
      const ctaCourse = this.getCourseFromCTAPlacements(blogPost, courses, debugMode);
      if (ctaCourse) return ctaCourse;

      // Step 3: Use category-based intelligent routing
      const categoryCourse = await this.getCourseFromCategory(blogPost, courses, debugMode);
      if (categoryCourse) return categoryCourse;

      // Step 4: Content-based keyword matching
      const keywordCourse = this.getCourseFromKeywords(blogPost, courses, debugMode);
      if (keywordCourse) return keywordCourse;

      // Step 5: Fallback to default course
      if (fallbackToDefault) {
        if (debugMode) console.log('Using fallback default course');
        return this.getDefaultCourse();
      }

      if (debugMode) console.log('No matching course found for blog post:', blogPost.title);
      return null;
    } catch (error) {
      console.error('Error in intelligent CTA routing:', error);
      return fallbackToDefault ? this.getDefaultCourse() : null;
    }
  }

  // Get multiple course recommendations with priority scoring
  async getMultipleCourseRecommendations(
    blogPost: BlogPost,
    count: number = 3,
    options: {
      useCache?: boolean;
      debugMode?: boolean;
    } = {}
  ): Promise<Array<{ course: Course; score: number; reason: string }>> {
    const { useCache = true, debugMode = false } = options;

    try {
      if (!blogPost || !blogPost._id) {
        if (debugMode) console.warn('Invalid blog post provided');
        return [];
      }

      const courses = await this.getCourses(useCache);
      if (!courses || courses.length === 0) {
        if (debugMode) console.warn('No courses available');
        return [];
      }

      const recommendations: Array<{ course: Course; score: number; reason: string }> = [];

      // Score each course based on relevance
      for (const course of courses) {
        const score = this.calculateCourseRelevanceScore(blogPost, course);
        if (score > 0) {
          recommendations.push({
            course,
            score,
            reason: this.getRecommendationReason(blogPost, course, score),
          });
        }
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
    } catch (error) {
      console.error('Error getting multiple course recommendations:', error);
      return [];
    }
  }

  // Get courses with caching mechanism
  private async getCourses(useCache: boolean = true): Promise<Course[]> {
    try {
      const now = Date.now();
      
      // Return cached courses if valid and caching is enabled
      if (useCache && this.coursesCache && now < this.cacheExpiry) {
        return this.coursesCache;
      }

      // Fetch fresh courses
      const response = await getAllCourses({
        activeOnly: true,
        cache: {
          enabled: true,
          ttl: 3600,
          tags: ['courses', 'cta-routing'],
        },
      });

      if (response.success && response.data) {
        this.coursesCache = response.data;
        this.cacheExpiry = now + this.CACHE_TTL;
        return response.data;
      }

      // Return cached courses as fallback if fetch fails
      if (this.coursesCache) {
        console.warn('Using cached courses due to fetch failure');
        return this.coursesCache;
      }

      return [];
    } catch (error) {
      console.error('Error fetching courses for CTA routing:', error);
      return this.coursesCache || [];
    }
  }

  // Get explicit course target from post's intelligent routing
  private async getExplicitCourseTarget(
    blogPost: BlogPost,
    courses: Course[],
    debugMode: boolean = false
  ): Promise<Course | null> {
    try {
      const routing = blogPost.intelligentCTARouting;
      if (!routing?.primaryCourseTarget?.slug?.current) return null;

      const explicitCourse = courses.find(
        course => course.slug.current === routing.primaryCourseTarget?.slug?.current
      );

      if (explicitCourse) {
        if (debugMode) console.log(`Found explicit course target: ${explicitCourse.name}`);
        return explicitCourse;
      }

      return null;
    } catch (error) {
      console.error('Error getting explicit course target:', error);
      return null;
    }
  }

  // Get course from CTA placements
  private getCourseFromCTAPlacements(
    blogPost: BlogPost,
    courses: Course[],
    debugMode: boolean = false
  ): Course | null {
    try {
      if (!blogPost.ctaPlacements || blogPost.ctaPlacements.length === 0) return null;

      // Find the highest priority CTA with a course target
      const sortedCTAs = blogPost.ctaPlacements
        .filter(cta => cta.targetCourse?._id)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const cta of sortedCTAs) {
        if (!cta.targetCourse?._id) continue;

        const course = courses.find(c => c._id === cta.targetCourse?._id);
        if (course) {
          if (debugMode) console.log(`Found course from CTA placement: ${course.name}`);
          return course;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting course from CTA placements:', error);
      return null;
    }
  }

  // Get course from category intelligent routing
  private async getCourseFromCategory(
    blogPost: BlogPost,
    courses: Course[],
    debugMode: boolean = false
  ): Promise<Course | null> {
    try {
      const category = blogPost.category;
      if (!category || !('intelligentRouting' in category)) return null;

      const routing = (category as any).intelligentRouting;
      if (!routing) return null;

      // Check course mapping rules first
      if (routing.courseMapping && Array.isArray(routing.courseMapping)) {
        const mappedCourse = this.findMappedCourse(blogPost, routing.courseMapping, courses, debugMode);
        if (mappedCourse) return mappedCourse;
      }

      // Fall back to category default course
      if (routing.defaultCourse?._id) {
        const defaultCourse = courses.find(course => course._id === routing.defaultCourse._id);
        if (defaultCourse) {
          if (debugMode) console.log(`Found category default course: ${defaultCourse.name}`);
          return defaultCourse;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting course from category:', error);
      return null;
    }
  }

  // Find mapped course from category routing rules
  private findMappedCourse(
    blogPost: BlogPost,
    courseMapping: any[],
    courses: Course[],
    debugMode: boolean = false
  ): Course | null {
    try {
      // Sort by priority (higher first)
      const sortedMappings = courseMapping
        .filter(mapping => mapping.keywords && Array.isArray(mapping.keywords))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const mapping of sortedMappings) {
        const hasMatchingKeyword = mapping.keywords.some((keyword: string) => {
          if (!keyword || typeof keyword !== 'string') return false;
          return this.contentContainsKeyword(blogPost, keyword);
        });

        if (hasMatchingKeyword && mapping.targetCourse?._id) {
          const mappedCourse = courses.find(course => course._id === mapping.targetCourse._id);
          if (mappedCourse) {
            if (debugMode) console.log(`Found mapped course: ${mappedCourse.name}`);
            return mappedCourse;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding mapped course:', error);
      return null;
    }
  }

  // Get course based on content keyword matching
  private getCourseFromKeywords(
    blogPost: BlogPost,
    courses: Course[],
    debugMode: boolean = false
  ): Course | null {
    try {
      const contentText = this.extractContentText(blogPost);
      if (!contentText.trim()) return null;

      // Score courses based on keyword matches
      const courseScores: Array<{ course: Course; score: number }> = [];

      for (const course of courses) {
        if (!course.keywords || !Array.isArray(course.keywords)) continue;

        let score = 0;
        for (const keyword of course.keywords) {
          if (!keyword || typeof keyword !== 'string') continue;
          
          const keywordLower = keyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keywordLower, 'gi')) || []).length;
          score += matches;
        }

        if (score > 0) {
          courseScores.push({ course, score });
        }
      }

      if (courseScores.length === 0) return null;

      // Return the highest scoring course
      const topCourse = courseScores.sort((a, b) => b.score - a.score)[0];
      if (debugMode) console.log(`Found keyword-matched course: ${topCourse.course.name} (score: ${topCourse.score})`);
      
      return topCourse.course;
    } catch (error) {
      console.error('Error getting course from keywords:', error);
      return null;
    }
  }

  // Calculate relevance score for course recommendations
  private calculateCourseRelevanceScore(blogPost: BlogPost, course: Course): number {
    try {
      let score = 0;

      // Base score for active courses
      if (course.active) score += 10;

      // Featured courses get bonus points
      if (course.featured) score += 5;

      // Category matching
      if (blogPost.category && course.category) {
        const categoryKeywords = this.getCategoryKeywords(blogPost.category.title);
        const courseCategory = course.category.toLowerCase();
        
        if (categoryKeywords.some(keyword => courseCategory.includes(keyword))) {
          score += 20;
        }
      }

      // Keyword matching
      const contentText = this.extractContentText(blogPost);
      if (course.keywords && Array.isArray(course.keywords)) {
        for (const keyword of course.keywords) {
          if (keyword && typeof keyword === 'string') {
            const matches = (contentText.match(new RegExp(keyword, 'gi')) || []).length;
            score += matches * 3;
          }
        }
      }

      // Difficulty matching
      if (blogPost.difficulty && course.level) {
        if (blogPost.difficulty === course.level) {
          score += 15;
        }
      }

      // Content type matching
      if (blogPost.contentType === 'tutorial' && course.category.includes('technical')) {
        score += 10;
      }

      return score;
    } catch (error) {
      console.error('Error calculating course relevance score:', error);
      return 0;
    }
  }

  // Get recommendation reason for debugging and analytics
  private getRecommendationReason(blogPost: BlogPost, course: Course, score: number): string {
    const reasons: string[] = [];

    if (course.featured) reasons.push('featured course');
    if (blogPost.category && course.category.includes(blogPost.category.title.toLowerCase())) {
      reasons.push('category match');
    }
    if (score > 50) reasons.push('high keyword relevance');
    if (blogPost.difficulty === course.level) reasons.push('difficulty match');

    return reasons.length > 0 ? reasons.join(', ') : 'general relevance';
  }

  // Extract searchable content text from blog post
  private extractContentText(blogPost: BlogPost): string {
    try {
      const parts: string[] = [];

      if (blogPost.title) parts.push(blogPost.title);
      if (blogPost.excerpt) parts.push(blogPost.excerpt);
      if (blogPost.seoEnhancement?.focusKeyword) parts.push(blogPost.seoEnhancement.focusKeyword);
      if (blogPost.seoEnhancement?.additionalKeywords) {
        parts.push(...blogPost.seoEnhancement.additionalKeywords);
      }
      if (blogPost.tags) parts.push(...blogPost.tags);

      return parts.join(' ').toLowerCase();
    } catch (error) {
      console.error('Error extracting content text:', error);
      return '';
    }
  }

  // Check if content contains a specific keyword
  private contentContainsKeyword(blogPost: BlogPost, keyword: string): boolean {
    try {
      const keywordLower = keyword.toLowerCase();
      const contentText = this.extractContentText(blogPost);
      return contentText.includes(keywordLower);
    } catch (error) {
      console.error('Error checking keyword in content:', error);
      return false;
    }
  }

  // Get category-related keywords for matching
  private getCategoryKeywords(categoryTitle: string): string[] {
    const categoryLower = categoryTitle.toLowerCase();
    const keywordMap: Record<string, string[]> = {
      'technical': ['technical', 'systems', 'engineering', 'maintenance'],
      'general': ['general', 'basic', 'fundamentals', 'introduction'],
      'commercial': ['commercial', 'cpl', 'career', 'professional'],
      'airline': ['airline', 'atpl', 'advanced', 'captain'],
      'type rating': ['type', 'rating', 'aircraft', 'specific'],
      'navigation': ['navigation', 'nav', 'gps', 'instruments'],
      'meteorology': ['weather', 'meteorology', 'met', 'climate'],
      'regulations': ['regulations', 'rules', 'dgca', 'law'],
    };

    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (categoryLower.includes(key)) {
        return keywords;
      }
    }

    return [categoryLower];
  }

  // Get default fallback course
  private getDefaultCourse(): Course {
    return {
      _id: 'default-course',
      _type: 'course',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      name: 'Aviation Training Programs',
      slug: { current: 'aviation-training' },
      category: 'general',
      description: 'Comprehensive aviation training programs for aspiring pilots',
      shortDescription: 'Professional aviation training',
      targetUrl: '/courses',
      keywords: ['aviation', 'training', 'pilot', 'course'],
      ctaSettings: {
        primaryButtonText: 'Explore Courses',
        secondaryButtonText: 'Contact Us',
        ctaTitle: 'Start Your Aviation Career',
        ctaMessage: 'Take the next step in your aviation journey with our comprehensive training programs.',
      },
      active: true,
      featured: false,
    };
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.coursesCache = null;
    this.cacheExpiry = 0;
  }

  // Get cache status for debugging
  getCacheStatus(): { cached: boolean; expiry: number; coursesCount: number } {
    return {
      cached: this.coursesCache !== null && Date.now() < this.cacheExpiry,
      expiry: this.cacheExpiry,
      coursesCount: this.coursesCache?.length || 0,
    };
  }
}

// Export singleton instance
export const intelligentCTARouter = IntelligentCTARouter.getInstance();

// Utility functions for CTA generation
export function generateCTAContent(
  course: Course,
  context: {
    position: string;
    blogTitle: string;
    category?: string;
  }
): {
  title: string;
  message: string;
  buttonText: string;
  urgencyText?: string;
} {
  try {
    const { position, blogTitle, category } = context;
    
    // Customize content based on position and context
    let title = course.ctaSettings.ctaTitle || `Enroll in ${course.name}`;
    let message = course.ctaSettings.ctaMessage || 'Take the next step in your aviation career.';
    let buttonText = course.ctaSettings.primaryButtonText || 'Learn More';
    let urgencyText = course.ctaSettings.urgencyText;

    // Position-specific customizations
    if (position === 'top') {
      title = `Ready to Master ${category || 'Aviation'}?`;
      message = `Start your journey with our ${course.name} program.`;
    } else if (position === 'middle') {
      title = `Take Your ${category || 'Aviation'} Skills Further`;
      message = `Our ${course.name} course builds on concepts like those discussed above.`;
    } else if (position === 'bottom') {
      title = `Apply What You've Learned`;
      message = `Put your knowledge into practice with our comprehensive ${course.name} program.`;
    }

    return {
      title,
      message,
      buttonText,
      urgencyText,
    };
  } catch (error) {
    console.error('Error generating CTA content:', error);
    return {
      title: `Enroll in ${course.name}`,
      message: 'Take the next step in your aviation career.',
      buttonText: 'Learn More',
    };
  }
}

// Utility function to validate CTA placement configuration
export function validateCTAPlacement(placement: CTAPlacement): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!placement.position) {
    errors.push('Position is required');
  }

  if (!placement.ctaType) {
    errors.push('CTA type is required');
  }

  if (placement.ctaType === 'course-promo' && !placement.targetCourse) {
    errors.push('Target course is required for course promotion CTAs');
  }

  if (placement.priority && (placement.priority < 0 || placement.priority > 100)) {
    errors.push('Priority must be between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export types for external use
export type {
  Course,
  BlogPost,
  CTAPlacement,
  IntelligentCTARouting,
} from '../types/blog';
