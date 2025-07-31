/**
 * Data validation utilities for blog migration
 * Ensures data integrity and identifies potential issues before migration
 */

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  score: number // 0-100 quality score
}

export interface ValidationError {
  field: string
  type: 'missing' | 'invalid_format' | 'invalid_type' | 'constraint_violation'
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  suggestedFix?: string
}

export interface ValidationWarning {
  field: string
  type: 'quality' | 'seo' | 'accessibility' | 'performance'
  message: string
  impact: 'high' | 'medium' | 'low'
  recommendation?: string
}

export interface ValidationRules {
  required: string[]
  types: { [field: string]: string }
  constraints: { [field: string]: ValidationConstraint }
  custom: Array<(data: any) => ValidationError | null>
}

export interface ValidationConstraint {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  allowedValues?: any[]
  min?: number
  max?: number
}

class DataValidator {
  private rules: ValidationRules

  constructor(rules: ValidationRules) {
    this.rules = rules
  }

  /**
   * Validate a single document
   */
  validateDocument(data: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check required fields
    this.validateRequiredFields(data, errors)
    
    // Check field types
    this.validateFieldTypes(data, errors)
    
    // Check constraints
    this.validateConstraints(data, errors, warnings)
    
    // Run custom validations
    this.runCustomValidations(data, errors)
    
    // Generate quality warnings
    this.generateQualityWarnings(data, warnings)
    
    // Calculate quality score
    const score = this.calculateQualityScore(data, errors, warnings)

    return {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      score
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(data: any, errors: ValidationError[]): void {
    for (const field of this.rules.required) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push({
          field,
          type: 'missing',
          message: `Required field '${field}' is missing or empty`,
          severity: 'critical',
          suggestedFix: `Add a value for the '${field}' field`
        })
      }
    }
  }

  /**
   * Validate field types
   */
  private validateFieldTypes(data: any, errors: ValidationError[]): void {
    for (const [field, expectedType] of Object.entries(this.rules.types)) {
      const value = data[field]
      
      if (value === undefined || value === null) continue
      
      if (!this.isValidType(value, expectedType)) {
        errors.push({
          field,
          type: 'invalid_type',
          message: `Field '${field}' should be of type '${expectedType}' but got '${typeof value}'`,
          severity: 'high',
          suggestedFix: `Convert '${field}' to ${expectedType} format`
        })
      }
    }
  }

  /**
   * Validate field constraints
   */
  private validateConstraints(data: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    for (const [field, constraint] of Object.entries(this.rules.constraints)) {
      const value = data[field]
      
      if (value === undefined || value === null) continue
      
      // String length constraints
      if (typeof value === 'string') {
        if (constraint.minLength && value.length < constraint.minLength) {
          errors.push({
            field,
            type: 'constraint_violation',
            message: `Field '${field}' is too short (${value.length} < ${constraint.minLength})`,
            severity: 'medium',
            suggestedFix: `Expand '${field}' to at least ${constraint.minLength} characters`
          })
        }
        
        if (constraint.maxLength && value.length > constraint.maxLength) {
          errors.push({
            field,
            type: 'constraint_violation',
            message: `Field '${field}' is too long (${value.length} > ${constraint.maxLength})`,
            severity: 'medium',
            suggestedFix: `Shorten '${field}' to ${constraint.maxLength} characters or less`
          })
        }
        
        if (constraint.pattern && !constraint.pattern.test(value)) {
          errors.push({
            field,
            type: 'invalid_format',
            message: `Field '${field}' does not match required pattern`,
            severity: 'medium',
            suggestedFix: `Update '${field}' to match the required format`
          })
        }
      }
      
      // Numeric constraints
      if (typeof value === 'number') {
        if (constraint.min !== undefined && value < constraint.min) {
          errors.push({
            field,
            type: 'constraint_violation',
            message: `Field '${field}' is below minimum value (${value} < ${constraint.min})`,
            severity: 'medium'
          })
        }
        
        if (constraint.max !== undefined && value > constraint.max) {
          errors.push({
            field,
            type: 'constraint_violation',
            message: `Field '${field}' exceeds maximum value (${value} > ${constraint.max})`,
            severity: 'medium'
          })
        }
      }
      
      // Allowed values
      if (constraint.allowedValues && !constraint.allowedValues.includes(value)) {
        errors.push({
          field,
          type: 'constraint_violation',
          message: `Field '${field}' has invalid value '${value}'`,
          severity: 'medium',
          suggestedFix: `Use one of: ${constraint.allowedValues.join(', ')}`
        })
      }
    }
  }

  /**
   * Run custom validation rules
   */
  private runCustomValidations(data: any, errors: ValidationError[]): void {
    for (const validator of this.rules.custom) {
      const error = validator(data)
      if (error) {
        errors.push(error)
      }
    }
  }

