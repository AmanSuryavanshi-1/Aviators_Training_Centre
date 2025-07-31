/**
 * SEO validation functions for blog posts
 * Provides keyword density calculation, meta tag validation, and content analysis
 */

export interface SEOValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  readingTime: number; // in minutes
  keywordDensity: number;
  titleLength: number;
  descriptionLength: number;
}

/**
 * Calculate keyword density in content
 * @param content - The content to analyze (plain text)
 * @param keyword - The focus keyword to check
 * @returns Keyword density as a percentage (0-100)
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
  if (!content || !keyword) return 0;
  
  const cleanContent = content.toLowerCase().replace(/[^\w\s]/g, ' ');
  const cleanKeyword = keyword.toLowerCase().trim();
  
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) return 0;
  
  // Count exact keyword matches
  const keywordMatches = cleanContent.split(cleanKeyword).length - 1;
  
  // Calculate density as percentage
  const density = (keywordMatches / totalWords) * 100;
  
  return Math.round(density * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate meta title length
 * @param title - The meta title to validate
 * @returns Validation result with recommendations
 */
export function validateMetaTitle(title: string): SEOValidationResult {
  const length = title.length;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (length === 0) {
    issues.push('Meta title is empty');
    score = 0;
  } else if (length < 30) {
    issues.push('Meta title is too short (less than 30 characters)');
    suggestions.push('Consider expanding your title to better describe the content');
    score = 60;
  } else if (length > 60) {
    issues.push('Meta title is too long (more than 60 characters)');
    suggestions.push('Shorten your title to prevent truncation in search results');
    score = 40;
  } else if (length > 55) {
    suggestions.push('Title is close to the limit. Consider shortening slightly');
    score = 85;
  }
  
  return {
    isValid: issues.length === 0,
    score,
    issues,
    suggestions
  };
}

/**
 * Validate meta description length
 * @param description - The meta description to validate
 * @returns Validation result with recommendations
 */
export function validateMetaDescription(description: string): SEOValidationResult {
  const length = description.length;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (length === 0) {
    issues.push('Meta description is empty');
    score = 0;
  } else if (length < 120) {
    issues.push('Meta description is too short (less than 120 characters)');
    suggestions.push('Expand your description to better summarize the content');
    score = 60;
  } else if (length > 160) {
    issues.push('Meta description is too long (more than 160 characters)');
    suggestions.push('Shorten your description to prevent truncation in search results');
    score = 40;
  } else if (length > 155) {
    suggestions.push('Description is close to the limit. Consider shortening slightly');
    score = 85;
  }
  
  return {
    isValid: issues.length === 0,
    score,
    issues,
    suggestions
  };
}

/**
 * Calculate reading time based on word count
 * @param wordCount - Total number of words in the content
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  if (wordCount <= 0) return 0;
  
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.round(minutes)); // Minimum 1 minute
}

/**
 * Count words in content (handles both plain text and block content)
 * @param content - Content to analyze (string or block content array)
 * @returns Word count
 */
export function calculateWordCount(content: string | any[]): number {
  if (typeof content === 'string') {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // Handle Sanity block content
  if (Array.isArray(content)) {
    let wordCount = 0;
    
    const extractTextFromBlocks = (blocks: any[]): string => {
      return blocks.map(block => {
        if (block._type === 'block' && block.children) {
          return block.children.map((child: any) => child.text || '').join(' ');
        }
        return '';
      }).join(' ');
    };
    
    const text = extractTextFromBlocks(content);
    return calculateWordCount(text);
  }
  
  return 0;
}

/**
 * Validate keyword density for SEO optimization
 * @param density - Keyword density percentage
 * @returns Validation result with recommendations
 */
export function validateKeywordDensity(density: number): SEOValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (density === 0) {
    issues.push('Focus keyword not found in content');
    suggestions.push('Include your focus keyword naturally in the content');
    score = 0;
  } else if (density < 0.5) {
    issues.push('Keyword density is too low (less than 0.5%)');
    suggestions.push('Consider including the keyword more frequently in your content');
    score = 40;
  } else if (density > 3) {
    issues.push('Keyword density is too high (more than 3%)');
    suggestions.push('Reduce keyword usage to avoid over-optimization');
    score = 30;
  } else if (density > 2.5) {
    suggestions.push('Keyword density is high. Consider reducing slightly');
    score = 70;
  } else if (density < 1) {
    suggestions.push('Consider including the keyword a bit more frequently');
    score = 80;
  }
  
  return {
    isValid: density >= 0.5 && density <= 3,
    score,
    issues,
    suggestions
  };
}

