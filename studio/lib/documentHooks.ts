// Sanity Document Hooks for SEO Analysis
import { analyzeSEOContent } from './seoAnalysis'

// Hook to automatically update SEO fields when content changes
export const seoAnalysisHook = {
  // This hook runs before the document is saved
  'before:save': async (props: any) => {
    const { document } = props
    
    // Only run on blog posts
    if (document._type !== 'post') {
      return document
    }
    
    // Extract necessary fields
    const title = document.title || ''
    const content = document.content || []
    const focusKeyword = document.focusKeyword || ''
    const seoTitle = document.seoTitle || ''
    const seoDescription = document.seoDescription || ''
    
    // Perform SEO analysis
    const analysis = analyzeSEOContent(
      title,
      content,
      focusKeyword,
      seoTitle,
      seoDescription
    )
    
    // Update the document with analysis results
    return {
      ...document,
      wordCount: analysis.wordCount,
      readingTime: analysis.readingTime,
      keywordDensity: analysis.keywordDensity,
      seoScore: analysis.seoScore,
      seoRecommendations: analysis.recommendations,
      tableOfContents: analysis.tableOfContents,
    }
  }
}

// Export for use in sanity.config.ts
export default seoAnalysisHook