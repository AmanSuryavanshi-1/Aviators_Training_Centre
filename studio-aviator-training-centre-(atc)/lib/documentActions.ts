import { DocumentActionComponent } from 'sanity'
import { previewConfig } from './preview'

// Custom publish action with validation
export const customPublishAction: DocumentActionComponent = (props) => {
  const { type, draft, published, onComplete } = props
  
  if (type !== 'post') {
    return null
  }

  const document = draft || published
  
  // Validation checks
  const validationIssues = []
  
  if (!document?.title) validationIssues.push('Title is required')
  if (!document?.slug?.current) validationIssues.push('Slug is required')
  if (!document?.excerpt) validationIssues.push('Excerpt is required')
  if (!document?.image) validationIssues.push('Featured image is required')
  if (!document?.category) validationIssues.push('Category is required')
  if (!document?.body || document.body.length === 0) validationIssues.push('Content is required')
  
  // SEO validation
  if (!document?.seoTitle) validationIssues.push('SEO title is recommended')
  if (!document?.seoDescription) validationIssues.push('SEO description is recommended')
  if (!document?.focusKeyword) validationIssues.push('Focus keyword is recommended')
  
  // Image alt text validation
  if (document?.image && !document.image.alt) {
    validationIssues.push('Featured image alt text is required')
  }

  return {
    label: validationIssues.length > 0 ? '⚠️ Publish (Issues Found)' : '✅ Publish',
    icon: () => validationIssues.length > 0 ? '⚠️' : '✅',
    disabled: validationIssues.length > 0,
    title: validationIssues.length > 0 
      ? `Cannot publish: ${validationIssues.join(', ')}`
      : 'Publish this blog post',
    onHandle: () => {
      if (validationIssues.length > 0) {
        alert(`Please fix the following issues before publishing:\n\n${validationIssues.join('\n')}`)
        return
      }
      
      // Proceed with publishing
      onComplete()
    },
  }
}

// Preview action
export const previewAction: DocumentActionComponent = (props) => {
  const { type, draft, published } = props
  
  if (type !== 'post') {
    return null
  }

  const document = draft || published
  const slug = document?.slug?.current
  
  if (!slug) {
    return {
      label: 'Preview',
      icon: () => '👁️',
      disabled: true,
      title: 'Add a slug to enable preview',
      onHandle: () => {},
    }
  }

  return {
    label: 'Preview',
    icon: () => '👁️',
    title: 'Preview this blog post',
    onHandle: () => {
      const previewUrl = previewConfig.generatePreviewUrl(document)
      if (previewUrl) {
        window.open(previewUrl, '_blank', 'noopener,noreferrer')
      }
    },
  }
}

// SEO analysis action
export const seoAnalysisAction: DocumentActionComponent = (props) => {
  const { type, draft, published } = props
  
  if (type !== 'post') {
    return null
  }

  const document = draft || published
  
  return {
    label: 'SEO Analysis',
    icon: () => '🔍',
    title: 'Analyze SEO performance',
    onHandle: () => {
      // Calculate SEO score
      let score = 0
      let maxScore = 100
      
      // Title analysis (20 points)
      if (document?.title) {
        score += 10
        if (document.title.length >= 30 && document.title.length <= 60) {
          score += 10
        }
      }
      
      // SEO title analysis (15 points)
      if (document?.seoTitle) {
        score += 10
        if (document.seoTitle.length <= 60) {
          score += 5
        }
      }
      
      // Meta description analysis (15 points)
      if (document?.seoDescription) {
        score += 10
        if (document.seoDescription.length >= 120 && document.seoDescription.length <= 160) {
          score += 5
        }
      }
      
      // Content analysis (20 points)
      if (document?.body && document.body.length > 0) {
        score += 15
        // Check for headings
        const hasHeadings = document.body.some((block: any) => 
          block._type === 'block' && ['h2', 'h3', 'h4'].includes(block.style)
        )
        if (hasHeadings) score += 5
      }
      
      // Image analysis (10 points)
      if (document?.image) {
        score += 5
        if (document.image.alt) score += 5
      }
      
      // Focus keyword analysis (10 points)
      if (document?.focusKeyword) {
        score += 5
        // Check if keyword appears in title
        if (document.title?.toLowerCase().includes(document.focusKeyword.toLowerCase())) {
          score += 5
        }
      }
      
      // Category and author (10 points)
      if (document?.category) score += 5
      if (document?.author) score += 5
      
      const percentage = Math.round((score / maxScore) * 100)
      
      let status = '❌ Poor'
      if (percentage >= 80) status = '✅ Excellent'
      else if (percentage >= 60) status = '⚠️ Good'
      else if (percentage >= 40) status = '🔶 Fair'
      
      alert(`SEO Analysis Results:\n\nScore: ${score}/${maxScore} (${percentage}%)\nStatus: ${status}\n\nRecommendations:\n${
        !document?.seoTitle ? '• Add SEO title\n' : ''
      }${
        !document?.seoDescription ? '• Add meta description\n' : ''
      }${
        !document?.focusKeyword ? '• Set focus keyword\n' : ''
      }${
        !document?.image?.alt ? '• Add alt text to featured image\n' : ''
      }`)
    },
  }
}

// Duplicate post action
export const duplicateAction: DocumentActionComponent = (props) => {
  const { type, draft, published, onComplete } = props
  
  if (type !== 'post') {
    return null
  }

  const document = draft || published
  
  return {
    label: 'Duplicate',
    icon: () => '📋',
    title: 'Create a copy of this post',
    onHandle: () => {
      if (confirm('Create a duplicate of this blog post?')) {
        // This would need to be implemented with Sanity's client
        console.log('Duplicating post:', document._id)
        alert('Duplicate functionality will be implemented in the next phase')
      }
    },
  }
}