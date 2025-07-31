import {definePlugin} from 'sanity'
import {calculateSEOScore, getWordCount} from '../../src/lib/seo/validation'

// Helper function to extract text from Sanity block content
function extractTextFromBlocks(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return ''
      return block.children
        .filter((child: any) => child._type === 'span')
        .map((child: any) => child.text || '')
        .join('')
    })
    .join(' ')
    .trim()
}

export const seoValidationPlugin = definePlugin({
  name: 'seo-validation',
  schema: {
    types: [
      {
        name: 'blogPost',
        type: 'document',
        validation: (Rule: any) => Rule.custom((document: any) => {
          if (!document || document._type !== 'blogPost') return true
          
          const errors: string[] = []
          const warnings: string[] = []
          
          const content = extractTextFromBlocks(document.content || [])
          const seoData = {
            title: document.title || '',
            seoTitle: document.seoTitle || '',
            seoDescription: document.seoDescription || '',
            focusKeyword: document.focusKeyword || '',
            content
          }
          
          const seoResult = calculateSEOScore(seoData)
          
          // Critical SEO errors
          if (document.seoTitle && document.seoTitle.length > 60) {
            errors.push('SEO title should be under 60 characters for optimal display in search results.')
          }
          
          if (document.seoDescription && document.seoDescription.length > 160) {
            errors.push('SEO description should be under 160 characters for optimal display in search results.')
          }
          
          // SEO warnings
          if (seoResult.score < 60) {
            warnings.push(`SEO score is low (${seoResult.score}/100). Consider improving your SEO optimization.`)
          }
          
          if (document.seoDescription && document.seoDescription.length < 120) {
            warnings.push('SEO description could be longer (120+ characters) to better utilize search result space.')
          }
          
          // Focus keyword validation
          if (document.focusKeyword) {
            const titleLower = (document.seoTitle || document.title || '').toLowerCase()
            const descLower = (document.seoDescription || '').toLowerCase()
            const keywordLower = document.focusKeyword.toLowerCase()
            
            if (!titleLower.includes(keywordLower)) {
              warnings.push(`Focus keyword "${document.focusKeyword}" not found in title. Consider including it for better SEO.`)
            }
            
            if (!descLower.includes(keywordLower)) {
              warnings.push(`Focus keyword "${document.focusKeyword}" not found in description. Consider including it for better SEO.`)
            }
          }
          
          // Content length validation
          const wordCount = getWordCount(content)
          if (wordCount < 300) {
            warnings.push(`Content is short (${wordCount} words). Articles with 300+ words tend to perform better in search results.`)
          }
          
          // Featured image validation
          if (!document.mainImage) {
            warnings.push('Featured image is recommended for better social media sharing and user engagement.')
          } else if (!document.mainImage.alt) {
            warnings.push('Alt text is recommended for accessibility and SEO.')
          }
          
          // Return validation results
          if (errors.length > 0) {
            return errors.join(' ')
          }
          
          if (warnings.length > 0) {
            return {
              level: 'warning',
              message: warnings.join(' ')
            }
          }
          
          return true
        })
      }
    ]
  }
})

export default seoValidationPlugin