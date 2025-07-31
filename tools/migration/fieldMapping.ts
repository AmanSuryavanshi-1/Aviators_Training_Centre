/**
 * Field mapping configuration for blog data migration
 * Defines how to transform existing blog data fields to Sanity schema
 */

export interface FieldTransform {
  sourceField: string
  targetField: string
  type: 'direct' | 'transform' | 'reference' | 'computed'
  required: boolean
  defaultValue?: any
  transformer?: (value: any, post: any) => any
  validator?: (value: any) => boolean
  description: string
}

export interface MigrationMapping {
  documentType: string
  transforms: FieldTransform[]
  postProcessors?: Array<(document: any, sourcePost: any) => any>
}

// Standard field mappings for common blog structures
export const STANDARD_FIELD_MAPPINGS: { [format: string]: MigrationMapping } = {
  // Markdown with front matter (most common)
  markdown: {
    documentType: 'post',
    transforms: [
      {
        sourceField: 'title',
        targetField: 'title',
        type: 'direct',
        required: true,
        validator: (value) => typeof value === 'string' && value.length > 0,
        description: 'Post title'
      },
      {
        sourceField: 'slug',
        targetField: 'slug',
        type: 'transform',
        required: true,
        transformer: (value, post) => {
          if (value) return { current: value, _type: 'slug' }
          // Generate slug from title if not provided
          const title = post.title || 'untitled'
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          return { current: slug, _type: 'slug' }
        },
        description: 'URL slug for the post'
      },
      {
        sourceField: 'date',
        targetField: 'publishedAt',
        type: 'transform',
        required: true,
        transformer: (value) => {
          if (!value) return new Date().toISOString()
          const date = new Date(value)
          return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
        },
        description: 'Publication date'
      },
      {
        sourceField: 'description',
        targetField: 'excerpt',
        type: 'direct',
        required: false,
        description: 'Post excerpt or summary'
      },
      {
        sourceField: 'content',
        targetField: 'body',
        type: 'transform',
        required: true,
        transformer: (value) => {
          // Convert markdown to Sanity block content
          return convertMarkdownToBlocks(value)
        },
        description: 'Main post content'
      },
      {
        sourceField: 'category',
        targetField: 'category',
        type: 'reference',
        required: false,
        transformer: (value) => {
          if (!value) return null
          return {
            _type: 'reference',
            _ref: `category-${slugify(value)}`
          }
        },
        description: 'Post category reference'
      },
      {
        sourceField: 'tags',
        targetField: 'tags',
        type: 'reference',
        required: false,
        transformer: (value) => {
          if (!Array.isArray(value)) return []
          return value.map(tag => ({
            _type: 'reference',
            _ref: `tag-${slugify(tag)}`
          }))
        },
        description: 'Post tags references'
      },
      {
        sourceField: 'author',
        targetField: 'author',
        type: 'reference',
        required: false,
        transformer: (value) => {
          if (!value) return null
          return {
            _type: 'reference',
            _ref: `author-${slugify(value)}`
          }
        },
        description: 'Post author reference'
      },
      {
        sourceField: 'image',
        targetField: 'image',
        type: 'transform',
        required: false,
        transformer: (value) => {
          if (!value) return null
          // Handle different image formats
          if (typeof value === 'string') {
            return {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              },
              alt: 'Featured image'
            }
          }
          return value
        },
        description: 'Featured image'
      },
      {
        sourceField: 'featured',
        targetField: 'featured',
        type: 'direct',
        required: false,
        defaultValue: false,
        description: 'Whether post is featured'
      },
      {
        sourceField: 'draft',
        targetField: 'workflowStatus',
        type: 'transform',
        required: false,
        transformer: (value) => {
          if (value === true) return 'draft'
          if (value === false) return 'published'
          return 'draft'
        },
        description: 'Post workflow status'
      }
    ],
    postProcessors: [
      // Calculate reading time and word count
      (document, sourcePost) => {
        const content = sourcePost.content || ''
        const wordCount = content.trim().split(/\s+/).length
        const readingTime = Math.max(1, Math.ceil(wordCount / 200))
        
        return {
          ...document,
          wordCount,
          readingTime,
          performanceMetrics: {
            estimatedReadingTime: readingTime,
            wordCount,
            lastSEOCheck: new Date().toISOString(),
            seoScore: 0
          }
        }
      },
      // Set default values
      (document) => ({
        ...document,
        _type: 'post',
        featuredOnHome: document.featured || false,
        workflowStatus: document.workflowStatus || 'published',
        ctaPositions: [],
        contentValidation: {
          hasRequiredFields: !!(document.title && document.slug && document.body),
          hasValidSEO: false,
          hasValidImages: !!document.image,
          readyForPublish: false
        }
      })
    ]
  },

  // JSON format (e.g., from headless CMS exports)
  json: {
    documentType: 'post',
    transforms: [
      {
        sourceField: 'title',
        targetField: 'title',
        type: 'direct',
        required: true,
        description: 'Post title'
      },
      {
        sourceField: 'slug',
        targetField: 'slug',
        type: 'transform',
        required: true,
        transformer: (value, post) => ({
          current: value || slugify(post.title || 'untitled'),
          _type: 'slug'
        }),
        description: 'URL slug'
      },
      {
        sourceField: 'published_at',
        targetField: 'publishedAt',
        type: 'transform',
        required: true,
        transformer: (value) => new Date(value || Date.now()).toISOString(),
        description: 'Publication date'
      },
      {
        sourceField: 'excerpt',
        targetField: 'excerpt',
        type: 'direct',
        required: false,
        description: 'Post excerpt'
      },
      {
        sourceField: 'body',
        targetField: 'body',
        type: 'transform',
        required: true,
        transformer: (value) => convertMarkdownToBlocks(value),
        description: 'Post content'
      }
    ]
  },

  // WordPress export format
  wordpress: {
    documentType: 'post',
    transforms: [
      {
        sourceField: 'post_title',
        targetField: 'title',
        type: 'direct',
        required: true,
        description: 'WordPress post title'
      },
      {
        sourceField: 'post_name',
        targetField: 'slug',
        type: 'transform',
        required: true,
        transformer: (value) => ({ current: value, _type: 'slug' }),
        description: 'WordPress post slug'
      },
      {
        sourceField: 'post_date',
        targetField: 'publishedAt',
        type: 'transform',
        required: true,
        transformer: (value) => new Date(value).toISOString(),
        description: 'WordPress post date'
      },
      {
        sourceField: 'post_excerpt',
        targetField: 'excerpt',
        type: 'direct',
        required: false,
        description: 'WordPress post excerpt'
      },
      {
        sourceField: 'post_content',
        targetField: 'body',
        type: 'transform',
        required: true,
        transformer: (value) => convertMarkdownToBlocks(value),
        description: 'WordPress post content'
      },
      {
        sourceField: 'post_status',
        targetField: 'workflowStatus',
        type: 'transform',
        required: false,
        transformer: (value) => {
          switch (value) {
            case 'publish': return 'published'
            case 'draft': return 'draft'
            case 'private': return 'archived'
            default: return 'draft'
          }
        },
        description: 'WordPress post status'
      }
    ]
  }
}

