import * as fs from 'fs/promises';
import * as path from 'path';

interface MigrationOperation {
  type: 'move' | 'delete' | 'create_dir';
  source?: string;
  destination?: string;
  timestamp: Date;
}

interface MigrationResult {
  success: boolean;
  operations: MigrationOperation[];
  errors: string[];
  warnings: string[];
}

export class FileMigrationManager {
  private operations: MigrationOperation[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  async createDirectoryStructure(): Promise<void> {
    const directories = [
      'src',
      'src/app',
      'src/components',
      'src/components/features',
      'src/components/features/blog',
      'src/components/features/admin',
      'src/components/features/courses',
      'src/components/features/contact',
      'src/components/features/lead-generation',
      'src/components/layout',
      'src/components/shared',
      'src/components/ui',
      'src/lib',
      'src/hooks',
      'src/types',
      'docs',
      'docs/setup',
      'docs/api',
      'docs/deployment',
      'docs/architecture',
      'tools',
      'tools/scripts',
      'tools/scripts/build',
      'tools/scripts/deploy',
      'tools/scripts/maintenance',
      'tools/scripts/development',
      'tools/migration',
      'tools/generators',
      'tests',
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      'tests/fixtures',
      'tests/__mocks__',
      'tests/utils',
      'config'
    ];

    for (const dir of directories) {
      await this.ensureDirectory(dir);
    }
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      this.operations.push({
        type: 'create_dir',
        destination: dirPath,
        timestamp: new Date()
      });
    }
  }

  async moveFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      await this.ensureDirectory(path.dirname(destination));
      
      // Check if source exists
      await fs.access(source);
      
      // Move the file
      await fs.rename(source, destination);
      
      this.operations.push({
        type: 'move',
        source,
        destination,
        timestamp: new Date()
      });
    } catch (error) {
      const errorMsg = `Failed to move ${source} to ${destination}: ${error}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      
      this.operations.push({
        type: 'delete',
        source: filePath,
        timestamp: new Date()
      });
    } catch (error) {
      const errorMsg = `Failed to delete ${filePath}: ${error}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  async moveDirectory(source: string, destination: string): Promise<void> {
    try {
      await this.ensureDirectory(path.dirname(destination));
      
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);
        
        if (entry.isDirectory()) {
          await this.moveDirectory(sourcePath, destPath);
        } else {
          await this.moveFile(sourcePath, destPath);
        }
      }
      
      // Remove empty source directory
      try {
        await fs.rmdir(source);
        this.operations.push({
          type: 'delete',
          source,
          timestamp: new Date()
        });
      } catch (error) {
        this.warnings.push(`Could not remove empty directory ${source}: ${error}`);
      }
    } catch (error) {
      const errorMsg = `Failed to move directory ${source} to ${destination}: ${error}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  async validateMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: this.errors.length === 0,
      operations: [...this.operations],
      errors: [...this.errors],
      warnings: [...this.warnings]
    };

    // Validate that moved files exist at their destinations
    for (const op of this.operations) {
      if (op.type === 'move' && op.destination) {
        try {
          await fs.access(op.destination);
        } catch {
          result.errors.push(`Moved file not found at destination: ${op.destination}`);
          result.success = false;
        }
      }
    }

    return result;
  }

  getOperationsSummary(): string {
    let summary = '# Migration Operations Summary\n\n';
    
    const operationCounts = this.operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    summary += '## Operation Counts\n';
    for (const [type, count] of Object.entries(operationCounts)) {
      summary += `- ${type}: ${count}\n`;
    }

    if (this.errors.length > 0) {
      summary += '\n## Errors\n';
      this.errors.forEach(error => summary += `- ${error}\n`);
    }

    if (this.warnings.length > 0) {
      summary += '\n## Warnings\n';
      this.warnings.forEach(warning => summary += `- ${warning}\n`);
    }

    return summary;
  }

  async createRollbackScript(): Promise<void> {
    let script = '#!/bin/bash\n\n';
    script += '# Rollback script for project structure migration\n';
    script += '# Run this script to undo the migration\n\n';

    // Reverse the operations
    const reverseOps = [...this.operations].reverse();
    
    for (const op of reverseOps) {
      switch (op.type) {
        case 'move':
          if (op.source && op.destination) {
            script += `mv "${op.destination}" "${op.source}"\n`;
          }
          break;
        case 'create_dir':
          if (op.destination) {
            script += `rmdir "${op.destination}" 2>/dev/null || true\n`;
          }
          break;
        case 'delete':
          script += `# Cannot restore deleted file: ${op.source}\n`;
          break;
      }
    }

    await fs.writeFile('tools/migration/rollback.sh', script);
    await fs.chmod('tools/migration/rollback.sh', 0o755);
  }
}