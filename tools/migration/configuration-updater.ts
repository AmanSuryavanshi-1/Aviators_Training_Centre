import * as fs from 'fs/promises';
import * as path from 'path';

interface ConfigUpdate {
  file: string;
  changes: string[];
  success: boolean;
  error?: string;
}

export class ConfigurationUpdater {
  private updates: ConfigUpdate[] = [];

  async updateNextConfig(): Promise<void> {
    const configPath = 'next.config.mjs';
    const newConfigPath = 'config/next.config.mjs';
    
    try {
      // Read existing config
      let content = await fs.readFile(configPath, 'utf-8');
      
      // Update any path references if needed
      // Most Next.js configs should work as-is with the new structure
      
      // Ensure config directory exists
      await fs.mkdir('config', { recursive: true });
      
      // Write to new location
      await fs.writeFile(newConfigPath, content);
      
      this.updates.push({
        file: configPath,
        changes: [`Moved to ${newConfigPath}`],
        success: true
      });
    } catch (error) {
      this.updates.push({
        file: configPath,
        changes: [],
        success: false,
        error: `Failed to update Next.js config: ${error}`
      });
    }
  }

  async updateTailwindConfig(): Promise<void> {
    const configPath = 'tailwind.config.mjs';
    const newConfigPath = 'config/tailwind.config.mjs';
    
    try {
      let content = await fs.readFile(configPath, 'utf-8');
      
      // Update content paths to include src directory
      content = content.replace(
        /content:\s*\[([^\]]+)\]/,
        (match, paths) => {
          const updatedPaths = paths
            .split(',')
            .map((p: string) => p.trim())
            .map((p: string) => {
              if (p.includes('./app/')) {
                return p.replace('./app/', './src/app/');
              }
              if (p.includes('./components/')) {
                return p.replace('./components/', './src/components/');
              }
              if (p.includes('./pages/')) {
                return p.replace('./pages/', './src/pages/');
              }
              return p;
            })
            .join(',\n    ');
          
          return `content: [\n    ${updatedPaths}\n  ]`;
        }
      );
      
      // Ensure config directory exists
      await fs.mkdir('config', { recursive: true });
      
      // Write to new location
      await fs.writeFile(newConfigPath, content);
      
      this.updates.push({
        file: configPath,
        changes: [
          `Moved to ${newConfigPath}`,
          'Updated content paths to include src directory'
        ],
        success: true
      });
    } catch (error) {
      this.updates.push({
        file: configPath,
        changes: [],
        success: false,
        error: `Failed to update Tailwind config: ${error}`
      });
    }
  }

  async updateTypeScriptConfig(): Promise<void> {
    const configPath = 'tsconfig.json';
    const newConfigPath = 'config/tsconfig.json';
    
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      
      // Update baseUrl and paths
      config.compilerOptions = config.compilerOptions || {};
      config.compilerOptions.baseUrl = '..'; // Since config is now in config/
      config.compilerOptions.paths = {
        '@/*': ['./src/*'],
        '@/components/*': ['./src/components/*'],
        '@/lib/*': ['./src/lib/*'],
        '@/hooks/*': ['./src/hooks/*'],
        '@/types/*': ['./src/types/*'],
        '@/app/*': ['./src/app/*']
      };

      // Update include paths
      if (config.include) {
        config.include = config.include.map((includePath: string) => {
          if (includePath === 'app/**/*') return '../src/app/**/*';
          if (includePath === 'components/**/*') return '../src/components/**/*';
          if (includePath === 'lib/**/*') return '../src/lib/**/*';
          if (includePath === 'hooks/**/*') return '../src/hooks/**/*';
          if (includePath.startsWith('./')) return '../' + includePath.slice(2);
          return includePath.startsWith('../') ? includePath : '../' + includePath;
        });
      } else {
        config.include = [
          '../src/**/*',
          '../tests/**/*',
          '../tools/**/*'
        ];
      }

      // Ensure config directory exists
      await fs.mkdir('config', { recursive: true });
      
      // Write to new location
      await fs.writeFile(newConfigPath, JSON.stringify(config, null, 2));
      
      this.updates.push({
        file: configPath,
        changes: [
          `Moved to ${newConfigPath}`,
          'Updated baseUrl to account for new location',
          'Added path mappings for @ alias',
          'Updated include paths for src structure'
        ],
        success: true
      });
    } catch (error) {
      this.updates.push({
        file: configPath,
        changes: [],
        success: false,
        error: `Failed to update TypeScript config: ${error}`
      });
    }
  }

  async updateESLintConfig(): Promise<void> {
    const possiblePaths = ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js'];
    const newConfigPath = 'config/eslint.config.js';
    
    for (const configPath of possiblePaths) {
      try {
        await fs.access(configPath);
        
        let content = await fs.readFile(configPath, 'utf-8');
        
        // If it's a JSON file, convert to JS
        if (configPath.endsWith('.json')) {
          const config = JSON.parse(content);
          content = `module.exports = ${JSON.stringify(config, null, 2)};`;
        }
        
        // Ensure config directory exists
        await fs.mkdir('config', { recursive: true });
        
        // Write to new location
        await fs.writeFile(newConfigPath, content);
        
        this.updates.push({
          file: configPath,
          changes: [
            `Moved to ${newConfigPath}`,
            configPath.endsWith('.json') ? 'Converted from JSON to JS format' : ''
          ].filter(Boolean),
          success: true
        });
        
        break; // Only process the first found config
      } catch (error) {
        // File doesn't exist, try next
        continue;
      }
    }
  }

  async updatePackageJsonScripts(): Promise<void> {
    const packagePath = 'package.json';
    
    try {
      const content = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.scripts) {
        const changes: string[] = [];
        
        // Update script references to new config locations
        for (const [scriptName, scriptValue] of Object.entries(packageJson.scripts)) {
          let newValue = scriptValue as string;
          
          // Update config file references
          if (newValue.includes('next.config.mjs')) {
            newValue = newValue.replace('next.config.mjs', 'config/next.config.mjs');
            changes.push(`Updated ${scriptName} to reference config/next.config.mjs`);
          }
          
          if (newValue.includes('tailwind.config.mjs')) {
            newValue = newValue.replace('tailwind.config.mjs', 'config/tailwind.config.mjs');
            changes.push(`Updated ${scriptName} to reference config/tailwind.config.mjs`);
          }
          
          if (newValue.includes('tsconfig.json')) {
            newValue = newValue.replace('tsconfig.json', 'config/tsconfig.json');
            changes.push(`Updated ${scriptName} to reference config/tsconfig.json`);
          }
          
          // Update script references to new tools location
          if (newValue.includes('scripts/')) {
            newValue = newValue.replace(/scripts\//g, 'tools/scripts/');
            changes.push(`Updated ${scriptName} to reference tools/scripts/`);
          }
          
          packageJson.scripts[scriptName] = newValue;
        }
        
        // Add new migration-related scripts
        packageJson.scripts['migrate:structure'] = 'node tools/migration/migrate-structure.js';
        packageJson.scripts['migrate:rollback'] = 'bash tools/migration/rollback.sh';
        packageJson.scripts['test:unit'] = 'vitest run tests/unit';
        packageJson.scripts['test:integration'] = 'vitest run tests/integration';
        packageJson.scripts['test:e2e'] = 'vitest run tests/e2e';
        
        changes.push('Added migration and test scripts');
        
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
        
        this.updates.push({
          file: packagePath,
          changes,
          success: true
        });
      }
    } catch (error) {
      this.updates.push({
        file: packagePath,
        changes: [],
        success: false,
        error: `Failed to update package.json: ${error}`
      });
    }
  }

  async updateAllConfigurations(): Promise<void> {
    await Promise.all([
      this.updateNextConfig(),
      this.updateTailwindConfig(),
      this.updateTypeScriptConfig(),
      this.updateESLintConfig(),
      this.updatePackageJsonScripts()
    ]);
  }

  async createRootTsConfig(): Promise<void> {
    // Create a root tsconfig.json that extends the one in config/
    const rootConfig = {
      extends: './config/tsconfig.json'
    };
    
    try {
      await fs.writeFile('tsconfig.json', JSON.stringify(rootConfig, null, 2));
      
      this.updates.push({
        file: 'tsconfig.json',
        changes: ['Created root tsconfig.json that extends config/tsconfig.json'],
        success: true
      });
    } catch (error) {
      this.updates.push({
        file: 'tsconfig.json',
        changes: [],
        success: false,
        error: `Failed to create root tsconfig.json: ${error}`
      });
    }
  }

  async updateNextConfigReferences(): Promise<void> {
    // Update any files that reference next.config.mjs
    const filesToCheck = ['package.json', 'vercel.json'];
    
    for (const file of filesToCheck) {
      try {
        await fs.access(file);
        let content = await fs.readFile(file, 'utf-8');
        const originalContent = content;
        
        content = content.replace(/next\.config\.mjs/g, 'config/next.config.mjs');
        
        if (content !== originalContent) {
          await fs.writeFile(file, content);
          
          this.updates.push({
            file,
            changes: ['Updated next.config.mjs references to config/next.config.mjs'],
            success: true
          });
        }
      } catch (error) {
        // File doesn't exist or couldn't be updated
        continue;
      }
    }
  }

  getUpdatesSummary(): string {
    let summary = '# Configuration Updates Summary\n\n';
    
    const successful = this.updates.filter(u => u.success);
    const failed = this.updates.filter(u => !u.success);
    
    summary += `## Summary\n`;
    summary += `- Successful updates: ${successful.length}\n`;
    summary += `- Failed updates: ${failed.length}\n\n`;
    
    if (successful.length > 0) {
      summary += `## Successful Updates\n`;
      for (const update of successful) {
        summary += `### ${update.file}\n`;
        update.changes.forEach(change => summary += `- ${change}\n`);
        summary += '\n';
      }
    }
    
    if (failed.length > 0) {
      summary += `## Failed Updates\n`;
      for (const update of failed) {
        summary += `### ${update.file}\n`;
        summary += `- Error: ${update.error}\n\n`;
      }
    }
    
    return summary;
  }
}