// Utility functions for field transformation

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Convert markdown content to Sanity block content
 */
export function convertMarkdownToBlocks(markdown: string): any[] {
  if (!markdown) return []
  
  // This is a simplified conversion - in practice, you'd use a proper markdown parser
  const blocks = []
  const lines = markdown.split('\n')
  let currentBlock: any = null
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
      }
      continue
    }
    
    // Headers
    if (trimmedLine.startsWith('#')) {
      if (currentBlock) {
        blocks.push(currentBlock)
      }
      
      const level = trimmedLine.match(/^#+/)?.[0].length || 1
      const text = trimmedLine.replace(/^#+\s*/, '')
      
      currentBlock = {
        _type: 'block',
        _key: generateKey(),
        style: level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text,
          marks: []
        }]
      }
    }
    // Regular paragraph
    else {
      if (!currentBlock || currentBlock.style !== 'normal') {
        if (currentBlock) {
          blocks.push(currentBlock)
        }
        
        currentBlock = {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: []
        }
      }
      
      // Add text to current block
      if (currentBlock.children.length > 0) {
        currentBlock.children.push({
          _type: 'span',
          _key: generateKey(),
          text: ' ' + trimmedLine,
          marks: []
        })
      } else {
        currentBlock.children.push({
          _type: 'span',
          _key: generateKey(),
          text: trimmedLine,
          marks: []
        })
      }
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock)
  }
  
  return blocks
}

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Validate transformed document
 */
export function validateDocument(document: any, mapping: MigrationMapping): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  const requiredTransforms = mapping.transforms.filter(t => t.required)
  
  for (const transform of requiredTransforms) {
    if (!document[transform.targetField]) {
      errors.push(`Missing required field: ${transform.targetField}`)
    }
  }
  
  // Validate specific field types
  if (document.slug && (!document.slug.current || !document.slug._type)) {
    errors.push('Invalid slug format')
  }
  
  if (document.publishedAt && isNaN(new Date(document.publishedAt).getTime())) {
    errors.push('Invalid publishedAt date')
  }
  
  if (document.body && !Array.isArray(document.body)) {
    errors.push('Body must be an array of blocks')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Apply field mapping to transform source data
 */
export function applyFieldMapping(sourceData: any, mapping: MigrationMapping): any {
  const document: any = {}
  
  // Apply field transforms
  for (const transform of mapping.transforms) {
    const sourceValue = sourceData[transform.sourceField]
    
    if (sourceValue !== undefined) {
      if (transform.type === 'direct') {
        document[transform.targetField] = sourceValue
      } else if (transform.type === 'transform' && transform.transformer) {
        document[transform.targetField] = transform.transformer(sourceValue, sourceData)
      } else if (transform.type === 'reference' && transform.transformer) {
        document[transform.targetField] = transform.transformer(sourceValue, sourceData)
      }
    } else if (transform.defaultValue !== undefined) {
      document[transform.targetField] = transform.defaultValue
    }
  }
  
  // Apply post-processors
  let finalDocument = document
  if (mapping.postProcessors) {
    for (const processor of mapping.postProcessors) {
      finalDocument = processor(finalDocument, sourceData)
    }
  }
  
  return finalDocument
}

/**
 * Create custom field mapping
 */
export function createCustomMapping(
  sourceFields: string[],
  targetSchema: any
): MigrationMapping {
  const transforms: FieldTransform[] = []
  
  // Auto-map common fields
  const commonMappings = {
    'title': 'title',
    'name': 'title',
    'heading': 'title',
    'slug': 'slug',
    'url': 'slug',
    'date': 'publishedAt',
    'published': 'publishedAt',
    'created': 'publishedAt',
    'description': 'excerpt',
    'summary': 'excerpt',
    'content': 'body',
    'text': 'body',
    'body': 'body'
  }
  
  for (const sourceField of sourceFields) {
    const targetField = commonMappings[sourceField.toLowerCase()] || sourceField
    
    transforms.push({
      sourceField,
      targetField,
      type: 'direct',
      required: ['title', 'slug', 'publishedAt', 'body'].includes(targetField),
      description: `Auto-mapped field: ${sourceField} -> ${targetField}`
    })
  }
  
  return {
    documentType: 'post',
    transforms
  }
}

export default STANDARD_FIELD_MAPPINGS