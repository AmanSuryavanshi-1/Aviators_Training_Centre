/**
 * Blog post migration execution script
 * Migrates existing blog data to Sanity CMS with progress tracking and error handling
 */

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@sanity/client'
import { BlogDataAnalyzer, analyzeBlogDataCLI } from './analyzeBlogData'
import { STANDARD_FIELD_MAPPINGS, applyFieldMapping, validateDocument } from './fieldMapping'
import { validateDocuments, createValidationReport } from './dataValidation'
import { slugify } from './fieldMapping'

export interface MigrationConfig {
  // Source configuration
  sourcePaths: string[]
  sourceFormat: 'markdown' | 'json' | 'wordpress' | 'auto'
  
  // Sanity configuration
  sanityProjectId: string
  sanityDataset: string
  sanityToken: string
  sanityApiVersion: string
  
  // Migration options
  batchSize: number
  dryRun: boolean
  skipValidation: boolean
  createMissingReferences: boolean
  overwriteExisting: boolean
  
  // Output options
  outputDir: string
  generateReport: boolean
  backupBeforeMigration: boolean
}

export interface MigrationResult {
  success: boolean
  totalProcessed: number
  successful: number
  failed: number
  skipped: number
  errors: MigrationError[]
  warnings: string[]
  duration: number
  reportPath?: string
}

export interface MigrationError {
  documentId: string
  error: string
  details?: any
}

export interface MigrationProgress {
  phase: 'analyzing' | 'validating' | 'creating_references' | 'migrating' | 'complete'
  current: number
  total: number
  message: string
}

class BlogMigrator {
  private config: MigrationConfig
  private sanityClient: any
  private progressCallback?: (progress: MigrationProgress) => void
  
  constructor(config: MigrationConfig, progressCallback?: (progress: MigrationProgress) => void) {
    this.config = config
    this.progressCallback = progressCallback
    
    // Initialize Sanity client
    this.sanityClient = createClient({
      projectId: config.sanityProjectId,
      dataset: config.sanityDataset,
      token: config.sanityToken,
      apiVersion: config.sanityApiVersion,
      useCdn: false
    })
  }