  /**
   * Generate quality warnings
   */
  private generateQualityWarnings(data: any, warnings: ValidationWarning[]): void {
    // SEO warnings
    if (data.title && data.title.length < 30) {
      warnings.push({
        field: 'title',
        type: 'seo',
        message: 'Title is quite short for SEO purposes',
        impact: 'medium',
        recommendation: 'Consider expanding the title to 30-60 characters for better SEO'
      })
    }
    
    if (data.excerpt && data.excerpt.length < 120) {
      warnings.push({
        field: 'excerpt',
        type: 'seo',
        message: 'Excerpt is short for meta description',
        impact: 'medium',
        recommendation: 'Expand excerpt to 120-160 characters for better search results'
      })
    }
    
    if (!data.image) {
      warnings.push({
        field: 'image',
        type: 'seo',
        message: 'No featured image provided',
        impact: 'high',
        recommendation: 'Add a featured image for better social sharing and engagement'
      })
    }
    
    // Content quality warnings
    if (data.body) {
      const wordCount = this.calculateWordCount(data.body)
      
      if (wordCount < 300) {
        warnings.push({
          field: 'body',
          type: 'quality',
          message: `Content is quite short (${wordCount} words)`,
          impact: 'medium',
          recommendation: 'Consider expanding content to at least 300 words for better SEO'
        })
      }
      
      if (wordCount > 3000) {
        warnings.push({
          field: 'body',
          type: 'quality',
          message: `Content is very long (${wordCount} words)`,
          impact: 'low',
          recommendation: 'Consider breaking into multiple posts or adding subheadings'
        })
      }
    }
    
    // Accessibility warnings
    if (data.image && !data.image.alt) {
      warnings.push({
        field: 'image',
        type: 'accessibility',
        message: 'Featured image missing alt text',
        impact: 'high',
        recommendation: 'Add descriptive alt text for accessibility'
      })
    }
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(data: any, errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100
    
    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 25
          break
        case 'high':
          score -= 15
          break
        case 'medium':
          score -= 10
          break
        case 'low':
          score -= 5
          break
      }
    }
    
    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 8
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    }
    
    // Bonus points for good practices
    if (data.excerpt && data.excerpt.length >= 120 && data.excerpt.length <= 160) {
      score += 5 // Good meta description length
    }
    
    if (data.title && data.title.length >= 30 && data.title.length <= 60) {
      score += 5 // Good title length
    }
    
    if (data.image && data.image.alt) {
      score += 5 // Has alt text
    }
    
    if (data.tags && data.tags.length >= 3 && data.tags.length <= 8) {
      score += 3 // Good number of tags
    }
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Check if value matches expected type
   */
  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
      case 'slug':
        return typeof value === 'object' && value._type === 'slug' && typeof value.current === 'string'
      case 'reference':
        return typeof value === 'object' && value._type === 'reference' && typeof value._ref === 'string'
      case 'image':
        return typeof value === 'object' && value._type === 'image'
      case 'blocks':
        return Array.isArray(value) && value.every(block => block._type === 'block')
      default:
        return true
    }
  }

  /**
   * Calculate word count from content
   */
  private calculateWordCount(content: any): number {
    if (typeof content === 'string') {
      return content.trim().split(/\s+/).filter(word => word.length > 0).length
    }
    
    if (Array.isArray(content)) {
      // Sanity block content
      return content.reduce((count, block) => {
        if (block._type === 'block' && block.children) {
          const text = block.children
            .filter((child: any) => child._type === 'span')
            .map((child: any) => child.text || '')
            .join(' ')
          return count + text.trim().split(/\s+/).filter(word => word.length > 0).length
        }
        return count
      }, 0)
    }
    
    return 0
  }
}

