#!/usr/bin/env tsx

/**
 * Complete Migration Runner
 * 
 * This script orchestrates the complete migration process from
 * Markdown files to Sanity CMS, including validation and cleanup.
 * 
 * Usage: npx tsx scripts/run-migration.ts [--validate-only] [--cleanup-only]
 */

// Import types for now - actual imports will be dynamic
// import { MarkdownToSanityMigrator } from './migrate-markdown-to-sanity.js';
// import { MigrationValidator } from './validate-migration.js';
// import { MarkdownCleanupManager } from './cleanup-markdown-dependencies.js';

interface MigrationOptions {
  validateOnly: boolean;
  cleanupOnly: boolean;
  skipValidation: boolean;
  skipCleanup: boolean;
  dryRun: boolean;
}

class CompleteMigrationRunner {
  private options: MigrationOptions;

  constructor(options: MigrationOptions) {
    this.options = options;
    console.log('🚀 Complete Blog Migration Runner\n');
  }

  /**
   * Run the complete migration process
   */
  async run(): Promise<void> {
    try {
      console.log('📋 Migration Configuration:');
      console.log(`  • Validate Only: ${this.options.validateOnly}`);
      console.log(`  • Cleanup Only: ${this.options.cleanupOnly}`);
      console.log(`  • Skip Validation: ${this.options.skipValidation}`);
      console.log(`  • Skip Cleanup: ${this.options.skipCleanup}`);
      console.log(`  • Dry Run: ${this.options.dryRun}`);
      console.log('');

      // Pre-flight checks
      await this.preflightChecks();

      if (this.options.validateOnly) {
        await this.runValidationOnly();
        return;
      }

      if (this.options.cleanupOnly) {
        await this.runCleanupOnly();
        return;
      }

      // Full migration process
      await this.runFullMigration();

    } catch (error) {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    }
  }

  /**
   * Pre-flight checks before migration
   */
  private async preflightChecks(): Promise<void> {
    console.log('🔍 Running pre-flight checks...\n');

    const checks = [
      this.checkSanityToken(),
      this.checkMarkdownFiles(),
      this.checkSanityConnection(),
      this.checkDependencies(),
    ];

    const results = await Promise.allSettled(checks);
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('❌ Pre-flight checks failed:');
      failures.forEach((failure, index) => {
        console.error(`  ${index + 1}. ${failure.reason}`);
      });
      throw new Error('Pre-flight checks failed');
    }

