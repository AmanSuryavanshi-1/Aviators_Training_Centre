import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RollbackOperation {
  type: 'move' | 'delete' | 'create' | 'restore';
  source?: string;
  destination?: string;
  content?: string;
  timestamp: Date;
}

interface RollbackPlan {
  operations: RollbackOperation[];
  createdAt: Date;
  description: string;
}

export class RollbackSystem {
  private rollbackPlan: RollbackPlan;

  constructor() {
    this.rollbackPlan = {
      operations: [],
      createdAt: new Date(),
      description: 'Project structure migration rollback plan'
    };
  }

  async createGitBackup(): Promise<void> {
    try {
      // Create a backup branch
      await execAsync('git checkout -b pre-migration-backup');
      await execAsync('git add -A');
      await execAsync('git commit -m "Pre-migration backup - project structure migration"');
      await execAsync('git checkout main');
      
      console.log('✅ Git backup created on branch: pre-migration-backup');
    } catch (error) {
      console.error('❌ Failed to create Git backup:', error);
      throw error;
    }
  }

  async createFileSystemBackup(): Promise<void> {
    const backupDir = 'migration-backup';
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Copy critical directories
      const criticalDirs = [
        'app',
        'components', 
        'lib',
        'hooks',
        'scripts',
        'tests',
        'docs'
      ];

      for (const dir of criticalDirs) {
        try {
          await fs.access(dir);
          await this.copyDirectory(dir, path.join(backupDir, dir));
          console.log(`✅ Backed up: ${dir}`);
        } catch {
          // Directory doesn't exist, skip
          console.log(`⚠️  Directory ${dir} doesn't exist, skipping backup`);
        }
      }

      // Copy critical files
      const criticalFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.mjs',
        'tailwind.config.mjs',
        '.eslintrc.json'
      ];

      for (const file of criticalFiles) {
        try {
          await fs.access(file);
          await fs.copyFile(file, path.join(backupDir, file));
          console.log(`✅ Backed up: ${file}`);
        } catch {
          console.log(`⚠️  File ${file} doesn't exist, skipping backup`);
        }
      }