// Predefined validation rules for blog posts
export const BLOG_POST_VALIDATION_RULES: ValidationRules = {
  required: ['title', 'slug', 'body', 'publishedAt'],
  types: {
    title: 'string',
    slug: 'slug',
    excerpt: 'string',
    body: 'blocks',
    publishedAt: 'date',
    featured: 'boolean',
    image: 'image',
    category: 'reference',
    tags: 'array',
    author: 'reference',
    readingTime: 'number',
    wordCount: 'number'
  },
  constraints: {
    title: {
      minLength: 10,
      maxLength: 100
    },
    excerpt: {
      minLength: 50,
      maxLength: 200
    },
    readingTime: {
      min: 1,
      max: 60
    },
    workflowStatus: {
      allowedValues: ['draft', 'review', 'approved', 'published', 'archived']
    }
  },
  custom: [
    // Custom validation: slug should be URL-friendly
    (data) => {
      if (data.slug && data.slug.current) {
        const slug = data.slug.current
        if (!/^[a-z0-9-]+$/.test(slug)) {
          return {
            field: 'slug',
            type: 'invalid_format',
            message: 'Slug contains invalid characters',
            severity: 'high',
            suggestedFix: 'Use only lowercase letters, numbers, and hyphens'
          }
        }
        
        if (slug.startsWith('-') || slug.endsWith('-')) {
          return {
            field: 'slug',
            type: 'invalid_format',
            message: 'Slug should not start or end with hyphen',
            severity: 'medium',
            suggestedFix: 'Remove leading/trailing hyphens from slug'
          }
        }
      }
      return null
    },
    
    // Custom validation: published date should not be in future
    (data) => {
      if (data.publishedAt) {
        const publishDate = new Date(data.publishedAt)
        const now = new Date()
        
        if (publishDate > now) {
          return {
            field: 'publishedAt',
            type: 'constraint_violation',
            message: 'Published date is in the future',
            severity: 'medium',
            suggestedFix: 'Use current date or a past date for published posts'
          }
        }
      }
      return null
    },
    
    // Custom validation: ensure content has substance
    (data) => {
      if (data.body && Array.isArray(data.body)) {
        const hasContent = data.body.some(block => 
          block._type === 'block' && 
          block.children && 
          block.children.some((child: any) => child.text && child.text.trim())
        )
        
        if (!hasContent) {
          return {
            field: 'body',
            type: 'missing',
            message: 'Content body appears to be empty',
            severity: 'critical',
            suggestedFix: 'Add meaningful content to the post body'
          }
        }
      }
      return null
    }
  ]
}

/**
 * Validate multiple documents
 */
export function validateDocuments(documents: any[], rules?: ValidationRules): {
  results: Array<{ id: string; validation: ValidationResult }>
  summary: {
    total: number
    valid: number
    invalid: number
    averageScore: number
    commonIssues: Array<{ issue: string; count: number }>
  }
} {
  const validator = new DataValidator(rules || BLOG_POST_VALIDATION_RULES)
  const results = documents.map((doc, index) => ({
    id: doc.id || doc._id || `document-${index}`,
    validation: validator.validateDocument(doc)
  }))
  
  // Generate summary
  const valid = results.filter(r => r.validation.valid).length
  const invalid = results.length - valid
  const averageScore = results.reduce((sum, r) => sum + r.validation.score, 0) / results.length
  
  // Find common issues
  const issueCount: { [key: string]: number } = {}
  results.forEach(result => {
    result.validation.errors.forEach(error => {
      const key = `${error.field}: ${error.message}`
      issueCount[key] = (issueCount[key] || 0) + 1
    })
  })
  
  const commonIssues = Object.entries(issueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([issue, count]) => ({ issue, count }))
  
  return {
    results,
    summary: {
      total: results.length,
      valid,
      invalid,
      averageScore: Math.round(averageScore),
      commonIssues
    }
  }
}

/**
 * Create validation report
 */
export function createValidationReport(
  validationResults: ReturnType<typeof validateDocuments>
): string {
  const { results, summary } = validationResults
  
  let report = '# Data Validation Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`
  
  // Summary
  report += '## Summary\n\n'
  report += `- **Total Documents:** ${summary.total}\n`
  report += `- **Valid:** ${summary.valid} (${Math.round((summary.valid / summary.total) * 100)}%)\n`
  report += `- **Invalid:** ${summary.invalid} (${Math.round((summary.invalid / summary.total) * 100)}%)\n`
  report += `- **Average Quality Score:** ${summary.averageScore}/100\n\n`
  
  // Common issues
  if (summary.commonIssues.length > 0) {
    report += '## Common Issues\n\n'
    summary.commonIssues.forEach((issue, index) => {
      report += `${index + 1}. **${issue.issue}** (${issue.count} documents)\n`
    })
    report += '\n'
  }
  
  // Individual results (only show invalid ones)
  const invalidResults = results.filter(r => !r.validation.valid)
  if (invalidResults.length > 0) {
    report += '## Invalid Documents\n\n'
    invalidResults.forEach(result => {
      report += `### ${result.id}\n\n`
      report += `**Quality Score:** ${result.validation.score}/100\n\n`
      
      if (result.validation.errors.length > 0) {
        report += '**Errors:**\n'
        result.validation.errors.forEach(error => {
          report += `- **${error.field}:** ${error.message} (${error.severity})\n`
          if (error.suggestedFix) {
            report += `  *Fix:* ${error.suggestedFix}\n`
          }
        })
        report += '\n'
      }
      
      if (result.validation.warnings.length > 0) {
        report += '**Warnings:**\n'
        result.validation.warnings.forEach(warning => {
          report += `- **${warning.field}:** ${warning.message} (${warning.impact} impact)\n`
          if (warning.recommendation) {
            report += `  *Recommendation:* ${warning.recommendation}\n`
          }
        })
        report += '\n'
      }
    })
  }
  
  return report
}

export { DataValidator }
export default DataValidator