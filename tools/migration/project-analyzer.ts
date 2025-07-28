import * as fs from 'fs/promises';
import * as path from 'path';

interface FileInfo {
  path: string;
  type: 'file' | 'directory';
  size: number;
  extension?: string;
  purpose: string;
  migrationDestination?: string;
}

interface DependencyInfo {
  file: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
}

interface ProjectStructure {
  files: FileInfo[];
  dependencies: DependencyInfo[];
  totalFiles: number;
  totalDirectories: number;
}

export class ProjectAnalyzer {
  private rootPath: string;
  private excludePatterns: RegExp[];

  constructor(rootPath: string = '.') {
    this.rootPath = rootPath;
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /dist/,
      /build/,
      /coverage/,
      /\.kiro\/specs/
    ];
  }

  async scanCurrentStructure(): Promise<ProjectStructure> {
    const files: FileInfo[] = [];
    const dependencies: DependencyInfo[] = [];

    await this.scanDirectory(this.rootPath, files);
    
    // Analyze dependencies for TypeScript/JavaScript files
    for (const file of files) {
      if (file.type === 'file' && this.isCodeFile(file.path)) {
        const deps = await this.analyzeDependencies(file.path);
        if (deps) {
          dependencies.push(deps);
        }
      }
    }

    return {
      files,
      dependencies,
      totalFiles: files.filter(f => f.type === 'file').length,
      totalDirectories: files.filter(f => f.type === 'directory').length
    };
  }

  private async scanDirectory(dirPath: string, files: FileInfo[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath);

        if (this.shouldExclude(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          files.push({
            path: relativePath,
            type: 'directory',
            size: 0,
            purpose: this.determinePurpose(relativePath, 'directory')
          });
          await this.scanDirectory(fullPath, files);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: relativePath,
            type: 'file',
            size: stats.size,
            extension: path.extname(entry.name),
            purpose: this.determinePurpose(relativePath, 'file'),
            migrationDestination: this.determineMigrationDestination(relativePath)
          });
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${dirPath}:`, error);
    }
  }

  private shouldExclude(relativePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(relativePath));
  }

  private determinePurpose(filePath: string, type: 'file' | 'directory'): string {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // Documentation files
    if (fileName.endsWith('.md') && filePath.includes('BLOG_')) return 'redundant-documentation';
    if (fileName.endsWith('.md') && fileName.includes('COMPLETE')) return 'redundant-documentation';
    if (fileName.endsWith('.md') && fileName.includes('FIX')) return 'redundant-documentation';
    if (fileName.endsWith('.md') && fileName.includes('GUIDE')) return 'documentation';
    if (fileName.endsWith('.md')) return 'documentation';

    // Source code
    if (filePath.startsWith('app/')) return 'nextjs-app';
    if (filePath.startsWith('components/')) return 'react-component';
    if (filePath.startsWith('lib/')) return 'utility-library';
    if (filePath.startsWith('hooks/')) return 'react-hook';

    // Tests
    if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'test';
    if (filePath.startsWith('tests/')) return 'test';
    if (fileName.startsWith('test-')) return 'test';

    // Scripts
    if (filePath.startsWith('scripts/')) return 'script';
    if (fileName.endsWith('.js') && filePath === fileName) return 'script';

    // Configuration
    if (fileName.includes('config')) return 'configuration';
    if (['.json', '.js', '.mjs', '.ts'].includes(path.extname(fileName)) && 
        ['next', 'tailwind', 'eslint', 'tsconfig', 'package'].some(config => fileName.includes(config))) {
      return 'configuration';
    }

    // Assets
    if (filePath.startsWith('public/')) return 'static-asset';

    return type === 'directory' ? 'directory' : 'unknown';
  }

  private determineMigrationDestination(filePath: string): string | undefined {
    const purpose = this.determinePurpose(filePath, 'file');

    switch (purpose) {
      case 'nextjs-app':
        return filePath.replace('app/', 'src/app/');
      case 'react-component':
        return this.determineComponentDestination(filePath);
      case 'utility-library':
        return filePath.replace('lib/', 'src/lib/');
      case 'react-hook':
        return filePath.replace('hooks/', 'src/hooks/');
      case 'test':
        return this.determineTestDestination(filePath);
      case 'script':
        return this.determineScriptDestination(filePath);
      case 'documentation':
        return this.determineDocumentationDestination(filePath);
      case 'redundant-documentation':
        return 'DELETE';
      case 'configuration':
        return this.determineConfigDestination(filePath);
      default:
        return undefined;
    }
  }

  private determineComponentDestination(filePath: string): string {
    const fileName = path.basename(filePath);
    
    // Feature-based organization
    if (filePath.includes('blog')) return `src/components/features/blog/${fileName}`;
    if (filePath.includes('admin')) return `src/components/features/admin/${fileName}`;
    if (filePath.includes('course')) return `src/components/features/courses/${fileName}`;
    if (filePath.includes('contact')) return `src/components/features/contact/${fileName}`;
    if (filePath.includes('lead-generation')) return `src/components/features/lead-generation/${fileName}`;
    
    // Keep existing organization for shared, ui, layout
    if (filePath.includes('shared')) return filePath.replace('components/', 'src/components/');
    if (filePath.includes('ui')) return filePath.replace('components/', 'src/components/');
    if (filePath.includes('layout')) return filePath.replace('components/', 'src/components/');
    
    return filePath.replace('components/', 'src/components/');
  }

  private determineTestDestination(filePath: string): string {
    if (filePath.includes('e2e')) return `tests/e2e/${path.basename(filePath)}`;
    if (filePath.includes('integration')) return `tests/integration/${path.basename(filePath)}`;
    return `tests/unit/${path.basename(filePath)}`;
  }

  private determineScriptDestination(filePath: string): string {
    const fileName = path.basename(filePath);
    
    if (fileName.includes('build') || fileName.includes('bundle')) return `tools/scripts/build/${fileName}`;
    if (fileName.includes('deploy') || fileName.includes('production')) return `tools/scripts/deploy/${fileName}`;
    if (fileName.includes('test') || fileName.includes('validate')) return `tools/scripts/development/${fileName}`;
    if (fileName.includes('migrate') || fileName.includes('fix')) return `tools/scripts/maintenance/${fileName}`;
    
    return `tools/scripts/development/${fileName}`;
  }

  private determineDocumentationDestination(filePath: string): string {
    const fileName = path.basename(filePath);
    
    if (fileName.includes('SETUP') || fileName.includes('ENVIRONMENT')) return `docs/setup/${fileName}`;
    if (fileName.includes('API') || fileName.includes('ENDPOINT')) return `docs/api/${fileName}`;
    if (fileName.includes('DEPLOY') || fileName.includes('PRODUCTION')) return `docs/deployment/${fileName}`;
    if (fileName.includes('ARCHITECTURE') || fileName.includes('SYSTEM')) return `docs/architecture/${fileName}`;
    
    return `docs/${fileName}`;
  }

  private determineConfigDestination(filePath: string): string {
    const fileName = path.basename(filePath);
    
    if (fileName.includes('next.config')) return 'config/next.config.mjs';
    if (fileName.includes('tailwind.config')) return 'config/tailwind.config.mjs';
    if (fileName.includes('tsconfig')) return 'config/tsconfig.json';
    if (fileName.includes('eslint')) return 'config/eslint.config.js';
    
    return filePath;
  }

  private isCodeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext);
  }

  private async analyzeDependencies(filePath: string): Promise<DependencyInfo | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      
      return {
        file: filePath,
        imports,
        exports,
        dependencies: imports.filter(imp => imp.startsWith('./') || imp.startsWith('../'))
      };
    } catch (error) {
      console.warn(`Error analyzing dependencies for ${filePath}:`, error);
      return null;
    }
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  async generateReport(): Promise<string> {
    const structure = await this.scanCurrentStructure();
    
    let report = '# Project Structure Analysis Report\n\n';
    report += `## Summary\n`;
    report += `- Total Files: ${structure.totalFiles}\n`;
    report += `- Total Directories: ${structure.totalDirectories}\n`;
    report += `- Code Files: ${structure.dependencies.length}\n\n`;
    
    // Group files by purpose
    const filesByPurpose = structure.files.reduce((acc, file) => {
      if (!acc[file.purpose]) acc[file.purpose] = [];
      acc[file.purpose].push(file);
      return acc;
    }, {} as Record<string, FileInfo[]>);
    
    report += `## Files by Purpose\n`;
    for (const [purpose, files] of Object.entries(filesByPurpose)) {
      report += `### ${purpose} (${files.length} files)\n`;
      files.slice(0, 10).forEach(file => {
        report += `- ${file.path}${file.migrationDestination ? ` → ${file.migrationDestination}` : ''}\n`;
      });
      if (files.length > 10) {
        report += `- ... and ${files.length - 10} more\n`;
      }
      report += '\n';
    }
    
    return report;
  }
}