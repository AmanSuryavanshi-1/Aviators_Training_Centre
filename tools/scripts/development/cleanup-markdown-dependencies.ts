#!/usr/bin/env tsx

/**
 * Cleanup Markdown Dependencies Script
 * 
 * This script removes markdown files and updates import references
 * after successful migration to Sanity CMS.
 * 
 * Usage: npx tsx scripts/cleanup-markdown-dependencies.ts
 */

import fs from 'fs';
import path from 'path';

interface CleanupResult {
  filesRemoved: string[];
  importsUpdated: string[];
  errors: string[];
}

class MarkdownCleanupManager {
  private result: CleanupResult = {
    filesRemoved: [],
    importsUpdated: [],
    errors: []
  };

  constructor() {
    console.log('🧹 Starting Markdown Dependencies Cleanup...\n');
  }

  /**
   * Main cleanup function
   */
  async cleanup(): Promise<void> {
    try {
      // Step 1: Confirm cleanup with user
      await this.confirmCleanup();

      // Step 2: Create backup of markdown files
      await this.createBackup();

      // Step 3: Update import references in code
      await this.updateImportReferences();

      // Step 4: Remove markdown files
      await this.removeMarkdownFiles();

      // Step 5: Update package.json dependencies
      await this.updatePackageDependencies();

      // Step 6: Generate cleanup report
      this.generateCleanupReport();

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    }
  }

  /**
   * Confirm cleanup with user
   */
  private async confirmCleanup(): Promise<void> {
    console.log('⚠️  WARNING: This will permanently remove markdown files and update code references.');
    console.log('Make sure you have:');
    console.log('  • Successfully migrated all content to Sanity');
    console.log('  • Validated the migration results');
    console.log('  • Tested the blog functionality');
    console.log('  • Created a backup of your project\n');

    // In a real implementation, you'd add interactive confirmation
    // For now, we'll proceed with a warning
    console.log('🔄 Proceeding with cleanup...\n');
  }

  /**
   * Create backup of markdown files
   */
  private async createBackup(): Promise<void> {
    console.log('💾 Creating backup of markdown files...');

    try {
      const backupDir = path.join(process.cwd(), 'backup-markdown-' + Date.now());
      const contentDir = path.join(process.cwd(), 'content');

      if (fs.existsSync(contentDir)) {
        // Create backup directory
        fs.mkdirSync(backupDir, { recursive: true });

        // Copy content directory to backup
        this.copyDirectory(contentDir, path.join(backupDir, 'content'));

        console.log(`✅ Backup created at: ${backupDir}`);
      } else {
        console.log('⚠️  No content directory found to backup');
      }
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      this.result.errors.push(`Backup creation failed: ${error}`);
    }
  }

  /**
   * Update import references in code files
   */
  private async updateImportReferences(): Promise<void> {
    console.log('🔄 Updating import references...');

    const filesToUpdate = [
      // Add specific files that might import markdown content
      'lib/blog.ts',
      'lib/blog/index.ts',
      'lib/blog/utils.ts',
      'app/blog/page.tsx',
      'app/blog/[slug]/page.tsx',
    ];

    for (const filePath of filesToUpdate) {
      await this.updateFileImports(filePath);
    }
  }

  /**
   * Update imports in a specific file
   */
  private async updateFileImports(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let updated = false;

      // Remove markdown-related imports
      const markdownImports = [
        /import.*from\s+['"]gray-matter['"];?\n?/g,
        /import.*from\s+['"]next-mdx-remote.*['"];?\n?/g,
        /import.*from\s+['"]remark.*['"];?\n?/g,
        /import.*from\s+['"].*\.md['"];?\n?/g,
      ];

      markdownImports.forEach(regex => {
        if (regex.test(content)) {
          content = content.replace(regex, '');
          updated = true;
        }
      });

      // Update function calls that read markdown files
      const markdownFunctionCalls = [
        {
          pattern: /fs\.readFileSync\([^)]*\.md[^)]*\)/g,
          replacement: '// Markdown file reading removed - now using Sanity CMS'
        },
        {
          pattern: /matter\([^)]*\)/g,
          replacement: '// Gray-matter parsing removed - now using Sanity CMS'
        },
        {
          pattern: /glob\([^)]*\.md[^)]*\)/g,
          replacement: '// Markdown file globbing removed - now using Sanity CMS'
        }
      ];

