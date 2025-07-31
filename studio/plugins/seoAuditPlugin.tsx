import React from 'react'
import { definePlugin } from 'sanity'
import { seoMetaFields } from 'sanity-plugin-seo'
// Temporarily disable seoPane due to compatibility issues
// import { seoPane } from 'sanity-plugin-seo-pane'

// SEO audit configuration
const seoAuditConfig = {
  // Title validation rules
  title: {
    minLength: 30,
    maxLength: 60,
    required: true,
  },
  
  // Meta description validation rules
  description: {
    minLength: 120,
    maxLength: 160,
    required: true,
  },
  
  // Focus keyword validation
  focusKeyword: {
    required: true,
    density: {
      min: 0.5,
      max: 3.0,
    },
  },
  
  // Content validation rules
  content: {
    minWords: 300,
    maxWords: 3000,
    readabilityScore: 60,
  },
  
  // Image validation
  images: {
    altTextRequired: true,
    maxFileSize: 1024 * 1024, // 1MB
    recommendedFormats: ['webp', 'jpg', 'png'],
  },
  
  // Link validation
  links: {
    checkBrokenLinks: true,
    maxExternalLinks: 10,
    requireNofollow: false,
  },
}

// SEO validation functions
export const validateSEOTitle = (title: string): { isValid: boolean; message?: string; score: number } => {
  if (!title) {
    return { isValid: false, message: 'Title is required', score: 0 }
  }
  
  if (title.length < seoAuditConfig.title.minLength) {
    return { 
      isValid: false, 
      message: `Title too short. Minimum ${seoAuditConfig.title.minLength} characters required.`,
      score: 25
    }
  }
  
  if (title.length > seoAuditConfig.title.maxLength) {
    return { 
      isValid: false, 
      message: `Title too long. Maximum ${seoAuditConfig.title.maxLength} characters allowed.`,
      score: 50
    }
  }
  
  return { isValid: true, score: 100 }
}

export const validateSEODescription = (description: string): { isValid: boolean; message?: string; score: number } => {
  if (!description) {
    return { isValid: false, message: 'Meta description is required', score: 0 }
  }
  
  if (description.length < seoAuditConfig.description.minLength) {
    return { 
      isValid: false, 
      message: `Description too short. Minimum ${seoAuditConfig.description.minLength} characters required.`,
      score: 25
    }
  }
  
  if (description.length > seoAuditConfig.description.maxLength) {
    return { 
      isValid: false, 
      message: `Description too long. Maximum ${seoAuditConfig.description.maxLength} characters allowed.`,
      score: 50
    }
  }
  
  return { isValid: true, score: 100 }
}