      console.log(`✅ File system backup created in: ${backupDir}`);
    } catch (error) {
      console.error('❌ Failed to create file system backup:', error);
      throw error;
    }
  }

  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  recordOperation(operation: Omit<RollbackOperation, 'timestamp'>): void {
    this.rollbackPlan.operations.push({
      ...operation,
      timestamp: new Date()
    });
  }

  async generateRollbackScript(): Promise<void> {
    let script = '#!/bin/bash\n\n';
    script += '# Automated rollback script for project structure migration\n';
    script += '# Generated on: ' + new Date().toISOString() + '\n\n';
    script += 'echo "🔄 Starting rollback process..."\n\n';

    // Git rollback option
    script += '# Option 1: Git-based rollback (recommended)\n';
    script += 'echo "Option 1: Git-based rollback"\n';
    script += 'echo "Run: git checkout pre-migration-backup"\n';
    script += 'echo "Then: git checkout -b rollback-$(date +%Y%m%d-%H%M%S)"\n';
    script += 'echo "Then: git cherry-pick <any-commits-to-keep>"\n\n';

    // File system rollback
    script += '# Option 2: File system rollback\n';
    script += 'echo "Option 2: File system rollback"\n\n';

    // Reverse the operations
    const reverseOps = [...this.rollbackPlan.operations].reverse();
    
    for (const op of reverseOps) {
      switch (op.type) {
        case 'move':
          if (op.source && op.destination) {
            script += `# Reverse move: ${op.destination} -> ${op.source}\n`;
            script += `if [ -e "${op.destination}" ]; then\n`;
            script += `  mv "${op.destination}" "${op.source}"\n`;
            script += `  echo "✅ Moved ${op.destination} back to ${op.source}"\n`;
            script += `else\n`;
            script += `  echo "⚠️  ${op.destination} not found, skipping"\n`;
            script += `fi\n\n`;
          }
          break;
        case 'delete':
          if (op.source) {
            script += `# Cannot restore deleted: ${op.source}\n`;
            script += `echo "❌ Cannot restore deleted file: ${op.source}"\n\n`;
          }
          break;
        case 'create':
          if (op.destination) {
            script += `# Remove created: ${op.destination}\n`;
            script += `if [ -e "${op.destination}" ]; then\n`;
            script += `  rm -rf "${op.destination}"\n`;
            script += `  echo "✅ Removed created file/directory: ${op.destination}"\n`;
            script += `else\n`;
            script += `  echo "⚠️  ${op.destination} not found, skipping"\n`;
            script += `fi\n\n`;
          }
          break;
      }
    }

    script += 'echo "🔄 Rollback process completed"\n';
    script += 'echo "⚠️  Please verify the rollback was successful"\n';
    script += 'echo "⚠️  You may need to run: npm install"\n';

    await fs.writeFile('tools/migration/rollback.sh', script);
    await fs.chmod('tools/migration/rollback.sh', 0o755);
    
    console.log('✅ Rollback script generated: tools/migration/rollback.sh');
  }

  async saveRollbackPlan(): Promise<void> {
    const planPath = 'tools/migration/rollback-plan.json';
    await fs.writeFile(planPath, JSON.stringify(this.rollbackPlan, null, 2));
    console.log(`✅ Rollback plan saved: ${planPath}`);
  }

  async executeGitRollback(): Promise<void> {
    try {
      console.log('🔄 Executing Git-based rollback...');
      
      // Stash any uncommitted changes
      await execAsync('git stash push -m "Pre-rollback stash"');
      
      // Switch to backup branch
      await execAsync('git checkout pre-migration-backup');
      
      // Create a new branch from the backup
      const rollbackBranch = `rollback-${Date.now()}`;
      await execAsync(`git checkout -b ${rollbackBranch}`);
      
      console.log(`✅ Rollback completed. You are now on branch: ${rollbackBranch}`);
      console.log('⚠️  Review the changes and merge back to main if satisfied');
      
    } catch (error) {
      console.error('❌ Git rollback failed:', error);
      throw error;
    }
  }

  async validateRollback(): Promise<boolean> {
    try {
      console.log('🔍 Validating rollback...');
      
      // Check if critical directories exist
      const criticalPaths = [
        'app',
        'components',
        'lib',
        'package.json',
        'next.config.mjs'
      ];

      for (const path of criticalPaths) {
        try {
          await fs.access(path);
          console.log(`✅ ${path} exists`);
        } catch {
          console.log(`❌ ${path} missing`);
          return false;
        }
      }

      // Try to run build
      try {
        await execAsync('npm run build', { timeout: 60000 });
        console.log('✅ Build successful after rollback');
        return true;
      } catch (error) {
        console.log('❌ Build failed after rollback');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Rollback validation failed:', error);
      return false;
    }
  }

  generateRollbackInstructions(): string {
    return `
# Rollback Instructions

## Automated Rollback Options

### Option 1: Git-based Rollback (Recommended)
\`\`\`bash
# Switch to the backup branch
git checkout pre-migration-backup

# Create a new branch for rollback
git checkout -b rollback-$(date +%Y%m%d-%H%M%S)

# If you need to preserve any changes made after migration:
# git cherry-pick <commit-hash>
\`\`\`

### Option 2: Script-based Rollback
\`\`\`bash
# Run the generated rollback script
./tools/migration/rollback.sh
\`\`\`

### Option 3: Manual File System Rollback
\`\`\`bash
# Restore from backup directory
cp -r migration-backup/* .
npm install
npm run build
\`\`\`

## Validation Steps

After rollback:
1. Run \`npm install\` to ensure dependencies are correct
2. Run \`npm run build\` to verify the build works
3. Run \`npm run dev\` to test the development server
4. Check that all pages load correctly
5. Verify all functionality works as expected

## Emergency Recovery

If rollback fails:
1. Check Git history: \`git log --oneline\`
2. Find the last known good commit
3. Reset to that commit: \`git reset --hard <commit-hash>\`
4. Force push if necessary: \`git push --force-with-lease\`

## Support

If you encounter issues during rollback:
1. Check the rollback plan: \`tools/migration/rollback-plan.json\`
2. Review the rollback script: \`tools/migration/rollback.sh\`
3. Contact the development team for assistance
`;
  }
}

// CLI usage
if (require.main === module) {
  const rollback = new RollbackSystem();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'backup':
      Promise.all([
        rollback.createGitBackup(),
        rollback.createFileSystemBackup()
      ]).then(() => {
        console.log('✅ Backup completed');
      }).catch(error => {
        console.error('❌ Backup failed:', error);
        process.exit(1);
      });
      break;
      
    case 'rollback':
      rollback.executeGitRollback()
        .then(() => rollback.validateRollback())
        .then(success => {
          if (success) {
            console.log('✅ Rollback completed and validated');
          } else {
            console.log('⚠️  Rollback completed but validation failed');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Rollback failed:', error);
          process.exit(1);
        });
      break;
      
    case 'validate':
      rollback.validateRollback()
        .then(success => {
          process.exit(success ? 0 : 1);
        });
      break;
      
    default:
      console.log('Usage: tsx rollback-system.ts [backup|rollback|validate]');
      process.exit(1);
  }
}