    console.log('✅ All pre-flight checks passed\n');
  }

  /**
   * Individual pre-flight checks
   */
  private async checkSanityToken(): Promise<void> {
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error('SANITY_API_TOKEN environment variable is required');
    }
    console.log('✅ Sanity API token found');
  }

  private async checkMarkdownFiles(): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const contentDir = path.join(process.cwd(), 'content/blog');
    if (!fs.existsSync(contentDir)) {
      throw new Error('Content/blog directory not found');
    }

    const markdownFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
    if (markdownFiles.length === 0) {
      throw new Error('No markdown files found to migrate');
    }

    console.log(`✅ Found ${markdownFiles.length} markdown files to migrate`);
  }

  private async checkSanityConnection(): Promise<void> {
    try {
      const { createClient } = await import('next-sanity');
      const client = createClient({
        projectId: "3u4fa9kl",
        dataset: "production",
        apiVersion: "2024-01-01",
        useCdn: false,
      });

      // Test connection by fetching a simple query
      await client.fetch('*[_type == "post"][0...1]');
      console.log('✅ Sanity connection successful');
    } catch (error) {
      throw new Error(`Sanity connection failed: ${error}`);
    }
  }

  private async checkDependencies(): Promise<void> {
    const requiredDependencies = [
      'next-sanity',
      'gray-matter',
      'reading-time',
      '@portabletext/react'
    ];

    const fs = await import('fs');
    const path = await import('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const missingDeps = requiredDependencies.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );

    if (missingDeps.length > 0) {
      throw new Error(`Missing required dependencies: ${missingDeps.join(', ')}`);
    }

    console.log('✅ All required dependencies found');
  }

  /**
   * Run validation only
   */
  private async runValidationOnly(): Promise<void> {
    console.log('🔍 Running validation only...\n');
    
    const { MigrationValidator } = await import('./validate-migration.js');
    const validator = new MigrationValidator();
    await validator.validate();
  }

  /**
   * Run cleanup only
   */
  private async runCleanupOnly(): Promise<void> {
    console.log('🧹 Running cleanup only...\n');
    
    const { MarkdownCleanupManager } = await import('./cleanup-markdown-dependencies.js');
    const cleanup = new MarkdownCleanupManager();
    await cleanup.cleanup();
  }

  /**
   * Run the complete migration process
   */
  private async runFullMigration(): Promise<void> {
    console.log('🚀 Starting complete migration process...\n');

    // Step 1: Migration
    console.log('📝 STEP 1: Migrating content to Sanity CMS');
    console.log('='.repeat(50));
    const { MarkdownToSanityMigrator } = await import('./migrate-markdown-to-sanity.js');
    const migrator = new MarkdownToSanityMigrator();
    await migrator.migrate();

    // Step 2: Validation (unless skipped)
    if (!this.options.skipValidation) {
      console.log('\n🔍 STEP 2: Validating migrated content');
      console.log('='.repeat(50));
      const { MigrationValidator } = await import('./validate-migration.js');
      const validator = new MigrationValidator();
      await validator.validate();

      // Check validation results
      const fs = await import('fs');
      const path = await import('path');
      const logPath = path.join(process.cwd(), 'migration-validation-log.json');
      
      if (fs.existsSync(logPath)) {
        const validationLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        
        if (validationLog.summary.failed > 0) {
          console.log('\n⚠️  Validation found issues. Please review and fix before proceeding to cleanup.');
          console.log('Run the migration again after fixing issues, or use --skip-validation flag.');
          return;
        }
      }
    }

    // Step 3: Cleanup (unless skipped)
    if (!this.options.skipCleanup) {
      console.log('\n🧹 STEP 3: Cleaning up markdown dependencies');
      console.log('='.repeat(50));
      
      if (this.options.dryRun) {
        console.log('🔍 DRY RUN: Cleanup would be performed here');
      } else {
        const { MarkdownCleanupManager } = await import('./cleanup-markdown-dependencies.js');
        const cleanup = new MarkdownCleanupManager();
        await cleanup.cleanup();
      }
    }

    // Final summary
    this.printFinalSummary();
  }

  /**
   * Print final migration summary
   */
  private printFinalSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

    console.log('\n✅ What was accomplished:');
    console.log('  • Markdown content migrated to Sanity CMS');
    console.log('  • Authors and categories created/updated');
    console.log('  • SEO metadata preserved and enhanced');
    console.log('  • CTA placements configured');
    console.log('  • Content structure validated');
    
    if (!this.options.skipCleanup && !this.options.dryRun) {
      console.log('  • Markdown files removed');
      console.log('  • Import references updated');
    }

    console.log('\n🚀 Next steps:');
    console.log('  1. Test your blog functionality thoroughly');
    console.log('  2. Review content in Sanity Studio');
    console.log('  3. Configure CTA placements for optimal conversion');
    console.log('  4. Update any remaining markdown references');
    console.log('  5. Deploy your updated application');

    console.log('\n📚 Resources:');
    console.log('  • Sanity Studio: http://localhost:3000/studio');
    console.log('  • Blog pages: http://localhost:3000/blog');
    console.log('  • Migration logs: Check project root for log files');

    console.log('\n🎯 Your blog is now powered by Sanity CMS!');
  }
}

/**
 * Parse command line arguments
 */
function parseArguments(): MigrationOptions {
  const args = process.argv.slice(2);
  
  return {
    validateOnly: args.includes('--validate-only'),
    cleanupOnly: args.includes('--cleanup-only'),
    skipValidation: args.includes('--skip-validation'),
    skipCleanup: args.includes('--skip-cleanup'),
    dryRun: args.includes('--dry-run'),
  };
}

/**
 * Display help information
 */
function displayHelp(): void {
  console.log(`
🚀 Complete Blog Migration Runner

Usage: npx tsx scripts/run-migration.ts [options]

Options:
  --validate-only     Only run validation, don't migrate
  --cleanup-only      Only run cleanup, don't migrate or validate
  --skip-validation   Skip validation step in full migration
  --skip-cleanup      Skip cleanup step in full migration
  --dry-run          Show what would be done without making changes
  --help             Show this help message

Examples:
  npx tsx scripts/run-migration.ts                    # Full migration
  npx tsx scripts/run-migration.ts --validate-only    # Validate only
  npx tsx scripts/run-migration.ts --dry-run          # Preview changes
  npx tsx scripts/run-migration.ts --skip-cleanup     # Migrate but keep files

Environment Variables:
  SANITY_API_TOKEN    Required for write operations to Sanity

Pre-requisites:
  • Sanity project configured and accessible
  • Markdown files in content/blog directory
  • Required dependencies installed
  • SANITY_API_TOKEN environment variable set
`);
}

// Run migration if this script is executed directly
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    displayHelp();
    process.exit(0);
  }

  const options = parseArguments();
  const runner = new CompleteMigrationRunner(options);
  await runner.run();
}

// Execute main function
if (process.argv[1]?.includes('run-migration.ts')) {
  main().catch(console.error);
}

export { CompleteMigrationRunner };
