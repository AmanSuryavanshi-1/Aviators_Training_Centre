// SEO Content Analysis Functions for Sanity Studio

export interface SEOAnalysis {
  wordCount: number
  readingTime: number
  keywordDensity: number
  seoScore: number
  recommendations: string[]
  tableOfContents: Array<{
    heading: string
    anchor: string
    level: number
  }>
}

// Extract plain text from Sanity block content
export function extractTextFromBlocks(blocks: any[]): string {
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
}

// Extract headings for table of contents
export function extractHeadings(blocks: any[]): Array<{heading: string, anchor: string, level: number}> {
  if (!blocks || !Array.isArray(blocks)) return []
  
  return blocks
    .filter(block => block._type === 'block' && ['h1', 'h2', 'h3', 'h4'].includes(block.style))
    .map(block => {
      const text = block.children
        ?.filter((child: any) => child._type === 'span')
        ?.map((child: any) => child.text || '')
        ?.join('') || ''
      
      const level = parseInt(block.style.replace('h', ''))
      const anchor = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      
      return {
        heading: text,
        anchor,
        level
      }
    })
    .filter(item => item.heading.length > 0)
}

// Calculate word count
export function calculateWordCount(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Calculate reading time (average 200 words per minute)
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200)
}

// Calculate keyword density
export function calculateKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0
  
  const words = text.toLowerCase().split(/\s+/)
  const keywordWords = keyword.toLowerCase().split(/\s+/)
  const keywordLength = keywordWords.length
  
  let matches = 0
  for (let i = 0; i <= words.length - keywordLength; i++) {
    const phrase = words.slice(i, i + keywordLength).join(' ')
    if (phrase === keyword.toLowerCase()) {
      matches++
    }
  }
  
  return words.length > 0 ? (matches / words.length) * 100 : 0
}

// Generate SEO recommendations
export function generateSEORecommendations(
  title: string,
  content: string,
  focusKeyword: string,
  seoTitle: string,
  seoDescription: string,
  headings: Array<{heading: string, level: number}>,
  wordCount: number,
  keywordDensity: number
): string[] {
  const recommendations: string[] = []
  
  // Title recommendations
  if (!title) {
    recommendations.push('Add a compelling title to your post')
  } else if (title.length < 30) {
    recommendations.push('Consider making your title longer (30-60 characters)')
  } else if (title.length > 60) {
    recommendations.push('Consider shortening your title (under 60 characters)')
  }
  
  // SEO Title recommendations
  if (!seoTitle) {
    recommendations.push('Add an SEO title optimized for search engines')
  } else if (seoTitle.length > 60) {
    recommendations.push('SEO title is too long (should be under 60 characters)')
  }
  
  // SEO Description recommendations
  if (!seoDescription) {
    recommendations.push('Add an SEO description to improve search appearance')
  } else if (seoDescription.length < 120) {
    recommendations.push('SEO description is too short (aim for 150-160 characters)')
  } else if (seoDescription.length > 160) {
    recommendations.push('SEO description is too long (should be under 160 characters)')
  }
  
  // Focus keyword recommendations
  if (!focusKeyword) {
    recommendations.push('Add a focus keyword to optimize for search')
  } else {
    // Check if keyword is in title
    if (!title.toLowerCase().includes(focusKeyword.toLowerCase())) {
      recommendations.push('Consider including your focus keyword in the title')
    }
    
    // Check if keyword is in SEO title
    if (seoTitle && !seoTitle.toLowerCase().includes(focusKeyword.toLowerCase())) {
      recommendations.push('Consider including your focus keyword in the SEO title')
    }
    
    // Check if keyword is in SEO description
    if (seoDescription && !seoDescription.toLowerCase().includes(focusKeyword.toLowerCase())) {
      recommendations.push('Consider including your focus keyword in the SEO description')
    }
    
    // Check keyword density
    if (keywordDensity < 0.5) {
      recommendations.push('Focus keyword density is low - consider using it more naturally in content')
    } else if (keywordDensity > 3) {
      recommendations.push('Focus keyword density is high - avoid keyword stuffing')
    }
  }
  
  // Content length recommendations
  if (wordCount < 300) {
    recommendations.push('Content is quite short - consider adding more valuable information (aim for 800+ words)')
  } else if (wordCount < 800) {
    recommendations.push('Consider expanding your content for better SEO (aim for 800+ words)')
  }
  
  // Heading structure recommendations
  const h1Count = headings.filter(h => h.level === 1).length
  const h2Count = headings.filter(h => h.level === 2).length
  
  if (h1Count > 1) {
    recommendations.push('Use only one H1 heading per post')
  }
  
  if (h2Count === 0 && wordCount > 500) {
    recommendations.push('Add H2 headings to break up your content and improve readability')
  }
  
  // Check for focus keyword in headings
  if (focusKeyword && headings.length > 0) {
    const keywordInHeadings = headings.some(h => 
      h.heading.toLowerCase().includes(focusKeyword.toLowerCase())
    )
    if (!keywordInHeadings) {
      recommendations.push('Consider including your focus keyword in at least one heading')
    }
  }
  
  return recommendations
}

