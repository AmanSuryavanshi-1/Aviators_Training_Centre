/**
 * Blog data analysis and mapping utility
 * Analyzes existing blog data structure and creates mapping to Sanity schema
 */

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface BlogDataAnalysis {
  totalPosts: number
  dataFormat: 'markdown' | 'json' | 'mixed'
  fieldMapping: FieldMapping
  categories: string[]
  authors: string[]
  tags: string[]
  issues: DataIssue[]
  recommendations: string[]
  samplePost: any
}

export interface FieldMapping {
  [currentField: string]: {
    sanityField: string
    type: string
    required: boolean
    transform?: string
    issues?: string[]
  }
}

export interface DataIssue {
  type: 'missing_field' | 'invalid_format' | 'duplicate_content' | 'broken_reference'
  severity: 'low' | 'medium' | 'high'
  description: string
  affectedPosts: string[]
  suggestedFix: string
}

export interface PostData {
  id: string
  filePath: string
  frontMatter: any
  content: string
  wordCount: number
  issues: string[]
}

class BlogDataAnalyzer {
  private posts: PostData[] = []
  private categories = new Set<string>()
  private authors = new Set<string>()
  private tags = new Set<string>()
  private issues: DataIssue[] = []

  /**
   * Analyze blog data from various sources
   */
  async analyzeBlogData(dataPaths: string[]): Promise<BlogDataAnalysis> {
    console.log('🔍 Starting blog data analysis...')
    
    // Load data from all specified paths
    for (const dataPath of dataPaths) {
      await this.loadDataFromPath(dataPath)
    }
    
    console.log(`📊 Loaded ${this.posts.length} posts for analysis`)
    
    // Analyze the loaded data
    const fieldMapping = this.analyzeFieldStructure()
    const dataFormat = this.determineDataFormat()
    const issues = this.validateDataIntegrity()
    const recommendations = this.generateRecommendations()
    
    return {
      totalPosts: this.posts.length,
      dataFormat,
      fieldMapping,
      categories: Array.from(this.categories),
      authors: Array.from(this.authors),
      tags: Array.from(this.tags),
      issues,
      recommendations,
      samplePost: this.posts[0] || null
    }
  }

  /**
   * Load data from a specific path (supports markdown files, JSON, etc.)
   */
  private async loadDataFromPath(dataPath: string): Promise<void> {
    try {
      const stats = await fs.stat(dataPath)
      
      if (stats.isDirectory()) {
        await this.loadFromDirectory(dataPath)
      } else if (stats.isFile()) {
        await this.loadFromFile(dataPath)
      }
    } catch (error) {
      console.error(`Error loading data from ${dataPath}:`, error)
    }
  }

