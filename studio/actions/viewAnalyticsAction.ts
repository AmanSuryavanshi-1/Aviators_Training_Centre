/**
 * Custom document action for viewing analytics in admin dashboard
 */

import {ChartUpwardIcon} from '@sanity/icons'

export const viewAnalyticsAction = {
  name: 'viewAnalytics',
  title: 'View Analytics',
  icon: ChartUpwardIcon,
  
  // Only show for published blog posts
  filter: ({schemaType, document}: any) => {
    return schemaType === 'post' && 
           document && 
           !document._id?.startsWith('drafts.') &&
           document.slug?.current
  },
  
  action: ({document}: any) => {
    const slug = document.slug?.current
    
    if (slug) {
      // Open analytics dashboard with post filter
      const analyticsUrl = `/admin/analytics?post=${slug}`
      window.open(analyticsUrl, '_blank', 'noopener,noreferrer')
    }
  }
}

export const previewPostAction = {
  name: 'previewPost',
  title: 'Preview Post',
  icon: () => '👁️',
  
  // Show for all blog posts with slugs
  filter: ({schemaType, document}: any) => {
    return schemaType === 'post' && document?.slug?.current
  },
  
  action: ({document}: any) => {
    const slug = document.slug?.current
    
    if (slug) {
      // Open post preview in new tab
      const isDraft = document._id?.startsWith('drafts.')
      const previewUrl = isDraft 
        ? `/blog/${slug}?preview=true&token=${process.env.SANITY_PREVIEW_TOKEN || 'preview'}`
        : `/blog/${slug}`
      
      window.open(previewUrl, '_blank', 'noopener,noreferrer')
    }
  }
}

export const duplicatePostAction = {
  name: 'duplicatePost',
  title: 'Duplicate Post',
  icon: () => '📋',
  
  // Show for all blog posts
  filter: ({schemaType}: any) => schemaType === 'post',
  
  action: async ({document, sanityClient}: any) => {
    try {
      // Confirm duplication
      const confirmed = window.confirm(`Are you sure you want to duplicate "${document.title}"?`)
      if (!confirmed) return
      
      // Generate unique slug
      const timestamp = Date.now()
      const baseSlug = document.slug?.current || 'untitled-post'
      const newSlug = `${baseSlug}-copy-${timestamp}`
      
      // Create a copy of the document
      const duplicatedDoc = {
        ...document,
        _id: undefined, // Remove ID to create new document
        _rev: undefined, // Remove revision
        _createdAt: undefined,
        _updatedAt: undefined,
        title: `${document.title} (Copy)`,
        slug: {
          _type: 'slug',
          current: newSlug
        },
        workflowStatus: 'draft',
        publishedAt: new Date().toISOString(),
        featured: false, // Reset featured status
        featuredOnHome: false,
        performanceMetrics: {
          estimatedReadingTime: document.performanceMetrics?.estimatedReadingTime || 0,
          wordCount: document.performanceMetrics?.wordCount || 0,
          lastSEOCheck: new Date().toISOString(),
          seoScore: 0
        },
        contentValidation: {
          hasRequiredFields: !!(document.title && newSlug && document.body),
          hasValidSEO: false,
          hasValidImages: !!document.image,
          readyForPublish: false
        }
      }
      
      // Create the new document
      const result = await sanityClient.create(duplicatedDoc)
      
      // Navigate to the new document
      if (result._id) {
        const editUrl = `/studio/desk/post;${result._id}`
        window.location.href = editUrl
      }
      
      // Show success notification
      console.log('Post duplicated successfully:', result._id)
      
    } catch (error) {
      console.error('Error duplicating post:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to duplicate post: ${errorMessage}`)
    }
  }
}

export const openAdminDashboardAction = {
  name: 'openAdminDashboard',
  title: 'Open Admin Dashboard',
  icon: () => '📊',
  
  // Show for all document types
  filter: () => true,
  
  action: () => {
    window.open('/admin', '_blank', 'noopener,noreferrer')
  }
}

export const validateSEOAction = {
  name: 'validateSEO',
  title: 'Validate SEO',
  icon: () => '🔍',
  
  // Show for blog posts
  filter: ({schemaType}: any) => schemaType === 'post',
  
  action: ({document}: any) => {
    const issues = []
    const warnings = []
    
    // Check required SEO fields
    if (!document.seoTitle && !document.title) {
      issues.push('Missing SEO title')
    }
    if (!document.seoDescription && !document.excerpt) {
      issues.push('Missing SEO description')
    }
    if (!document.focusKeyword) {
      issues.push('Missing focus keyword')
    }
    if (!document.image) {
      issues.push('Missing featured image')
    }
    
    // Check field lengths
    const title = document.seoTitle || document.title || ''
    const description = document.seoDescription || document.excerpt || ''
    
    if (title.length > 60) {
      issues.push(`SEO title too long (${title.length}/60 chars)`)
    } else if (title.length < 30) {
      warnings.push(`SEO title could be longer (${title.length}/60 chars)`)
    }
    
    if (description.length > 160) {
      issues.push(`SEO description too long (${description.length}/160 chars)`)
    } else if (description.length < 120) {
      warnings.push(`SEO description could be longer (${description.length}/160 chars)`)
    }
    
    // Check content
    if (!document.body || document.body.length === 0) {
      issues.push('Missing content')
    }
    
    // Generate report
    let report = `SEO Validation Report for "${document.title}"\n\n`
    
    if (issues.length === 0 && warnings.length === 0) {
      report += '✅ All SEO checks passed! This post is well-optimized.'
    } else {
      if (issues.length > 0) {
        report += `❌ Issues Found (${issues.length}):\n`
        issues.forEach((issue, i) => {
          report += `${i + 1}. ${issue}\n`
        })
        report += '\n'
      }
      
      if (warnings.length > 0) {
        report += `⚠️ Recommendations (${warnings.length}):\n`
        warnings.forEach((warning, i) => {
          report += `${i + 1}. ${warning}\n`
        })
      }
    }
    
    alert(report)
  }
}

export const checkReadinessAction = {
  name: 'checkReadiness',
  title: 'Check Readiness',
  icon: () => '✅',
  
  // Show for blog posts
  filter: ({schemaType}: any) => schemaType === 'post',
  
  action: ({document}: any) => {
    const checks = {
      'Title': !!document.title,
      'Slug': !!document.slug?.current,
      'Excerpt': !!document.excerpt,
      'Content': !!document.body && document.body.length > 0,
      'Featured Image': !!document.image,
      'Category': !!document.category,
      'Author': !!document.author,
      'SEO Title': !!document.seoTitle,
      'SEO Description': !!document.seoDescription,
      'Focus Keyword': !!document.focusKeyword,
    }
    
    const passed = Object.values(checks).filter(Boolean).length
    const total = Object.keys(checks).length
    const percentage = Math.round((passed / total) * 100)
    
    const failedChecks = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check)
    
    let message = `📊 Content Readiness: ${percentage}% (${passed}/${total})\n\n`
    
    if (failedChecks.length > 0) {
      message += `Missing:\n${failedChecks.map(check => `• ${check}`).join('\n')}`
    } else {
      message += '🎉 All checks passed! This post is ready for publication.'
    }
    
    alert(message)
  }
}

// Export all actions as an array for easy import
export const customDocumentActions = [
  viewAnalyticsAction,
  previewPostAction,
  duplicatePostAction,
  validateSEOAction,
  checkReadinessAction,
  openAdminDashboardAction
]

export default customDocumentActions