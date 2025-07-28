import * as fs from 'fs/promises';
import * as path from 'path';

interface ImportStatement {
  original: string;
  module: string;
  line: number;
  isRelative: boolean;
}

interface PathMapping {
  from: string;
  to: string;
  pattern: RegExp;
}

interface ImportUpdateResult {
  file: string;
  updatesCount: number;
  errors: string[];
}

export class ImportPathUpdater {
  private pathMappings: PathMapping[] = [];

  constructor() {
    this.initializePathMappings();
  }

  private initializePathMappings(): void {
    // Define path mappings for the migration
    const mappings = [
      // App directory
      { from: './app/', to: './src/app/' },
      { from: '../app/', to: '../src/app/' },
      { from: '@/app/', to: '@/app/' }, // Already using @ alias
      
      // Components
      { from: './components/', to: './src/components/' },
      { from: '../components/', to: '../src/components/' },
      { from: '@/components/', to: '@/components/' },
      
      // Lib
      { from: './lib/', to: './src/lib/' },
      { from: '../lib/', to: '../src/lib/' },
      { from: '@/lib/', to: '@/lib/' },
      
      // Hooks
      { from: './hooks/', to: './src/hooks/' },
      { from: '../hooks/', to: '../src/hooks/' },
      { from: '@/hooks/', to: '@/hooks/' },
      
      // Feature-based component mappings
      { from: './components/blog/', to: './src/components/features/blog/' },
      { from: '../components/blog/', to: '../src/components/features/blog/' },
      { from: './components/admin/', to: './src/components/features/admin/' },
      { from: '../components/admin/', to: '../src/components/features/admin/' },
      { from: './components/courses/', to: './src/components/features/courses/' },
      { from: '../components/courses/', to: '../src/components/features/courses/' },
      { from: './components/contact/', to: './src/components/features/contact/' },
      { from: '../components/contact/', to: '../src/components/features/contact/' },
      { from: './components/lead-generation/', to: './src/components/features/lead-generation/' },
      { from: '../components/lead-generation/', to: '../src/components/features/lead-generation/' },
    ];

    this.pathMappings = mappings.map(mapping => ({
      from: mapping.from,
      to: mapping.to,
      pattern: new RegExp(this.escapeRegExp(mapping.from), 'g')
    }));
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async scanImports(filePath: string): Promise<ImportStatement[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const imports: ImportStatement[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const importMatches = this.extractImportStatements(line);
        
        for (const match of importMatches) {
          imports.push({
            original: match,
            module: this.extractModulePath(match),
            line: i + 1,
            isRelative: this.isRelativeImport(this.extractModulePath(match))
          });
        }
      }

      return imports;
    } catch (error) {
      console.error(`Error scanning imports in ${filePath}:`, error);
      return [];
    }
  }