  /**
   * Load blog posts from a directory
   */
  private async loadFromDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          await this.loadFromDirectory(fullPath)
        } else if (entry.isFile() && this.isBlogFile(entry.name)) {
          await this.loadFromFile(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error)
    }
  }

  /**
   * Load a single blog post file
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const ext = path.extname(filePath).toLowerCase()
      
      let postData: PostData
      
      if (ext === '.md' || ext === '.mdx') {
        postData = this.parseMarkdownFile(filePath, content)
      } else if (ext === '.json') {
        postData = this.parseJsonFile(filePath, content)
      } else {
        return // Skip unsupported file types
      }
      
      this.posts.push(postData)
      this.extractTaxonomy(postData)
      
    } catch (error) {
      console.error(`Error loading file ${filePath}:`, error)
    }
  }

  /**
   * Parse markdown file with front matter
   */
  private parseMarkdownFile(filePath: string, content: string): PostData {
    const { data: frontMatter, content: markdownContent } = matter(content)
    const wordCount = this.calculateWordCount(markdownContent)
    const issues: string[] = []
    
    // Basic validation
    if (!frontMatter.title) issues.push('Missing title')
    if (!frontMatter.date && !frontMatter.publishedAt) issues.push('Missing publication date')
    if (!markdownContent.trim()) issues.push('Empty content')
    
    return {
      id: path.basename(filePath, path.extname(filePath)),
      filePath,
      frontMatter,
      content: markdownContent,
      wordCount,
      issues
    }
  }

  /**
   * Parse JSON file
   */
  private parseJsonFile(filePath: string, content: string): PostData {
    const data = JSON.parse(content)
    const issues: string[] = []
    
    // Extract content and metadata
    const markdownContent = data.content || data.body || ''
    const wordCount = this.calculateWordCount(markdownContent)
    
    // Basic validation
    if (!data.title) issues.push('Missing title')
    if (!data.date && !data.publishedAt && !data.created_at) issues.push('Missing publication date')
    if (!markdownContent.trim()) issues.push('Empty content')
    
    return {
      id: data.id || data.slug || path.basename(filePath, '.json'),
      filePath,
      frontMatter: data,
      content: markdownContent,
      wordCount,
      issues
    }
  }

  /**
   * Extract taxonomy data (categories, authors, tags)
   */
  private extractTaxonomy(post: PostData): void {
    const { frontMatter } = post
    
    // Categories
    if (frontMatter.category) {
      this.categories.add(frontMatter.category)
    }
    if (frontMatter.categories && Array.isArray(frontMatter.categories)) {
      frontMatter.categories.forEach((cat: string) => this.categories.add(cat))
    }
    
    // Authors
    if (frontMatter.author) {
      this.authors.add(frontMatter.author)
    }
    if (frontMatter.authors && Array.isArray(frontMatter.authors)) {
      frontMatter.authors.forEach((author: string) => this.authors.add(author))
    }
    
    // Tags
    if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
      frontMatter.tags.forEach((tag: string) => this.tags.add(tag))
    }
    if (frontMatter.keywords && Array.isArray(frontMatter.keywords)) {
      frontMatter.keywords.forEach((keyword: string) => this.tags.add(keyword))
    }
  }

  /**
   * Analyze field structure and create mapping to Sanity schema
   */
  private analyzeFieldStructure(): FieldMapping {
    const fieldCounts: { [field: string]: number } = {}
    const fieldTypes: { [field: string]: Set<string> } = {}
    
    // Analyze all posts to understand field usage
    this.posts.forEach(post => {
      Object.keys(post.frontMatter).forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1
        
        if (!fieldTypes[field]) {
          fieldTypes[field] = new Set()
        }
        
        const value = post.frontMatter[field]
        fieldTypes[field].add(typeof value)
        
        if (Array.isArray(value)) {
          fieldTypes[field].add('array')
        }
      })
    })
    
    // Create field mapping
    const mapping: FieldMapping = {}
    
    Object.keys(fieldCounts).forEach(field => {
      const usage = fieldCounts[field] / this.posts.length
      const types = Array.from(fieldTypes[field])
      
      mapping[field] = {
        sanityField: this.mapToSanityField(field),
        type: this.determineSanityType(field, types),
        required: usage > 0.8, // Consider required if used in 80%+ of posts
        issues: this.getFieldIssues(field, types, usage)
      }
      
      // Add transformation notes
      if (this.needsTransformation(field)) {
        mapping[field].transform = this.getTransformationNote(field)
      }
    })
    
    return mapping
  }

  /**
   * Map current field names to Sanity schema fields
   */
  private mapToSanityField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'title': 'title',
      'slug': 'slug',
      'date': 'publishedAt',
      'publishedAt': 'publishedAt',
      'created_at': 'publishedAt',
      'description': 'excerpt',
      'excerpt': 'excerpt',
      'summary': 'excerpt',
      'content': 'body',
      'body': 'body',
      'category': 'category',
      'categories': 'category', // Will need transformation
      'author': 'author',
      'authors': 'author', // Will need transformation
      'tags': 'tags',
      'keywords': 'tags',
      'image': 'image',
      'featured_image': 'image',
      'cover': 'image',
      'seo_title': 'seoTitle',
      'meta_title': 'seoTitle',
      'seo_description': 'seoDescription',
      'meta_description': 'seoDescription',
      'featured': 'featured',
      'draft': 'workflowStatus', // Will need transformation
      'published': 'workflowStatus', // Will need transformation
      'reading_time': 'readingTime',
      'word_count': 'wordCount'
    }
    
    return fieldMap[field] || field
  }

  /**
   * Determine appropriate Sanity field type
   */
  private determineSanityType(field: string, types: string[]): string {
    if (types.includes('array')) {
      if (field.includes('tag') || field.includes('keyword')) {
        return 'array of references to tag'
      }
      if (field.includes('author')) {
        return 'reference to author'
      }
      if (field.includes('categor')) {
        return 'reference to category'
      }
      return 'array'
    }
    
    if (types.includes('boolean')) {
      return 'boolean'
    }
    
    if (types.includes('number')) {
      return 'number'
    }
    
    if (field.includes('date') || field.includes('time')) {
      return 'datetime'
    }
    
    if (field === 'slug') {
      return 'slug'
    }
    
    if (field === 'content' || field === 'body') {
      return 'array (block content)'
    }
    
    if (field.includes('image') || field.includes('cover')) {
      return 'image'
    }
    
    if (field.includes('url') || field.includes('link')) {
      return 'url'
    }
    
    return 'string'
  }

  /**
   * Get issues for a specific field
   */
  private getFieldIssues(field: string, types: string[], usage: number): string[] {
    const issues: string[] = []
    
    if (types.length > 2) {
      issues.push('Inconsistent data types across posts')
    }
    
    if (usage < 0.5) {
      issues.push('Used in less than 50% of posts')
    }
    
    if (field.includes('date') && !types.includes('string')) {
      issues.push('Date field should be string format')
    }
    
    return issues
  }

  /**
   * Check if field needs transformation
   */
  private needsTransformation(field: string): boolean {
    const transformFields = [
      'categories', 'authors', 'draft', 'published', 'content', 'body'
    ]
    
    return transformFields.includes(field)
  }

  /**
   * Get transformation note for field
   */
  private getTransformationNote(field: string): string {
    const transformations: { [key: string]: string } = {
      'categories': 'Convert array to single category reference',
      'authors': 'Convert array to single author reference',
      'draft': 'Convert boolean to workflowStatus enum',
      'published': 'Convert boolean to workflowStatus enum',
      'content': 'Convert markdown to Sanity block content',
      'body': 'Convert markdown to Sanity block content'
    }
    
    return transformations[field] || 'Needs custom transformation'
  }

  /**
   * Determine the primary data format
   */
  private determineDataFormat(): 'markdown' | 'json' | 'mixed' {
    const markdownCount = this.posts.filter(p => p.filePath.endsWith('.md') || p.filePath.endsWith('.mdx')).length
    const jsonCount = this.posts.filter(p => p.filePath.endsWith('.json')).length
    
    if (markdownCount > 0 && jsonCount > 0) return 'mixed'
    if (jsonCount > markdownCount) return 'json'
    return 'markdown'
  }

  /**
   * Validate data integrity and identify issues
   */
  private validateDataIntegrity(): DataIssue[] {
    const issues: DataIssue[] = []
    
    // Check for missing required fields
    const missingTitles = this.posts.filter(p => !p.frontMatter.title)
    if (missingTitles.length > 0) {
      issues.push({
        type: 'missing_field',
        severity: 'high',
        description: 'Posts missing title field',
        affectedPosts: missingTitles.map(p => p.id),
        suggestedFix: 'Add title field to all posts or generate from filename'
      })
    }
    
    // Check for missing dates
    const missingDates = this.posts.filter(p => 
      !p.frontMatter.date && !p.frontMatter.publishedAt && !p.frontMatter.created_at
    )
    if (missingDates.length > 0) {
      issues.push({
        type: 'missing_field',
        severity: 'high',
        description: 'Posts missing publication date',
        affectedPosts: missingDates.map(p => p.id),
        suggestedFix: 'Add publishedAt field or use file modification date'
      })
    }
    
    // Check for duplicate slugs
    const slugs = new Map<string, string[]>()
    this.posts.forEach(post => {
      const slug = post.frontMatter.slug || post.id
      if (!slugs.has(slug)) {
        slugs.set(slug, [])
      }
      slugs.get(slug)!.push(post.id)
    })
    
    const duplicateSlugs = Array.from(slugs.entries()).filter(([_, posts]) => posts.length > 1)
    if (duplicateSlugs.length > 0) {
      issues.push({
        type: 'duplicate_content',
        severity: 'high',
        description: 'Duplicate slugs found',
        affectedPosts: duplicateSlugs.flatMap(([_, posts]) => posts),
        suggestedFix: 'Generate unique slugs for all posts'
      })
    }
    
    // Check for empty content
    const emptyContent = this.posts.filter(p => !p.content.trim())
    if (emptyContent.length > 0) {
      issues.push({
        type: 'missing_field',
        severity: 'medium',
        description: 'Posts with empty content',
        affectedPosts: emptyContent.map(p => p.id),
        suggestedFix: 'Review and add content to empty posts'
      })
    }
    
    // Check for very short content
    const shortContent = this.posts.filter(p => p.wordCount < 100)
    if (shortContent.length > 0) {
      issues.push({
        type: 'invalid_format',
        severity: 'low',
        description: 'Posts with very short content (< 100 words)',
        affectedPosts: shortContent.map(p => p.id),
        suggestedFix: 'Review short posts and expand content if needed'
      })
    }
    
    return issues
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    // Content recommendations
    if (this.posts.length > 100) {
      recommendations.push('Consider batch migration in groups of 50 posts to avoid timeouts')
    }
    
    if (this.categories.size > 20) {
      recommendations.push('Consider consolidating categories - too many categories can hurt SEO')
    }
    
    if (this.authors.size === 1) {
      recommendations.push('Create author profiles in Sanity before migration')
    }
    
    // Technical recommendations
    const avgWordCount = this.posts.reduce((sum, p) => sum + p.wordCount, 0) / this.posts.length
    if (avgWordCount < 300) {
      recommendations.push('Consider expanding short posts to improve SEO (aim for 300+ words)')
    }
    
    const postsWithoutImages = this.posts.filter(p => 
      !p.frontMatter.image && !p.frontMatter.featured_image && !p.frontMatter.cover
    ).length
    
    if (postsWithoutImages > this.posts.length * 0.5) {
      recommendations.push('Add featured images to posts for better social sharing')
    }
    
    // SEO recommendations
    const postsWithoutSEO = this.posts.filter(p => 
      !p.frontMatter.seo_title && !p.frontMatter.meta_title && 
      !p.frontMatter.seo_description && !p.frontMatter.meta_description
    ).length
    
    if (postsWithoutSEO > this.posts.length * 0.3) {
      recommendations.push('Add SEO metadata (title and description) to improve search visibility')
    }
    
    return recommendations
  }

  /**
   * Check if file is a blog post file
   */
  private isBlogFile(filename: string): boolean {
    const blogExtensions = ['.md', '.mdx', '.json']
    const ext = path.extname(filename).toLowerCase()
    return blogExtensions.includes(ext)
  }

  /**
   * Calculate word count from content
   */
  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Export analysis results to JSON
   */
  async exportAnalysis(analysis: BlogDataAnalysis, outputPath: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      summary: {
        totalPosts: analysis.totalPosts,
        dataFormat: analysis.dataFormat,
        categoriesCount: analysis.categories.length,
        authorsCount: analysis.authors.length,
        tagsCount: analysis.tags.length,
        issuesCount: analysis.issues.length,
        highSeverityIssues: analysis.issues.filter(i => i.severity === 'high').length
      }
    }
    
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2))
    console.log(`📄 Analysis report exported to: ${outputPath}`)
  }
}

