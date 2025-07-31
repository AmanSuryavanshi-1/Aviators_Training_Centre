#!/usr/bin/env node

/**
 * CLI tool for blog migration to Sanity
 * Provides command-line interface for analyzing and migrating blog data
 */

import { Command } from 'commander'
import { analyzeBlogDataCLI } from './analyzeBlogData'
import { migrateBlogPostsCLI, createSampleConfig } from './migrateBlogPosts'
import { validateDocuments, createValidationReport } from './dataValidation'
import fs from 'fs/promises'
import path from 'path'

const program = new Command()

program
  .name('blog-migrator')
  .description('CLI tool for migrating blog data to Sanity CMS')
  .version('1.0.0')

// Analyze command
program
  .command('analyze')
  .description('Analyze existing blog data structure')
  .argument('<paths...>', 'Paths to blog data directories or files')
  .option('-o, --output <path>', 'Output path for analysis report')
  .option('-f, --format <format>', 'Expected data format (markdown|json|wordpress|auto)', 'auto')
  .action(async (paths, options) => {
    try {
      console.log('🔍 Analyzing blog data...')
      
      const analysis = await analyzeBlogDataCLI(paths, options.output)
      
      console.log('\n✅ Analysis complete!')
      
      if (options.output) {
        console.log(`📄 Report saved to: ${options.output}`)
      }
      
      // Show recommendations
      if (analysis.recommendations.length > 0) {
        console.log('\n💡 Recommendations:')
        analysis.recommendations.forEach(rec => {
          console.log(`  • ${rec}`)
        })
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      process.exit(1)
    }
  })

// Validate command
program
  .command('validate')
  .description('Validate blog data for migration readiness')
  .argument('<paths...>', 'Paths to blog data directories or files')
  .option('-o, --output <path>', 'Output path for validation report')
  .option('-f, --format <format>', 'Data format (markdown|json|wordpress)', 'markdown')
  .action(async (paths, options) => {
    try {
      console.log('✅ Validating blog data...')
      
      // This would need to load and validate actual data
      // For now, we'll show the structure
      console.log('Validation functionality would be implemented here')
      console.log('Paths to validate:', paths)
      console.log('Format:', options.format)
      
      if (options.output) {
        console.log(`Report would be saved to: ${options.output}`)
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    }
  })

// Migrate command
program
  .command('migrate')
  .description('Migrate blog data to Sanity CMS')
  .argument('<config>', 'Path to migration configuration file')
  .option('--dry-run', 'Run migration without making changes', false)
  .option('--force', 'Overwrite existing posts', false)
  .option('--batch-size <size>', 'Number of posts to process in each batch', '10')
  .action(async (configPath, options) => {
    try {
      console.log('🚀 Starting blog migration...')
      
      // Check if config file exists
      try {
        await fs.access(configPath)
      } catch {
        console.error(`❌ Configuration file not found: ${configPath}`)
        console.log('💡 Use "blog-migrator init" to create a sample configuration')
        process.exit(1)
      }
      
      // Load and modify config with CLI options
      const configContent = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(configContent)
      
      if (options.dryRun) config.dryRun = true
      if (options.force) config.overwriteExisting = true
      if (options.batchSize) config.batchSize = parseInt(options.batchSize)
      
      // Save modified config
      const tempConfigPath = path.join(path.dirname(configPath), 'temp-config.json')
      await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2))
      
      try {
        const result = await migrateBlogPostsCLI(tempConfigPath)
        
        console.log('\n🎉 Migration completed!')
        console.log(`📊 Results: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`)
        
        if (result.reportPath) {
          console.log(`📄 Detailed report: ${result.reportPath}`)
        }
        
        if (!result.success) {
          console.log('⚠️ Migration completed with errors. Check the report for details.')
          process.exit(1)
        }
        
      } finally {
        // Clean up temp config
        try {
          await fs.unlink(tempConfigPath)
        } catch {
          // Ignore cleanup errors
        }
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
  })

// Init command
program
  .command('init')
  .description('Create a sample migration configuration file')
  .argument('[path]', 'Path for configuration file', './migration-config.json')
  .action(async (configPath) => {
    try {
      // Check if file already exists
      try {
        await fs.access(configPath)
        console.log(`⚠️ Configuration file already exists: ${configPath}`)
        console.log('Use --force to overwrite or choose a different path')
        return
      } catch {
        // File doesn't exist, proceed
      }
      
      await createSampleConfig(configPath)
      
      console.log('✅ Sample configuration created!')
      console.log('\n📝 Next steps:')
      console.log('1. Edit the configuration file with your settings')
      console.log('2. Run "blog-migrator analyze" to analyze your data')
      console.log('3. Run "blog-migrator migrate" to start the migration')
      
    } catch (error) {
      console.error('❌ Failed to create configuration:', error)
      process.exit(1)
    }
  })

// Status command
program
  .command('status')
  .description('Check migration status and Sanity connection')
  .option('-c, --config <path>', 'Path to configuration file')
  .action(async (options) => {
    try {
      console.log('🔍 Checking migration status...')
      
      if (options.config) {
        // Load config and test Sanity connection
        const configContent = await fs.readFile(options.config, 'utf-8')
        const config = JSON.parse(configContent)
        
        console.log('\n📋 Configuration:')
        console.log(`  Project ID: ${config.sanityProjectId}`)
        console.log(`  Dataset: ${config.sanityDataset}`)
        console.log(`  Source Paths: ${config.sourcePaths?.join(', ') || 'Not specified'}`)
        console.log(`  Dry Run: ${config.dryRun ? 'Yes' : 'No'}`)
        
        // Test Sanity connection
        try {
          const { createClient } = await import('@sanity/client')
          const client = createClient({
            projectId: config.sanityProjectId,
            dataset: config.sanityDataset,
            token: config.sanityToken,
            apiVersion: config.sanityApiVersion || '2024-01-01',
            useCdn: false
          })
          
          // Test connection by fetching a simple query
          await client.fetch('*[_type == "post"] | order(_createdAt desc) [0...1] { _id, title }')
          console.log('✅ Sanity connection: OK')
          
          // Get post count
          const postCount = await client.fetch('count(*[_type == "post"])')
          console.log(`📊 Existing posts in Sanity: ${postCount}`)
          
        } catch (error) {
          console.log('❌ Sanity connection: Failed')
          console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      } else {
        console.log('💡 Use --config to specify a configuration file for detailed status')
      }
      
      // Check for common migration files
      const commonPaths = [
        './migration-config.json',
        './content/blog',
        './data/posts',
        './posts',
        './blog'
      ]
      
      console.log('\n📁 Checking common paths:')
      for (const checkPath of commonPaths) {
        try {
          const stats = await fs.stat(checkPath)
          if (stats.isDirectory()) {
            const files = await fs.readdir(checkPath)
            console.log(`  ✅ ${checkPath} (${files.length} items)`)
          } else {
            console.log(`  ✅ ${checkPath} (file)`)
          }
        } catch {
          console.log(`  ❌ ${checkPath} (not found)`)
        }
      }
      
    } catch (error) {
      console.error('❌ Status check failed:', error)
      process.exit(1)
    }
  })

// Help command with examples
program
  .command('help-examples')
  .description('Show usage examples')
  .action(() => {
    console.log('📚 Blog Migrator Usage Examples\n')
    
    console.log('1. Initialize a new migration:')
    console.log('   blog-migrator init')
    console.log('   blog-migrator init ./my-migration-config.json\n')
    
    console.log('2. Analyze existing blog data:')
    console.log('   blog-migrator analyze ./content/blog')
    console.log('   blog-migrator analyze ./posts ./articles --output analysis-report.json\n')
    
    console.log('3. Validate data before migration:')
    console.log('   blog-migrator validate ./content/blog --format markdown')
    console.log('   blog-migrator validate ./data/posts.json --format json\n')
    
    console.log('4. Run migration:')
    console.log('   blog-migrator migrate ./migration-config.json --dry-run')
    console.log('   blog-migrator migrate ./migration-config.json --batch-size 5')
    console.log('   blog-migrator migrate ./migration-config.json --force\n')
    
    console.log('5. Check status:')
    console.log('   blog-migrator status')
    console.log('   blog-migrator status --config ./migration-config.json\n')
    
    console.log('💡 Tips:')
    console.log('  • Always run with --dry-run first to test the migration')
    console.log('  • Use smaller batch sizes for large datasets')
    console.log('  • Check the generated reports for detailed information')
    console.log('  • Keep backups of your original data')
  })

// Error handling
program.exitOverride()

try {
  program.parse()
} catch (error) {
  if (error instanceof Error && error.message.includes('commander')) {
    // Commander error (like unknown command)
    console.error('❌ Command error:', error.message)
    console.log('\n💡 Use "blog-migrator --help" for available commands')
    console.log('💡 Use "blog-migrator help-examples" for usage examples')
  } else {
    console.error('❌ Unexpected error:', error)
  }
  process.exit(1)
}

// If no command provided, show help
if (process.argv.length <= 2) {
  program.help()
}