  /**
   * Execute the complete migration process
   */
  async migrate(): Promise<MigrationResult> {
    const startTime = Date.now()
    const result: MigrationResult = {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      console.log('🚀 Starting blog migration process...')
      
      // Phase 1: Analyze source data
      this.updateProgress('analyzing', 0, 100, 'Analyzing source data...')
      const analysis = await this.analyzeSourceData()
      
      if (analysis.totalPosts === 0) {
        throw new Error('No blog posts found in source data')
      }
      
      console.log(`📊 Found ${analysis.totalPosts} posts to migrate`)
      result.totalProcessed = analysis.totalPosts
      
      // Phase 2: Load and validate data
      this.updateProgress('validating', 0, analysis.totalPosts, 'Loading and validating posts...')
      const { posts, validationResults } = await this.loadAndValidatePosts()
      
      if (!this.config.skipValidation && validationResults.summary.invalid > 0) {
        console.log(`⚠️ Found ${validationResults.summary.invalid} invalid posts`)
        result.warnings.push(`${validationResults.summary.invalid} posts have validation issues`)
      }
      
      // Phase 3: Create missing references (categories, authors, tags)
      if (this.config.createMissingReferences) {
        this.updateProgress('creating_references', 0, 100, 'Creating missing references...')
        await this.createMissingReferences(analysis)
      }
      
      // Phase 4: Backup existing data
      if (this.config.backupBeforeMigration && !this.config.dryRun) {
        console.log('💾 Creating backup of existing data...')
        await this.createBackup()
      }
      
      // Phase 5: Migrate posts
      this.updateProgress('migrating', 0, posts.length, 'Migrating posts...')
      const migrationResults = await this.migratePosts(posts)
      
      result.successful = migrationResults.successful
      result.failed = migrationResults.failed
      result.skipped = migrationResults.skipped
      result.errors = migrationResults.errors
      
      // Phase 6: Generate report
      if (this.config.generateReport) {
        result.reportPath = await this.generateMigrationReport(result, validationResults)
      }
      
      result.success = result.failed === 0
      result.duration = Date.now() - startTime
      
      this.updateProgress('complete', result.totalProcessed, result.totalProcessed, 'Migration complete!')
      
      console.log(`✅ Migration completed in ${Math.round(result.duration / 1000)}s`)
      console.log(`📈 Results: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`)
      
      return result
      
    } catch (error) {
      result.success = false
      result.duration = Date.now() - startTime
      result.errors.push({
        documentId: 'migration',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
      
      console.error('❌ Migration failed:', error)
      return result
    }
  }

  /**
   * Analyze source data structure
   */
  private async analyzeSourceData() {
    return await analyzeBlogDataCLI(this.config.sourcePaths)
  }

  /**
   * Load and validate all posts
   */
  private async loadAndValidatePosts(): Promise<{
    posts: any[]
    validationResults: ReturnType<typeof validateDocuments>
  }> {
    const analyzer = new BlogDataAnalyzer()
    const analysis = await analyzer.analyzeBlogData(this.config.sourcePaths)
    
    // Transform posts using field mapping
    const mapping = this.getFieldMapping()
    const transformedPosts = []
    
    for (let i = 0; i < analysis.totalPosts; i++) {
      this.updateProgress('validating', i, analysis.totalPosts, `Processing post ${i + 1}/${analysis.totalPosts}`)
      
      // This would need to be implemented to actually load individual posts
      // For now, we'll use the sample post structure
      const sourcePost = analysis.samplePost || {}
      const transformedPost = applyFieldMapping(sourcePost, mapping)
      
      // Add migration metadata
      transformedPost._id = `post-${slugify(transformedPost.title || `post-${i}`)}`
      transformedPost._type = 'post'
      transformedPost._createdAt = new Date().toISOString()
      transformedPost._updatedAt = new Date().toISOString()
      
      transformedPosts.push(transformedPost)
    }
    
    // Validate transformed posts
    const validationResults = this.config.skipValidation 
      ? { results: [], summary: { total: 0, valid: 0, invalid: 0, averageScore: 100, commonIssues: [] } }
      : validateDocuments(transformedPosts)
    
    return { posts: transformedPosts, validationResults }
  }

  /**
   * Get appropriate field mapping based on source format
   */
  private getFieldMapping() {
    const format = this.config.sourceFormat === 'auto' 
      ? 'markdown' // Default to markdown
      : this.config.sourceFormat
    
    return STANDARD_FIELD_MAPPINGS[format] || STANDARD_FIELD_MAPPINGS.markdown
  }

  /**
   * Create missing reference documents (categories, authors, tags)
   */
  private async createMissingReferences(analysis: any): Promise<void> {
    const references = []
    
    // Create categories
    for (const category of analysis.categories) {
      references.push({
        _id: `category-${slugify(category)}`,
        _type: 'category',
        title: category,
        slug: { current: slugify(category), _type: 'slug' },
        description: `Articles about ${category.toLowerCase()}`,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      })
    }
    
    // Create authors
    for (const author of analysis.authors) {
      references.push({
        _id: `author-${slugify(author)}`,
        _type: 'author',
        name: author,
        slug: { current: slugify(author), _type: 'slug' },
        bio: `Aviation expert and content contributor`,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      })
    }
    
    // Create tags
    for (const tag of analysis.tags) {
      references.push({
        _id: `tag-${slugify(tag)}`,
        _type: 'tag',
        title: tag,
        slug: { current: slugify(tag), _type: 'slug' },
        description: `Posts tagged with ${tag.toLowerCase()}`,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      })
    }
    
    // Create references in batches
    if (!this.config.dryRun && references.length > 0) {
      console.log(`📝 Creating ${references.length} reference documents...`)
      
      for (let i = 0; i < references.length; i += this.config.batchSize) {
        const batch = references.slice(i, i + this.config.batchSize)
        
        try {
          await this.sanityClient.createOrReplace(batch)
          console.log(`✅ Created batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(references.length / this.config.batchSize)}`)
        } catch (error) {
          console.error(`❌ Failed to create reference batch:`, error)
        }
      }
    }
  }

  /**
   * Create backup of existing data
   */
  private async createBackup(): Promise<void> {
    try {
      const backupDir = path.join(this.config.outputDir, 'backup')
      await fs.mkdir(backupDir, { recursive: true })
      
      // Export existing posts
      const existingPosts = await this.sanityClient.fetch('*[_type == "post"]')
      await fs.writeFile(
        path.join(backupDir, 'posts-backup.json'),
        JSON.stringify(existingPosts, null, 2)
      )
      
      // Export existing references
      const existingCategories = await this.sanityClient.fetch('*[_type == "category"]')
      const existingAuthors = await this.sanityClient.fetch('*[_type == "author"]')
      const existingTags = await this.sanityClient.fetch('*[_type == "tag"]')
      
      await fs.writeFile(
        path.join(backupDir, 'references-backup.json'),
        JSON.stringify({ categories: existingCategories, authors: existingAuthors, tags: existingTags }, null, 2)
      )
      
      console.log(`💾 Backup created in ${backupDir}`)
      
    } catch (error) {
      console.error('❌ Failed to create backup:', error)
      throw error
    }
  }

  /**
   * Migrate posts to Sanity
   */
  private async migratePosts(posts: any[]): Promise<{
    successful: number
    failed: number
    skipped: number
    errors: MigrationError[]
  }> {
    let successful = 0
    let failed = 0
    let skipped = 0
    const errors: MigrationError[] = []
    
    for (let i = 0; i < posts.length; i += this.config.batchSize) {
      const batch = posts.slice(i, i + this.config.batchSize)
      
      this.updateProgress('migrating', i, posts.length, `Migrating batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(posts.length / this.config.batchSize)}`)
      
      for (const post of batch) {
        try {
          // Check if post already exists
          if (!this.config.overwriteExisting) {
            const existing = await this.sanityClient.fetch(
              '*[_type == "post" && slug.current == $slug][0]',
              { slug: post.slug.current }
            )
            
            if (existing) {
              console.log(`⏭️ Skipping existing post: ${post.title}`)
              skipped++
              continue
            }
          }
          
          // Validate post before migration
          const mapping = this.getFieldMapping()
          const validation = validateDocument(post, mapping)
          
          if (!validation.valid && !this.config.skipValidation) {
            console.log(`❌ Skipping invalid post: ${post.title}`)
            errors.push({
              documentId: post._id,
              error: 'Validation failed',
              details: validation.errors
            })
            failed++
            continue
          }
          
          // Migrate post
          if (this.config.dryRun) {
            console.log(`🔍 [DRY RUN] Would migrate: ${post.title}`)
            successful++
          } else {
            await this.sanityClient.createOrReplace(post)
            console.log(`✅ Migrated: ${post.title}`)
            successful++
          }
          
        } catch (error) {
          console.error(`❌ Failed to migrate post: ${post.title}`, error)
          errors.push({
            documentId: post._id,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error
          })
          failed++
        }
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + this.config.batchSize < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return { successful, failed, skipped, errors }
  }

  /**
   * Generate migration report
   */
  private async generateMigrationReport(
    result: MigrationResult,
    validationResults: ReturnType<typeof validateDocuments>
  ): Promise<string> {
    const reportDir = path.join(this.config.outputDir, 'reports')
    await fs.mkdir(reportDir, { recursive: true })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportDir, `migration-report-${timestamp}.md`)
    
    let report = '# Blog Migration Report\n\n'
    report += `**Generated:** ${new Date().toISOString()}\n`
    report += `**Duration:** ${Math.round(result.duration / 1000)}s\n`
    report += `**Mode:** ${this.config.dryRun ? 'Dry Run' : 'Live Migration'}\n\n`
    
    // Summary
    report += '## Summary\n\n'
    report += `- **Total Processed:** ${result.totalProcessed}\n`
    report += `- **Successful:** ${result.successful}\n`
    report += `- **Failed:** ${result.failed}\n`
    report += `- **Skipped:** ${result.skipped}\n`
    report += `- **Success Rate:** ${Math.round((result.successful / result.totalProcessed) * 100)}%\n\n`
    
    // Configuration
    report += '## Configuration\n\n'
    report += `- **Source Paths:** ${this.config.sourcePaths.join(', ')}\n`
    report += `- **Source Format:** ${this.config.sourceFormat}\n`
    report += `- **Batch Size:** ${this.config.batchSize}\n`
    report += `- **Skip Validation:** ${this.config.skipValidation}\n`
    report += `- **Create References:** ${this.config.createMissingReferences}\n`
    report += `- **Overwrite Existing:** ${this.config.overwriteExisting}\n\n`
    
    // Validation results
    if (!this.config.skipValidation) {
      report += '## Validation Results\n\n'
      report += createValidationReport(validationResults)
    }
    
    // Errors
    if (result.errors.length > 0) {
      report += '## Errors\n\n'
      result.errors.forEach((error, index) => {
        report += `### Error ${index + 1}: ${error.documentId}\n\n`
        report += `**Message:** ${error.error}\n\n`
        if (error.details) {
          report += `**Details:**\n\`\`\`\n${JSON.stringify(error.details, null, 2)}\n\`\`\`\n\n`
        }
      })
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      report += '## Warnings\n\n'
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`
      })
      report += '\n'
    }
    
    await fs.writeFile(reportPath, report)
    console.log(`📄 Migration report saved to: ${reportPath}`)
    
    return reportPath
  }

  /**
   * Update progress callback
   */
  private updateProgress(phase: MigrationProgress['phase'], current: number, total: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback({ phase, current, total, message })
    }
  }
}

/**
 * CLI function for running migration
 */
export async function migrateBlogPostsCLI(configPath: string): Promise<MigrationResult> {
  try {
    // Load configuration
    const configContent = await fs.readFile(configPath, 'utf-8')
    const config: MigrationConfig = JSON.parse(configContent)
    
    // Validate configuration
    if (!config.sanityProjectId || !config.sanityToken) {
      throw new Error('Missing required Sanity configuration')
    }
    
    if (!config.sourcePaths || config.sourcePaths.length === 0) {
      throw new Error('No source paths specified')
    }
    
    // Set defaults
    config.batchSize = config.batchSize || 10
    config.dryRun = config.dryRun !== false // Default to true for safety
    config.skipValidation = config.skipValidation || false
    config.createMissingReferences = config.createMissingReferences !== false
    config.overwriteExisting = config.overwriteExisting || false
    config.outputDir = config.outputDir || './migration-output'
    config.generateReport = config.generateReport !== false
    config.backupBeforeMigration = config.backupBeforeMigration !== false
    config.sanityApiVersion = config.sanityApiVersion || '2024-01-01'
    
    // Create output directory
    await fs.mkdir(config.outputDir, { recursive: true })
    
    // Progress callback
    const progressCallback = (progress: MigrationProgress) => {
      const percentage = Math.round((progress.current / progress.total) * 100)
      console.log(`[${progress.phase.toUpperCase()}] ${percentage}% - ${progress.message}`)
    }
    
    // Run migration
    const migrator = new BlogMigrator(config, progressCallback)
    return await migrator.migrate()
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Create sample migration configuration
 */
export async function createSampleConfig(outputPath: string): Promise<void> {
  const sampleConfig: MigrationConfig = {
    sourcePaths: [
      './content/blog',
      './data/posts'
    ],
    sourceFormat: 'auto',
    sanityProjectId: 'your-project-id',
    sanityDataset: 'production',
    sanityToken: 'your-api-token',
    sanityApiVersion: '2024-01-01',
    batchSize: 10,
    dryRun: true,
    skipValidation: false,
    createMissingReferences: true,
    overwriteExisting: false,
    outputDir: './migration-output',
    generateReport: true,
    backupBeforeMigration: true
  }
  
  await fs.writeFile(outputPath, JSON.stringify(sampleConfig, null, 2))
  console.log(`📝 Sample configuration created at: ${outputPath}`)
}

export { BlogMigrator }
export default BlogMigrator