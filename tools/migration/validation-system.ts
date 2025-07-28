import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  duration: number;
}

interface ValidationReport {
  timestamp: Date;
  totalValidations: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
  overallSuccess: boolean;
}

export class ValidationSystem {
  private results: ValidationResult[] = [];

  async runAllValidations(): Promise<ValidationReport> {
    console.log('🔍 Starting comprehensive validation...\n');

    const validations = [
      this.validateTypeScriptCompilation,
      this.validateImportResolution,
      this.validateNextJsBuild,
      this.validateTestSuites,
      this.validateDirectoryStructure,
      this.validateConfigurationFiles,
      this.validatePackageJsonScripts
    ];

    for (const validation of validations) {
      const startTime = Date.now();
      try {
        const result = await validation.call(this);
        const duration = Date.now() - startTime;
        this.results.push({ ...result, duration });
        
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}: ${result.message} (${duration}ms)`);
        
        if (result.details && !result.success) {
          console.log(`   Details: ${result.details}`);
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        this.results.push({
          name: validation.name,
          success: false,
          message: `Validation failed with error: ${error}`,
          duration
        });
        console.log(`❌ ${validation.name}: Failed with error (${duration}ms)`);
      }
    }

    const report = this.generateReport();
    console.log(`\n📊 Validation Summary: ${report.passed}/${report.totalValidations} passed`);
    
    return report;
  }

  private async validateTypeScriptCompilation(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit');
      
      if (stderr && stderr.includes('error')) {
        return {
          name: 'TypeScript Compilation',
          success: false,
          message: 'TypeScript compilation failed',
          details: stderr,
          duration: 0
        };
      }

      return {
        name: 'TypeScript Compilation',
        success: true,
        message: 'All TypeScript files compile successfully',
        duration: 0
      };
    } catch (error: any) {
      return {
        name: 'TypeScript Compilation',
        success: false,
        message: 'TypeScript compilation failed',
        details: error.message,
        duration: 0
      };
    }
  }

  private async validateImportResolution(): Promise<ValidationResult> {
    const issues: string[] = [];
    
    try {
      // Check if all source files exist and imports resolve
      const srcFiles = await this.getAllSourceFiles('src');
      
      for (const file of srcFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const imports = this.extractImports(content);
        
        for (const importPath of imports) {
          if (importPath.startsWith('@/')) {
            const resolvedPath = importPath.replace('@/', 'src/');
            const fullPath = path.resolve(resolvedPath);
            
            try {
              await fs.access(fullPath);
            } catch {
              // Try with extensions
              const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
              let found = false;
              
              for (const ext of extensions) {
                try {
                  await fs.access(fullPath + ext);
                  found = true;
                  break;
                } catch {
                  continue;
                }
              }
              
              if (!found) {
                issues.push(`${file}: Cannot resolve import "${importPath}"`);
              }
            }
          }
        }
      }

      if (issues.length > 0) {
        return {
          name: 'Import Resolution',
          success: false,
          message: `Found ${issues.length} import resolution issues`,
          details: issues.slice(0, 10).join('\n'),
          duration: 0
        };
      }

      return {
        name: 'Import Resolution',
        success: true,
        message: 'All imports resolve correctly',
        duration: 0
      };
    } catch (error: any) {
      return {
        name: 'Import Resolution',
        success: false,
        message: 'Import resolution validation failed',
        details: error.message,
        duration: 0
      };
    }
  }

  private async validateNextJsBuild(): Promise<ValidationResult> {
    try {
      const { stdout, stderr } = await execAsync('npm run build', { timeout: 120000 });
      
      if (stderr && stderr.includes('Failed to compile')) {
        return {
          name: 'Next.js Build',
          success: false,
          message: 'Next.js build failed',
          details: stderr,
          duration: 0
        };
      }

      return {
        name: 'Next.js Build',
        success: true,
        message: 'Next.js build completed successfully',
        duration: 0
      };
    } catch (error: any) {
      return {
        name: 'Next.js Build',
        success: false,
        message: 'Next.js build failed',
        details: error.message,
        duration: 0
      };
    }
  }

  private async validateTestSuites(): Promise<ValidationResult> {
    try {
      // Check if test files exist and are properly organized
      const testDirs = ['tests/unit', 'tests/integration', 'tests/e2e'];
      const issues: string[] = [];
      
      for (const dir of testDirs) {
        try {
          await fs.access(dir);
          const files = await fs.readdir(dir);
          if (files.length === 0) {
            issues.push(`${dir} directory is empty`);
          }
        } catch {
          issues.push(`${dir} directory does not exist`);
        }
      }

      if (issues.length > 0) {
        return {
          name: 'Test Suites',
          success: false,
          message: 'Test suite organization issues found',
          details: issues.join('\n'),
          duration: 0
        };
      }

      return {
        name: 'Test Suites',
        success: true,
        message: 'Test suites are properly organized',
        duration: 0
      };
    } catch (error: any) {
      return {
        name: 'Test Suites',
        success: false,
        message: 'Test suite validation failed',
        details: error.message,
        duration: 0
      };
    }
  }

  private async validateDirectoryStructure(): Promise<ValidationResult> {
    const requiredDirs = [
      'src',
      'src/app',
      'src/components',
      'src/components/features',
      'src/lib',
      'src/hooks',
      'src/types',
      'docs',
      'tools',
      'tests',
      'config'
    ];

    const missing: string[] = [];
    
    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
      } catch {
        missing.push(dir);
      }
    }

    if (missing.length > 0) {
      return {
        name: 'Directory Structure',
        success: false,
        message: `Missing required directories: ${missing.join(', ')}`,
        duration: 0
      };
    }

    return {
      name: 'Directory Structure',
      success: true,
      message: 'All required directories exist',
      duration: 0
    };
  }

  private async validateConfigurationFiles(): Promise<ValidationResult> {
    const requiredConfigs = [
      'config/next.config.mjs',
      'config/tailwind.config.mjs',
      'config/tsconfig.json',
      'config/eslint.config.js',
      'tsconfig.json',
      'package.json'
    ];

    const missing: string[] = [];
    
    for (const config of requiredConfigs) {
      try {
        await fs.access(config);
      } catch {
        missing.push(config);
      }
    }

    if (missing.length > 0) {
      return {
        name: 'Configuration Files',
        success: false,
        message: `Missing configuration files: ${missing.join(', ')}`,
        duration: 0
      };
    }

    return {
      name: 'Configuration Files',
      success: true,
      message: 'All configuration files exist',
      duration: 0
    };
  }

  private async validatePackageJsonScripts(): Promise<ValidationResult> {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      const issues: string[] = [];
      
      // Check for scripts that reference old paths
      for (const [name, script] of Object.entries(scripts)) {
        const scriptStr = script as string;
        
        if (scriptStr.includes('scripts/') && !scriptStr.includes('tools/scripts/')) {
          issues.push(`Script "${name}" still references old scripts/ path`);
        }
      }

      if (issues.length > 0) {
        return {
          name: 'Package.json Scripts',
          success: false,
          message: 'Found scripts with outdated paths',
          details: issues.join('\n'),
          duration: 0
        };
      }

      return {
        name: 'Package.json Scripts',
        success: true,
        message: 'All scripts reference correct paths',
        duration: 0
      };
    } catch (error: any) {
      return {
        name: 'Package.json Scripts',
        success: false,
        message: 'Failed to validate package.json scripts',
        details: error.message,
        duration: 0
      };
    }
  }

  private async getAllSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private generateReport(): ValidationReport {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.length - passed;
    
    return {
      timestamp: new Date(),
      totalValidations: this.results.length,
      passed,
      failed,
      results: this.results,
      overallSuccess: failed === 0
    };
  }

  async saveReport(report: ValidationReport): Promise<void> {
    const reportPath = 'tools/migration/validation-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Validation report saved to: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const validator = new ValidationSystem();
  validator.runAllValidations()
    .then(report => {
      validator.saveReport(report);
      process.exit(report.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}