export const validateFocusKeyword = (content: string, focusKeyword: string): { isValid: boolean; message?: string; score: number } => {
  if (!focusKeyword) {
    return { isValid: false, message: 'Focus keyword is required', score: 0 }
  }
  
  if (!content) {
    return { isValid: false, message: 'Content is required to validate keyword density', score: 0 }
  }
  
  const wordCount = content.split(/\s+/).length
  const keywordMatches = (content.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length
  const density = (keywordMatches / wordCount) * 100
  
  if (density < seoAuditConfig.focusKeyword.density.min) {
    return { 
      isValid: false, 
      message: `Keyword density too low (${density.toFixed(1)}%). Minimum ${seoAuditConfig.focusKeyword.density.min}% required.`,
      score: 30
    }
  }
  
  if (density > seoAuditConfig.focusKeyword.density.max) {
    return { 
      isValid: false, 
      message: `Keyword density too high (${density.toFixed(1)}%). Maximum ${seoAuditConfig.focusKeyword.density.max}% allowed.`,
      score: 60
    }
  }
  
  return { isValid: true, score: 100 }
}

export const validateContentReadability = (content: string): { isValid: boolean; message?: string; score: number } => {
  if (!content) {
    return { isValid: false, message: 'Content is required', score: 0 }
  }
  
  const wordCount = content.split(/\s+/).length
  
  if (wordCount < seoAuditConfig.content.minWords) {
    return { 
      isValid: false, 
      message: `Content too short. Minimum ${seoAuditConfig.content.minWords} words required.`,
      score: 25
    }
  }
  
  if (wordCount > seoAuditConfig.content.maxWords) {
    return { 
      isValid: false, 
      message: `Content too long. Maximum ${seoAuditConfig.content.maxWords} words recommended.`,
      score: 75
    }
  }
  
  // Simple readability calculation (Flesch Reading Ease approximation)
  const sentences = content.split(/[.!?]+/).length
  const syllables = content.split(/[aeiouAEIOU]/).length - 1
  const avgWordsPerSentence = wordCount / sentences
  const avgSyllablesPerWord = syllables / wordCount
  
  const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  if (readabilityScore < seoAuditConfig.content.readabilityScore) {
    return { 
      isValid: false, 
      message: `Content readability score is ${readabilityScore.toFixed(0)}. Aim for ${seoAuditConfig.content.readabilityScore}+ for better readability.`,
      score: 70
    }
  }
  
  return { isValid: true, score: 100 }
}

// Calculate overall SEO score
export const calculateSEOScore = (document: any): number => {
  const titleValidation = validateSEOTitle(document.seoTitle || document.title)
  const descriptionValidation = validateSEODescription(document.seoDescription)
  const keywordValidation = validateFocusKeyword(
    document.content ? JSON.stringify(document.content) : '', 
    document.focusKeyword
  )
  const contentValidation = validateContentReadability(
    document.content ? JSON.stringify(document.content) : ''
  )
  
  const scores = [
    titleValidation.score,
    descriptionValidation.score,
    keywordValidation.score,
    contentValidation.score,
  ]
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

// SEO audit warnings component
export const SEOAuditWarnings = ({ document }: { document: any }) => {
  const titleValidation = validateSEOTitle(document.seoTitle || document.title)
  const descriptionValidation = validateSEODescription(document.seoDescription)
  const keywordValidation = validateFocusKeyword(
    document.content ? JSON.stringify(document.content) : '', 
    document.focusKeyword
  )
  const contentValidation = validateContentReadability(
    document.content ? JSON.stringify(document.content) : ''
  )
  
  const warnings = [
    titleValidation,
    descriptionValidation,
    keywordValidation,
    contentValidation,
  ].filter(validation => !validation.isValid)
  
  if (warnings.length === 0) {
    return (
      <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '4px', color: '#2d5a2d' }}>
        ✅ All SEO checks passed! Your content is optimized.
      </div>
    )
  }
  
  return (
    <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>⚠️ SEO Improvements Needed:</h4>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
        {warnings.map((warning, index) => (
          <li key={index} style={{ marginBottom: '4px' }}>
            {warning.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Real-time SEO score display
export const SEOScoreDisplay = ({ document }: { document: any }) => {
  const score = calculateSEOScore(document)
  
  let color = '#dc3545' // Red
  let emoji = '❌'
  
  if (score >= 80) {
    color = '#28a745' // Green
    emoji = '✅'
  } else if (score >= 60) {
    color = '#ffc107' // Yellow
    emoji = '⚠️'
  }
  
  return (
    <div style={{ 
      padding: '12px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{ fontSize: '20px' }}>{emoji}</span>
      <div>
        <strong style={{ color }}>SEO Score: {score}%</strong>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          {score >= 80 ? 'Excellent SEO optimization!' : 
           score >= 60 ? 'Good SEO, room for improvement' : 
           'Needs SEO optimization'}
        </div>
      </div>
    </div>
  )
}

// Main SEO audit plugin
export const seoAuditPlugin = definePlugin({
  name: 'seo-audit-plugin',
  plugins: [
    // Add SEO meta fields to blog posts
    seoMetaFields({
      types: ['post'],
      titleField: 'seoTitle',
      descriptionField: 'seoDescription',
      imageField: 'seoImage',
    }),
    
    // SEO pane temporarily disabled due to compatibility issues
    // Will be re-enabled once plugin compatibility is resolved
  ],
})