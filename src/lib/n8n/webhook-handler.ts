import { enhancedClient } from '@/lib/sanity/client';
import { PortableTextBlock } from '@portabletext/types';
import DOMPurify from 'isomorphic-dompurify';

// N8N payload interface
export interface N8NContentPayload {
  title: string;
  content: string;
  excerpt?: string;
  suggestedCategory?: string;
  suggestedTags?: string[];
  sourceUrl?: string;
  automationId: string;
  timestamp: string;
  metadata?: {
    author?: string;
    publishDate?: string;
    keywords?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    contentType?: 'tutorial' | 'guide' | 'news' | 'opinion' | 'case-study' | 'reference';
  };
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Sanitized content interface
export interface SanitizedContent {
  isValid: boolean;
  content: N8NContentPayload;
  issues: string[];
  modifications: string[];
}

// Draft blog post interface for automation
export interface AutomatedDraftPost {
  _id: string;
  _type: 'post';
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  excerpt: string;
  body: PortableTextBlock[];
  publishedAt?: never; // Draft posts should not have publishedAt
  featured: false;
  readingTime: number;
  status: 'draft' | 'pending_review' | 'needs_revision';
  automationMetadata: {
    automationId: string;
    sourceUrl?: string;
    originalPayload: N8NContentPayload;
    createdAt: string;
    requiresHumanReview: boolean;
    validationScore: number;
    suggestedImprovements: string[];
  };
  category?: {
    _type: 'reference';
    _ref: string;
  };
  author?: {
    _type: 'reference';
    _ref: string;
  };
  tags?: string[];
  seoEnhancement?: {
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
    structuredData?: {
      articleType: 'Article';
      learningResourceType: 'Article';
      educationalLevel?: string;
    };
  };
}

/**
 * Validates the incoming N8N payload structure and content quality
 */
export function validateN8NPayload(payload: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Required field validation
  if (!payload.title || typeof payload.title !== 'string') {
    errors.push('Title is required and must be a string');
    score -= 25;
  } else if (payload.title.length < 10) {
    warnings.push('Title is quite short, consider making it more descriptive');
    score -= 5;
  } else if (payload.title.length > 100) {
    warnings.push('Title is very long, consider shortening for better SEO');
    score -= 5;
  }

  if (!payload.content || typeof payload.content !== 'string') {
    errors.push('Content is required and must be a string');
    score -= 30;
  } else if (payload.content.length < 100) {
    errors.push('Content is too short (minimum 100 characters)');
    score -= 20;
  } else if (payload.content.length < 500) {
    warnings.push('Content is quite short, consider adding more detail');
    score -= 5;
  }

  if (!payload.automationId || typeof payload.automationId !== 'string') {
    errors.push('Automation ID is required and must be a string');
    score -= 10;
  }

  if (!payload.timestamp || typeof payload.timestamp !== 'string') {
    warnings.push('Timestamp is missing or invalid');
    score -= 5;
  } else {
    try {
      new Date(payload.timestamp);
    } catch {
      warnings.push('Timestamp format is invalid');
      score -= 5;
    }
  }

  // Optional field validation
  if (payload.excerpt && typeof payload.excerpt !== 'string') {
    warnings.push('Excerpt should be a string if provided');
    score -= 3;
  }

  if (payload.suggestedCategory && typeof payload.suggestedCategory !== 'string') {
    warnings.push('Suggested category should be a string if provided');
    score -= 3;
  }

  if (payload.suggestedTags && !Array.isArray(payload.suggestedTags)) {
    warnings.push('Suggested tags should be an array if provided');
    score -= 3;
  }

  if (payload.sourceUrl && typeof payload.sourceUrl !== 'string') {
    warnings.push('Source URL should be a string if provided');
    score -= 3;
  }

  // Content quality checks
  if (payload.content) {
    const wordCount = payload.content.split(/\s+/).length;
    if (wordCount < 50) {
      errors.push('Content has too few words (minimum 50 words)');
      score -= 15;
    } else if (wordCount < 200) {
      warnings.push('Content is quite short, consider expanding');
      score -= 5;
    }

    // Check for basic HTML structure if content contains HTML
    if (payload.content.includes('<') && payload.content.includes('>')) {
      if (!payload.content.includes('<p>') && !payload.content.includes('<div>')) {
        suggestions.push('Consider structuring content with paragraphs for better readability');
        score -= 3;
      }
    }

    // Check for aviation-related keywords
    const aviationKeywords = ['pilot', 'aviation', 'aircraft', 'flight', 'training', 'dgca', 'cpl', 'atpl', 'license'];
    const hasAviationContent = aviationKeywords.some(keyword => 
      payload.content.toLowerCase().includes(keyword) || 
      payload.title.toLowerCase().includes(keyword)
    );
    
    if (!hasAviationContent) {
      warnings.push('Content may not be aviation-related, please verify relevance');
      score -= 10;
    }
  }

  // SEO-related suggestions
  if (payload.title && !payload.excerpt) {
    suggestions.push('Consider providing an excerpt for better SEO and social sharing');
    score -= 2;
  }

  if (!payload.suggestedTags || payload.suggestedTags.length === 0) {
    suggestions.push('Consider adding relevant tags for better content categorization');
    score -= 3;
  }

  return {
    isValid: errors.length === 0,
    score: Math.max(0, score),
    errors,
    warnings,
    suggestions
  };
}

/**
 * Sanitizes and validates content for security and quality
 */
export function sanitizeContent(payload: N8NContentPayload): SanitizedContent {
  const issues: string[] = [];
  const modifications: string[] = [];
  const sanitizedPayload = { ...payload };

  try {
    // Sanitize title
    if (sanitizedPayload.title) {
      const originalTitle = sanitizedPayload.title;
      sanitizedPayload.title = DOMPurify.sanitize(sanitizedPayload.title, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      }).trim();
      
      if (sanitizedPayload.title !== originalTitle) {
        modifications.push('Title was sanitized to remove HTML/unsafe content');
      }
      
      if (sanitizedPayload.title.length === 0) {
        issues.push('Title became empty after sanitization');
      }
    }

    // Sanitize content
    if (sanitizedPayload.content) {
      const originalContent = sanitizedPayload.content;
      
      // Allow basic HTML tags for content formatting
      sanitizedPayload.content = DOMPurify.sanitize(sanitizedPayload.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        ALLOWED_URI_REGEXP: /^https?:\/\//
      });
      
      if (sanitizedPayload.content !== originalContent) {
        modifications.push('Content was sanitized to remove unsafe HTML elements');
      }
      
      if (sanitizedPayload.content.length === 0) {
        issues.push('Content became empty after sanitization');
      }
    }