  private extractImportStatements(line: string): string[] {
    const imports: string[] = [];
    
    // ES6 imports
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(line)) !== null) {
      imports.push(line.trim());
    }
    
    // CommonJS requires
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = requireRegex.exec(line)) !== null) {
      imports.push(line.trim());
    }
    
    // Dynamic imports
    const dynamicImportRegex = /import\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = dynamicImportRegex.exec(line)) !== null) {
      imports.push(line.trim());
    }

    return imports;
  }

  private extractModulePath(importStatement: string): string {
    const match = importStatement.match(/['"`]([^'"`]+)['"`]/);
    return match ? match[1] : '';
  }

  private isRelativeImport(modulePath: string): boolean {
    return modulePath.startsWith('./') || modulePath.startsWith('../');
  }

  async updateImportPath(filePath: string, oldPath: string, newPath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const updatedContent = content.replace(
        new RegExp(`(['"\`])${this.escapeRegExp(oldPath)}\\1`, 'g'),
        `$1${newPath}$1`
      );

      if (content !== updatedContent) {
        await fs.writeFile(filePath, updatedContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating import path in ${filePath}:`, error);
      return false;
    }
  }

  async updateAllImports(filePath: string): Promise<ImportUpdateResult> {
    const result: ImportUpdateResult = {
      file: filePath,
      updatesCount: 0,
      errors: []
    };

    try {
      let content = await fs.readFile(filePath, 'utf-8');
      let hasChanges = false;

      // Apply all path mappings
      for (const mapping of this.pathMappings) {
        const originalContent = content;
        
        // Update import statements
        content = content.replace(
          new RegExp(`(['"\`])${this.escapeRegExp(mapping.from)}([^'"\`]*)\\1`, 'g'),
          `$1${mapping.to}$2$1`
        );

        if (content !== originalContent) {
          hasChanges = true;
          result.updatesCount++;
        }
      }

      // Handle relative path adjustments based on file's new location
      content = await this.adjustRelativePaths(filePath, content);

      if (hasChanges || content !== await fs.readFile(filePath, 'utf-8')) {
        await fs.writeFile(filePath, content);
      }

    } catch (error) {
      result.errors.push(`Error updating imports: ${error}`);
    }

    return result;
  }

  private async adjustRelativePaths(filePath: string, content: string): Promise<string> {
    // This method adjusts relative paths based on the file's new location
    // For now, we'll implement basic adjustments
    
    const fileDir = path.dirname(filePath);
    let adjustedContent = content;

    // If file is now in src/, adjust relative imports that go outside src/
    if (filePath.startsWith('src/')) {
      // Adjust imports that reference files outside src/
      adjustedContent = adjustedContent.replace(
        /(['"`])\.\.\/(?!src\/)([^'"`]+)\1/g,
        (match, quote, importPath) => {
          // If the import is going outside src/, add an extra ../
          return `${quote}../${importPath}${quote}`;
        }
      );
    }

    return adjustedContent;
  }

  async validateImports(filePath: string): Promise<string[]> {
    const errors: string[] = [];
    const imports = await this.scanImports(filePath);

    for (const importStmt of imports) {
      if (importStmt.isRelative) {
        const resolvedPath = path.resolve(path.dirname(filePath), importStmt.module);
        
        try {
          await fs.access(resolvedPath);
        } catch {
          // Try with common extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
          let found = false;
          
          for (const ext of extensions) {
            try {
              await fs.access(resolvedPath + ext);
              found = true;
              break;
            } catch {
              // Continue trying
            }
          }
          
          if (!found) {
            errors.push(`Import not found: ${importStmt.module} in ${filePath}:${importStmt.line}`);
          }
        }
      }
    }

    return errors;
  }

  async updateTypeScriptConfig(): Promise<void> {
    const configPath = 'tsconfig.json';
    
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Update baseUrl and paths
      config.compilerOptions = config.compilerOptions || {};
      config.compilerOptions.baseUrl = '.';
      config.compilerOptions.paths = {
        '@/*': ['./src/*'],
        '@/components/*': ['./src/components/*'],
        '@/lib/*': ['./src/lib/*'],
        '@/hooks/*': ['./src/hooks/*'],
        '@/types/*': ['./src/types/*'],
        '@/app/*': ['./src/app/*']
      };

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error updating TypeScript config:', error);
    }
  }

  async generateImportReport(files: string[]): Promise<string> {
    let report = '# Import Path Update Report\n\n';
    let totalUpdates = 0;
    const allErrors: string[] = [];

    for (const file of files) {
      const result = await this.updateAllImports(file);
      totalUpdates += result.updatesCount;
      allErrors.push(...result.errors);

      if (result.updatesCount > 0 || result.errors.length > 0) {
        report += `## ${file}\n`;
        report += `- Updates: ${result.updatesCount}\n`;
        if (result.errors.length > 0) {
          report += `- Errors:\n`;
          result.errors.forEach(error => report += `  - ${error}\n`);
        }
        report += '\n';
      }
    }

    report += `## Summary\n`;
    report += `- Total files processed: ${files.length}\n`;
    report += `- Total import updates: ${totalUpdates}\n`;
    report += `- Total errors: ${allErrors.length}\n`;

    return report;
  }
}