// Calculate overall SEO score
export function calculateSEOScore(
  title: string,
  content: string,
  focusKeyword: string,
  seoTitle: string,
  seoDescription: string,
  headings: Array<{heading: string, level: number}>,
  wordCount: number,
  keywordDensity: number
): number {
  let score = 0
  const maxScore = 100
  
  // Title score (15 points)
  if (title && title.length >= 30 && title.length <= 60) score += 15
  else if (title && title.length > 0) score += 8
  
  // SEO Title score (15 points)
  if (seoTitle && seoTitle.length <= 60 && seoTitle.length >= 30) score += 15
  else if (seoTitle && seoTitle.length > 0) score += 8
  
  // SEO Description score (15 points)
  if (seoDescription && seoDescription.length >= 120 && seoDescription.length <= 160) score += 15
  else if (seoDescription && seoDescription.length > 0) score += 8
  
  // Focus keyword score (20 points)
  if (focusKeyword) {
    score += 5 // Base points for having a keyword
    
    // Keyword in title
    if (title && title.toLowerCase().includes(focusKeyword.toLowerCase())) score += 5
    
    // Keyword in SEO title
    if (seoTitle && seoTitle.toLowerCase().includes(focusKeyword.toLowerCase())) score += 5
    
    // Keyword density
    if (keywordDensity >= 0.5 && keywordDensity <= 3) score += 5
  }
  
  // Content length score (15 points)
  if (wordCount >= 800) score += 15
  else if (wordCount >= 500) score += 10
  else if (wordCount >= 300) score += 5
  
  // Heading structure score (10 points)
  const h1Count = headings.filter(h => h.level === 1).length
  const h2Count = headings.filter(h => h.level === 2).length
  
  if (h1Count === 1) score += 5
  if (h2Count >= 2) score += 5
  
  // Keyword in headings score (10 points)
  if (focusKeyword && headings.length > 0) {
    const keywordInHeadings = headings.some(h => 
      h.heading.toLowerCase().includes(focusKeyword.toLowerCase())
    )
    if (keywordInHeadings) score += 10
  }
  
  return Math.min(score, maxScore)
}

// Main analysis function
export function analyzeSEOContent(
  title: string,
  content: any[],
  focusKeyword: string,
  seoTitle: string,
  seoDescription: string
): SEOAnalysis {
  const plainText = extractTextFromBlocks(content)
  const headings = extractHeadings(content)
  const wordCount = calculateWordCount(plainText)
  const readingTime = calculateReadingTime(wordCount)
  const keywordDensity = calculateKeywordDensity(plainText, focusKeyword)
  const seoScore = calculateSEOScore(
    title,
    plainText,
    focusKeyword,
    seoTitle,
    seoDescription,
    headings,
    wordCount,
    keywordDensity
  )
  const recommendations = generateSEORecommendations(
    title,
    plainText,
    focusKeyword,
    seoTitle,
    seoDescription,
    headings,
    wordCount,
    keywordDensity
  )
  
  return {
    wordCount,
    readingTime,
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    seoScore,
    recommendations,
    tableOfContents: headings
  }
}