    // Sanitize excerpt
    if (sanitizedPayload.excerpt) {
      const originalExcerpt = sanitizedPayload.excerpt;
      sanitizedPayload.excerpt = DOMPurify.sanitize(sanitizedPayload.excerpt, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      }).trim();
      
      if (sanitizedPayload.excerpt !== originalExcerpt) {
        modifications.push('Excerpt was sanitized to remove HTML content');
      }
    }

    // Sanitize suggested tags
    if (sanitizedPayload.suggestedTags) {
      const originalTags = [...sanitizedPayload.suggestedTags];
      sanitizedPayload.suggestedTags = sanitizedPayload.suggestedTags
        .map(tag => DOMPurify.sanitize(tag, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim())
        .filter(tag => tag.length > 0 && tag.length <= 50);
      
      if (sanitizedPayload.suggestedTags.length !== originalTags.length) {
        modifications.push('Some tags were removed during sanitization');
      }
    }

    // Validate URLs
    if (sanitizedPayload.sourceUrl) {
      try {
        new URL(sanitizedPayload.sourceUrl);
      } catch {
        issues.push('Source URL is not a valid URL');
        delete sanitizedPayload.sourceUrl;
        modifications.push('Invalid source URL was removed');
      }
    }

    return {
      isValid: issues.length === 0,
      content: sanitizedPayload,
      issues,
      modifications
    };

  } catch (error) {
    return {
      isValid: false,
      content: sanitizedPayload,
      issues: [`Sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      modifications
    };
  }
}

/**
 * Converts HTML content to Portable Text blocks for Sanity
 */
function htmlToPortableText(html: string): PortableTextBlock[] {
  // Simple HTML to Portable Text conversion
  // In a production environment, you might want to use a more sophisticated converter
  const blocks: PortableTextBlock[] = [];
  
  // Split content by paragraphs and headers
  const elements = html.split(/(<h[1-6][^>]*>.*?<\/h[1-6]>|<p[^>]*>.*?<\/p>|<blockquote[^>]*>.*?<\/blockquote>)/gi)
    .filter(element => element.trim().length > 0);
  
  for (const element of elements) {
    if (element.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i)) {
      const match = element.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i);
      if (match) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        blocks.push({
          _type: 'block',
          _key: `heading_${Date.now()}_${Math.random()}`,
          style: `h${level}`,
          children: [
            {
              _type: 'span',
              _key: `span_${Date.now()}_${Math.random()}`,
              text,
              marks: []
            }
          ],
          markDefs: []
        });
      }
    } else if (element.match(/<blockquote[^>]*>(.*?)<\/blockquote>/i)) {
      const match = element.match(/<blockquote[^>]*>(.*?)<\/blockquote>/i);
      if (match) {
        const text = match[1].replace(/<[^>]*>/g, '').trim();
        blocks.push({
          _type: 'block',
          _key: `blockquote_${Date.now()}_${Math.random()}`,
          style: 'blockquote',
          children: [
            {
              _type: 'span',
              _key: `span_${Date.now()}_${Math.random()}`,
              text,
              marks: []
            }
          ],
          markDefs: []
        });
      }
    } else if (element.match(/<p[^>]*>(.*?)<\/p>/i)) {
      const match = element.match(/<p[^>]*>(.*?)<\/p>/i);
      if (match) {
        const text = match[1].replace(/<[^>]*>/g, '').trim();
        if (text) {
          blocks.push({
            _type: 'block',
            _key: `paragraph_${Date.now()}_${Math.random()}`,
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: `span_${Date.now()}_${Math.random()}`,
                text,
                marks: []
              }
            ],
            markDefs: []
          });
        }
      }
    } else if (element.trim() && !element.match(/<[^>]*>/)) {
      // Plain text content
      blocks.push({
        _type: 'block',
        _key: `paragraph_${Date.now()}_${Math.random()}`,
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: `span_${Date.now()}_${Math.random()}`,
            text: element.trim(),
            marks: []
          }
        ],
        markDefs: []
      });
    }
  }
  
  // If no blocks were created, create a single paragraph with the content
  if (blocks.length === 0) {
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      blocks.push({
        _type: 'block',
        _key: `paragraph_${Date.now()}_${Math.random()}`,
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: `span_${Date.now()}_${Math.random()}`,
            text: plainText,
            marks: []
          }
        ],
        markDefs: []
      });
    }
  }
  
  return blocks;
}

/**
 * Creates a draft blog post from automated content
 */
export async function createDraftFromAutomation(
  payload: N8NContentPayload,
  automationId: string
): Promise<AutomatedDraftPost> {
  try {
    // Generate slug from title
    const slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if post with this slug already exists
    const existingPost = await enhancedClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug }
    );

    let finalSlug = slug;
    if (existingPost) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Convert content to Portable Text
    const portableTextBody = htmlToPortableText(payload.content);

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = payload.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Generate excerpt if not provided
    const excerpt = payload.excerpt || 
      payload.content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';

    // Find default category for automated content
    let categoryRef: string | undefined;
    if (payload.suggestedCategory) {
      const category = await enhancedClient.fetch(
        `*[_type == "category" && (title match $category || slug.current match $categorySlug)][0]._id`,
        { 
          category: payload.suggestedCategory,
          categorySlug: payload.suggestedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      );
      categoryRef = category;
    }

    // If no category found, try to find a general/automated category
    if (!categoryRef) {
      const defaultCategory = await enhancedClient.fetch(
        `*[_type == "category" && (title match "General" || title match "Automated" || title match "Draft")][0]._id`
      );
      categoryRef = defaultCategory;
    }

    // Find default author for automated content
    const defaultAuthor = await enhancedClient.fetch(
      `*[_type == "author" && (name match "System" || name match "Automated" || role match "system")][0]._id`
    );

    // Determine if human review is required
    const validation = validateN8NPayload(payload);
    const requiresHumanReview = validation.score < 80 || validation.errors.length > 0;

    // Create the draft post document
    const draftPost: Omit<AutomatedDraftPost, '_id'> = {
      _type: 'post',
      title: payload.title,
      slug: {
        _type: 'slug',
        current: finalSlug
      },
      excerpt,
      body: portableTextBody,
      featured: false,
      readingTime,
      status: requiresHumanReview ? 'pending_review' : 'draft',
      automationMetadata: {
        automationId,
        sourceUrl: payload.sourceUrl,
        originalPayload: payload,
        createdAt: new Date().toISOString(),
        requiresHumanReview,
        validationScore: validation.score,
        suggestedImprovements: [...validation.warnings, ...validation.suggestions]
      },
      ...(categoryRef && {
        category: {
          _type: 'reference',
          _ref: categoryRef
        }
      }),
      ...(defaultAuthor && {
        author: {
          _type: 'reference',
          _ref: defaultAuthor
        }
      }),
      ...(payload.suggestedTags && payload.suggestedTags.length > 0 && {
        tags: payload.suggestedTags
      }),
      seoEnhancement: {
        seoTitle: payload.title,
        seoDescription: excerpt,
        focusKeyword: payload.metadata?.keywords?.[0] || '',
        structuredData: {
          articleType: 'Article',
          learningResourceType: 'Article',
          educationalLevel: payload.metadata?.difficulty || 'beginner'
        }
      }
    };

    // Create the document in Sanity
    const result = await enhancedClient.create(draftPost);

    return result as AutomatedDraftPost;

  } catch (error) {
    console.error('Error creating draft from automation:', error);
    throw new Error(`Failed to create draft post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates an existing automated draft with new content
 */
export async function updateAutomatedDraft(
  draftId: string,
  updates: Partial<N8NContentPayload>
): Promise<AutomatedDraftPost> {
  try {
    const existingDraft = await enhancedClient.fetch(
      `*[_type == "post" && _id == $draftId][0]`,
      { draftId }
    ) as AutomatedDraftPost;

    if (!existingDraft) {
      throw new Error('Draft not found');
    }

    if (!existingDraft.automationMetadata) {
      throw new Error('Not an automated draft');
    }

    // Merge updates with existing content
    const updatedPayload = {
      ...existingDraft.automationMetadata.originalPayload,
      ...updates
    };

    // Re-validate the updated content
    const validation = validateN8NPayload(updatedPayload);
    const requiresHumanReview = validation.score < 80 || validation.errors.length > 0;

    // Prepare update data
    const updateData: any = {};

    if (updates.title) {
      updateData.title = updates.title;
      const newSlug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updateData.slug = {
        _type: 'slug',
        current: newSlug
      };
    }

    if (updates.content) {
      updateData.body = htmlToPortableText(updates.content);
      const wordCount = updates.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      updateData.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    if (updates.excerpt) {
      updateData.excerpt = updates.excerpt;
    }

    // Update automation metadata
    updateData.automationMetadata = {
      ...existingDraft.automationMetadata,
      originalPayload: updatedPayload,
      requiresHumanReview,
      validationScore: validation.score,
      suggestedImprovements: [...validation.warnings, ...validation.suggestions],
      lastUpdated: new Date().toISOString()
    };

    updateData.status = requiresHumanReview ? 'pending_review' : 'draft';

    // Update the document in Sanity
    const result = await enhancedClient
      .patch(draftId)
      .set(updateData)
      .commit();

    return result as AutomatedDraftPost;

  } catch (error) {
    console.error('Error updating automated draft:', error);
    throw new Error(`Failed to update draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