/**
 * Comprehensive content analysis for SEO
 * @param content - Content to analyze
 * @param title - Meta title
 * @param description - Meta description
 * @param keyword - Focus keyword
 * @returns Complete content analysis
 */
export function analyzeContent(
  content: string | any[],
  title: string,
  description: string,
  keyword: string
): ContentAnalysis & { seoValidation: SEOValidationResult } {
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);
  
  // Convert content to plain text for keyword analysis
  const plainText = typeof content === 'string' 
    ? content 
    : Array.isArray(content) 
      ? content.map(block => 
          block._type === 'block' && block.children 
            ? block.children.map((child: any) => child.text || '').join(' ')
            : ''
        ).join(' ')
      : '';
  
  const keywordDensity = calculateKeywordDensity(plainText, keyword);
  
  // Validate all SEO aspects
  const titleValidation = validateMetaTitle(title);
  const descriptionValidation = validateMetaDescription(description);
  const keywordValidation = validateKeywordDensity(keywordDensity);
  
  // Calculate overall SEO score
  const overallScore = Math.round(
    (titleValidation.score + descriptionValidation.score + keywordValidation.score) / 3
  );
  
  // Combine all issues and suggestions
  const allIssues = [
    ...titleValidation.issues,
    ...descriptionValidation.issues,
    ...keywordValidation.issues
  ];
  
  const allSuggestions = [
    ...titleValidation.suggestions,
    ...descriptionValidation.suggestions,
    ...keywordValidation.suggestions
  ];
  
  return {
    wordCount,
    readingTime,
    keywordDensity,
    titleLength: title.length,
    descriptionLength: description.length,
    seoValidation: {
      isValid: allIssues.length === 0,
      score: overallScore,
      issues: allIssues,
      suggestions: allSuggestions
    }
  };
}

/**
 * Generate SEO recommendations based on content analysis
 * @param analysis - Content analysis result
 * @returns Prioritized list of recommendations
 */
export function generateSEORecommendations(analysis: ContentAnalysis & { seoValidation: SEOValidationResult }): string[] {
  const recommendations: string[] = [];
  
  // High priority issues first
  if (analysis.seoValidation.issues.length > 0) {
    recommendations.push(...analysis.seoValidation.issues.map(issue => `🔴 ${issue}`));
  }
  
  // Medium priority suggestions
  if (analysis.seoValidation.suggestions.length > 0) {
    recommendations.push(...analysis.seoValidation.suggestions.map(suggestion => `🟡 ${suggestion}`));
  }
  
  // Content length recommendations
  if (analysis.wordCount < 300) {
    recommendations.push('🟡 Consider expanding content to at least 300 words for better SEO');
  } else if (analysis.wordCount > 2000) {
    recommendations.push('🟡 Content is quite long. Consider breaking into multiple posts');
  }
  
  // Reading time feedback
  if (analysis.readingTime < 2) {
    recommendations.push('ℹ️ Short read - good for quick tips and updates');
  } else if (analysis.readingTime > 10) {
    recommendations.push('ℹ️ Long read - ensure content is well-structured with headings');
  }
  
  // Positive feedback
  if (analysis.seoValidation.score >= 90) {
    recommendations.push('✅ Excellent SEO optimization!');
  } else if (analysis.seoValidation.score >= 70) {
    recommendations.push('✅ Good SEO optimization with room for minor improvements');
  }
  
  return recommendations;
}
