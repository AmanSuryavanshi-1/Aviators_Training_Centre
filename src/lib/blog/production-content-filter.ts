/**
 * Production Content Filter
 * 
 * Ensures only production-ready content appears on the live website
 * by filtering out test posts, drafts, and development content.
 */

// Test content patterns to exclude from production
const TEST_PATTERNS = [
  "*test*",
  "*Test*", 
  "*TEST*",
  "*Connection Test*",
  "*Will be deleted*",
  "*TEMP*",
  "*temp*",
  "*Demo*",
  "*demo*",
  "*Sample*",
  "*sample*",
  "*Example*",
  "*example*",
  "*Draft*",
  "*draft*",
  "*TODO*",
  "*todo*",
  "*WIP*",
  "*wip*",
  "*Work in Progress*",
  "*work in progress*"
];

const TEST_EXCERPT_PATTERNS = [
  "*test document*",
  "*connection validation*",
  "*for testing*",
  "*sample content*",
  "*placeholder*",
  "*lorem ipsum*",
  "*dummy content*",
  "*development only*",
  "*not for production*"
];

/**
 * Generate GROQ filter conditions for production content
 */
export function getProductionContentFilter(): string {
  const titleFilters = TEST_PATTERNS.map(pattern => `!(title match "${pattern}")`).join('\n  && ');
  const excerptFilters = TEST_EXCERPT_PATTERNS.map(pattern => `!(excerpt match "${pattern}")`).join('\n  && ');
  
  return `
  && !(_id in path("drafts.**"))
  && ${titleFilters}
  && ${excerptFilters}
  && publishedAt <= now()
  `.trim();
}

/**
 * Check if content should be excluded from production
 */
export function isTestContent(post: {
  title?: string;
  excerpt?: string;
  _id?: string;
  slug?: { current?: string };
}): boolean {
  // Check if it's a draft
  if (post._id?.includes('drafts.')) {
    return true;
  }
  
  // Check title patterns
  if (post.title) {
    const titleLower = post.title.toLowerCase();
    const testKeywords = [
      'test', 'connection test', 'will be deleted', 'temp', 'demo', 
      'sample', 'example', 'draft', 'todo', 'wip', 'work in progress'
    ];
    
    if (testKeywords.some(keyword => titleLower.includes(keyword))) {
      return true;
    }
  }
  
  // Check excerpt patterns
  if (post.excerpt) {
    const excerptLower = post.excerpt.toLowerCase();
    const testExcerptKeywords = [
      'test document', 'connection validation', 'for testing',
      'sample content', 'placeholder', 'lorem ipsum', 'dummy content',
      'development only', 'not for production'
    ];
    
    if (testExcerptKeywords.some(keyword => excerptLower.includes(keyword))) {
      return true;
    }
  }
  
  // Check slug patterns
  if (post.slug?.current) {
    const slugLower = post.slug.current.toLowerCase();
    const testSlugKeywords = [
      'test', 'demo', 'sample', 'example', 'draft', 'temp'
    ];
    
    if (testSlugKeywords.some(keyword => slugLower.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter array of posts to exclude test content
 */
export function filterProductionPosts<T extends {
  title?: string;
  excerpt?: string;
  _id?: string;
  slug?: { current?: string };
}>(posts: T[]): T[] {
  return posts.filter(post => !isTestContent(post));
}

/**
 * Enhanced GROQ query builder for production content
 */
export function buildProductionQuery(baseQuery: string): string {
  // Add production filters to any existing query
  const productionFilter = getProductionContentFilter();
  
  // Insert the filter after the opening bracket and _type condition
  const queryWithFilter = baseQuery.replace(
    /(\*\[\s*_type\s*==\s*"post"[^}]*?)(\s*\])/,
    `$1${productionFilter}$2`
  );
  
  return queryWithFilter;
}

/**
 * Environment-aware content filtering
 */
export function shouldFilterContent(): boolean {
  // Always filter in production
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // Check for explicit environment variables
  if (process.env.FILTER_TEST_CONTENT === 'true') {
    return true;
  }
  
  // Check if we're on a production domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const productionDomains = [
      'aviatorstrainingcentre.in',
      'www.aviatorstrainingcentre.in'
    ];
    
    if (productionDomains.includes(hostname)) {
      return true;
    }
  }
  
  // Default to filtering in development to be safe
  return true;
}

/**
 * Log filtered content for debugging
 */
export function logFilteredContent(originalCount: number, filteredCount: number): void {
  if (originalCount !== filteredCount) {
    console.log(`🧹 Content Filter: Filtered out ${originalCount - filteredCount} test posts (${filteredCount} remaining)`);
  }
}

/**
 * Validate production content before publishing
 */
export function validateProductionContent(post: {
  title: string;
  excerpt: string;
  slug: { current: string };
}): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (isTestContent(post)) {
    issues.push('Content appears to be test/development content');
  }
  
  if (!post.title || post.title.trim().length === 0) {
    issues.push('Title is required');
  }
  
  if (!post.excerpt || post.excerpt.trim().length === 0) {
    issues.push('Excerpt is required');
  }
  
  if (!post.slug?.current || post.slug.current.trim().length === 0) {
    issues.push('Slug is required');
  }
  
  // Check for placeholder content
  const placeholderTexts = ['lorem ipsum', 'placeholder', 'sample text', 'dummy content'];
  if (placeholderTexts.some(placeholder => 
    post.title.toLowerCase().includes(placeholder) || 
    post.excerpt.toLowerCase().includes(placeholder)
  )) {
    issues.push('Content contains placeholder text');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

export default {
  getProductionContentFilter,
  isTestContent,
  filterProductionPosts,
  buildProductionQuery,
  shouldFilterContent,
  logFilteredContent,
  validateProductionContent
};