// Export the analyzer class and interfaces
export { BlogDataAnalyzer }

// CLI usage function
export async function analyzeBlogDataCLI(dataPaths: string[], outputPath?: string): Promise<BlogDataAnalysis> {
  const analyzer = new BlogDataAnalyzer()
  const analysis = await analyzer.analyzeBlogData(dataPaths)
  
  // Print summary
  console.log('\n📊 Blog Data Analysis Summary:')
  console.log(`Total Posts: ${analysis.totalPosts}`)
  console.log(`Data Format: ${analysis.dataFormat}`)
  console.log(`Categories: ${analysis.categories.length}`)
  console.log(`Authors: ${analysis.authors.length}`)
  console.log(`Tags: ${analysis.tags.length}`)
  console.log(`Issues Found: ${analysis.issues.length}`)
  
  if (analysis.issues.length > 0) {
    console.log('\n⚠️ Issues Found:')
    analysis.issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`)
      console.log(`    Affected: ${issue.affectedPosts.length} posts`)
      console.log(`    Fix: ${issue.suggestedFix}`)
    })
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    analysis.recommendations.forEach(rec => {
      console.log(`  • ${rec}`)
    })
  }
  
  // Export if output path provided
  if (outputPath) {
    await analyzer.exportAnalysis(analysis, outputPath)
  }
  
  return analysis
}

export default BlogDataAnalyzer