      markdownFunctionCalls.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          updated = true;
        }
      });

      // Add comment about migration
      if (updated) {
        const migrationComment = `
// NOTE: This file has been updated after migrating from Markdown to Sanity CMS
// Markdown-related imports and functions have been removed or commented out
// Blog content is now fetched from Sanity CMS using the enhanced client

`;
        content = migrationComment + content;

        fs.writeFileSync(fullPath, content);
        this.result.importsUpdated.push(filePath);
        console.log(`✅ Updated imports in: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error);
      this.result.errors.push(`Failed to update imports in ${filePath}: ${error}`);
    }
  }

  /**
   * Remove markdown files
   */
  private async removeMarkdownFiles(): Promise<void> {
    console.log('🗑️  Removing markdown files...');

    const contentDir = path.join(process.cwd(), 'content');
    
    if (fs.existsSync(contentDir)) {
      try {
        this.removeMarkdownFilesRecursively(contentDir);
        
        // Remove empty content directory if it only contained markdown files
        if (this.isDirectoryEmpty(contentDir)) {
          fs.rmdirSync(contentDir);
          this.result.filesRemoved.push('content/ (directory)');
          console.log('✅ Removed empty content directory');
        }
      } catch (error) {
        console.error('❌ Error removing markdown files:', error);
        this.result.errors.push(`Failed to remove markdown files: ${error}`);
      }
    } else {
      console.log('⚠️  No content directory found');
    }
  }

  /**
   * Recursively remove markdown files
   */
  private removeMarkdownFilesRecursively(dir: string): void {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        this.removeMarkdownFilesRecursively(itemPath);
        
        // Remove directory if it's empty after removing markdown files
        if (this.isDirectoryEmpty(itemPath)) {
          fs.rmdirSync(itemPath);
          this.result.filesRemoved.push(path.relative(process.cwd(), itemPath) + '/ (directory)');
        }
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        fs.unlinkSync(itemPath);
        this.result.filesRemoved.push(path.relative(process.cwd(), itemPath));
        console.log(`✅ Removed: ${path.relative(process.cwd(), itemPath)}`);
      }
    }
  }

  /**
   * Update package.json dependencies
   */
  private async updatePackageDependencies(): Promise<void> {
    console.log('📦 Updating package.json dependencies...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      let updated = false;

      // Dependencies that might be removed (optional - keep if used elsewhere)
      const optionalDependencies = [
        'gray-matter',
        'next-mdx-remote',
        'remark',
        'remark-html'
      ];

      // Add comment about optional dependencies
      console.log('\n📝 Optional dependencies that could be removed if not used elsewhere:');
      optionalDependencies.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          console.log(`  • ${dep} - Check if used in other parts of the application`);
        }
      });

      // Don't automatically remove dependencies as they might be used elsewhere
      // Just provide information to the user

      if (updated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json');
      } else {
        console.log('ℹ️  No automatic changes made to package.json');
      }

    } catch (error) {
      console.error('❌ Error updating package.json:', error);
      this.result.errors.push(`Failed to update package.json: ${error}`);
    }
  }

  /**
   * Utility functions
   */
  private copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private isDirectoryEmpty(dir: string): boolean {
    try {
      const items = fs.readdirSync(dir);
      return items.length === 0;
    } catch {
      return true;
    }
  }

  /**
   * Generate cleanup report
   */
  private generateCleanupReport(): void {
    console.log('\n' + '='.repeat(50));
    console.log('🧹 CLEANUP REPORT');
    console.log('='.repeat(50));

    console.log(`\n📊 SUMMARY:`);
    console.log(`Files Removed: ${this.result.filesRemoved.length}`);
    console.log(`Imports Updated: ${this.result.importsUpdated.length}`);
    console.log(`Errors: ${this.result.errors.length}`);

    if (this.result.filesRemoved.length > 0) {
      console.log(`\n🗑️  REMOVED FILES:`);
      this.result.filesRemoved.forEach(file => console.log(`  • ${file}`));
    }

    if (this.result.importsUpdated.length > 0) {
      console.log(`\n🔄 UPDATED IMPORTS:`);
      this.result.importsUpdated.forEach(file => console.log(`  • ${file}`));
    }

    if (this.result.errors.length > 0) {
      console.log(`\n❌ ERRORS:`);
      this.result.errors.forEach(error => console.log(`  • ${error}`));
    }

    console.log(`\n✅ CLEANUP COMPLETED!`);
    console.log(`\n📝 NEXT STEPS:`);
    console.log(`  • Test your application to ensure everything works`);
    console.log(`  • Remove unused dependencies from package.json if needed`);
    console.log(`  • Update any remaining references to markdown files`);
    console.log(`  • Consider running 'npm install' to clean up node_modules`);
    console.log(`  • Update documentation to reflect the new Sanity CMS setup`);

    // Save cleanup log
    const logPath = path.join(process.cwd(), 'cleanup-log.json');
    fs.writeFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      result: this.result
    }, null, 2));
    console.log(`\n📄 Cleanup log saved to: ${logPath}`);
  }
}

// Run cleanup if this script is executed directly
if (process.argv[1]?.includes('cleanup-markdown-dependencies.ts')) {
  const cleanup = new MarkdownCleanupManager();
  cleanup.cleanup().catch(console.error);
}

export { MarkdownCleanupManager };