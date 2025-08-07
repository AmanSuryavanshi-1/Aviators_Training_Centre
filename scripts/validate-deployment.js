#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that the analytics dashboard is ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(message, type = 'success') {
    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'warning') {
      this.warnings.push(message);
    } else {
      this.passed.push(message);
    }
    
    this.log(message, type);
  }

  async validateBuild() {
    this.log('🔨 Validating production build...', 'info');
    
    try {
      // Check if build directory exists
      if (!fs.existsSync('.next')) {
        this.addResult('Build directory (.next) not found. Run "npm run build" first.', 'error');
        return;
      }

      // Check for build artifacts
      const buildManifest = path.join('.next', 'build-manifest.json');
      if (fs.existsSync(buildManifest)) {
        this.addResult('Build manifest found - build completed successfully', 'success');
      } else {
        this.addResult('Build manifest missing - build may be incomplete', 'error');
      }

      // Check for static files
      const staticDir = path.join('.next', 'static');
      if (fs.existsSync(staticDir)) {
        this.addResult('Static assets directory found', 'success');
      } else {
        this.addResult('Static assets directory missing', 'error');
      }

      // Check for server files
      const serverDir = path.join('.next', 'server');
      if (fs.existsSync(serverDir)) {
        this.addResult('Server directory found', 'success');
      } else {
        this.addResult('Server directory missing', 'error');
      }

    } catch (error) {
      this.addResult(`Build validation failed: ${error.message}`, 'error');
    }
  }

  async validateEnvironmentVariables() {
    this.log('🌍 Validating environment variables...', 'info');

    const requiredVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_API_TOKEN'
    ];

    const optionalVars = [
      'GA4_PROPERTY_ID',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'SEARCH_CONSOLE_SITE_URL',
      'NEXT_PUBLIC_BASE_URL'
    ];

    // Check required variables
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        this.addResult(`Required environment variable ${varName} is set`, 'success');
      } else {
        this.addResult(`Required environment variable ${varName} is missing`, 'error');
      }
    });

    // Check optional variables
    optionalVars.forEach(varName => {
      if (process.env[varName]) {
        this.addResult(`Optional environment variable ${varName} is set`, 'success');
      } else {
        this.addResult(`Optional environment variable ${varName} is not set - some features may not work`, 'warning');
      }
    });

    // Validate NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      this.addResult('NODE_ENV is set to production', 'success');
    } else {
      this.addResult(`NODE_ENV is set to ${process.env.NODE_ENV || 'undefined'} - should be 'production' for deployment`, 'warning');
    }
  }

  async validateDependencies() {
    this.log('📦 Validating dependencies...', 'info');

    try {
      // Check package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.dependencies) {
        this.addResult(`Found ${Object.keys(packageJson.dependencies).length} production dependencies`, 'success');
      }

      if (packageJson.devDependencies) {
        this.addResult(`Found ${Object.keys(packageJson.devDependencies).length} development dependencies`, 'success');
      }

      // Check for security vulnerabilities
      try {
        execSync('npm audit --audit-level=high --production', { stdio: 'pipe' });
        this.addResult('No high-severity security vulnerabilities found', 'success');
      } catch (error) {
        this.addResult('Security vulnerabilities detected - run "npm audit fix"', 'warning');
      }

      // Check for outdated packages
      try {
        const outdated = execSync('npm outdated --json', { stdio: 'pipe' }).toString();
        const outdatedPackages = JSON.parse(outdated || '{}');
        
        if (Object.keys(outdatedPackages).length === 0) {
          this.addResult('All packages are up to date', 'success');
        } else {
          this.addResult(`${Object.keys(outdatedPackages).length} packages are outdated`, 'warning');
        }
      } catch (error) {
        // npm outdated returns exit code 1 when packages are outdated
        this.addResult('Some packages may be outdated', 'warning');
      }

    } catch (error) {
      this.addResult(`Dependency validation failed: ${error.message}`, 'error');
    }
  }

  async validateFiles() {
    this.log('📁 Validating critical files...', 'info');

    const criticalFiles = [
      'src/app/analytics/page.tsx',
      'src/components/analytics/EnhancedAnalyticsDashboard.tsx',
      'src/lib/analytics/googleAnalytics4.ts',
      'src/lib/analytics/googleSearchConsole.ts',
      'src/lib/analytics/dailyAggregation.ts',
      'src/lib/auth/studioAdminAuth.ts'
    ];

    const optionalFiles = [
      'src/components/analytics/ActionableInsights.tsx',
      'src/components/analytics/RealTimeAnalytics.tsx',
      'src/components/analytics/AdvancedFilters.tsx',
      'src/components/analytics/AnalyticsCharts.tsx'
    ];

    // Check critical files
    criticalFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.addResult(`Critical file ${filePath} exists`, 'success');
      } else {
        this.addResult(`Critical file ${filePath} is missing`, 'error');
      }
    });

    // Check optional files
    optionalFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.addResult(`Optional file ${filePath} exists`, 'success');
      } else {
        this.addResult(`Optional file ${filePath} is missing - some features may not work`, 'warning');
      }
    });

    // Check for unused files
    const unusedFiles = [
      'src/components/analytics/unused-component.tsx',
      'src/lib/analytics/old-service.ts'
    ];

    unusedFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.addResult(`Unused file ${filePath} should be removed`, 'warning');
      }
    });
  }

  async validateAPIEndpoints() {
    this.log('🔌 Validating API endpoints...', 'info');

    const endpoints = [
      '/api/analytics/dashboard',
      '/api/analytics/export',
      '/api/analytics/realtime',
      '/api/analytics/production-readiness'
    ];

    // Check if API route files exist
    endpoints.forEach(endpoint => {
      const routePath = `src/app${endpoint}/route.ts`;
      if (fs.existsSync(routePath)) {
        this.addResult(`API endpoint ${endpoint} file exists`, 'success');
      } else {
        this.addResult(`API endpoint ${endpoint} file is missing`, 'error');
      }
    });
  }

  async validateConfiguration() {
    this.log('⚙️ Validating configuration files...', 'info');

    const configFiles = [
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'package.json'
    ];

    configFiles.forEach(configFile => {
      if (fs.existsSync(configFile)) {
        this.addResult(`Configuration file ${configFile} exists`, 'success');
        
        // Validate specific configurations
        if (configFile === 'next.config.js') {
          try {
            const config = require(path.resolve(configFile));
            if (config.experimental?.serverComponentsExternalPackages) {
              this.addResult('Next.js server components configuration found', 'success');
            }
          } catch (error) {
            this.addResult(`Error reading ${configFile}: ${error.message}`, 'warning');
          }
        }
      } else {
        this.addResult(`Configuration file ${configFile} is missing`, 'error');
      }
    });

    // Check TypeScript configuration
    if (fs.existsSync('tsconfig.json')) {
      try {
        const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        if (tsConfig.compilerOptions?.strict) {
          this.addResult('TypeScript strict mode is enabled', 'success');
        } else {
          this.addResult('TypeScript strict mode is disabled - consider enabling for better type safety', 'warning');
        }
      } catch (error) {
        this.addResult(`Error reading tsconfig.json: ${error.message}`, 'warning');
      }
    }
  }

  async validateSecurity() {
    this.log('🔒 Validating security configurations...', 'info');

    // Check for sensitive files that shouldn't be in production
    const sensitiveFiles = [
      '.env.local',
      '.env.development',
      'credentials.json',
      'service-account.json'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.addResult(`Sensitive file ${file} found - ensure it's not deployed to production`, 'warning');
      }
    });

    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const requiredIgnores = ['.env.local', '.env.*.local', 'node_modules'];
      
      requiredIgnores.forEach(pattern => {
        if (gitignore.includes(pattern)) {
          this.addResult(`Gitignore includes ${pattern}`, 'success');
        } else {
          this.addResult(`Gitignore missing ${pattern} - sensitive files may be committed`, 'warning');
        }
      });
    } else {
      this.addResult('.gitignore file is missing', 'warning');
    }

    // Check for HTTPS in production URLs
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      if (process.env.NEXT_PUBLIC_BASE_URL.startsWith('https://')) {
        this.addResult('Base URL uses HTTPS', 'success');
      } else {
        this.addResult('Base URL should use HTTPS in production', 'warning');
      }
    }
  }

  async validateTests() {
    this.log('🧪 Validating test coverage...', 'info');

    const testDirs = [
      'src/components/analytics/__tests__',
      'src/app/api/analytics/__tests__',
      'src/__tests__/integration',
      'tests/e2e'
    ];

    testDirs.forEach(testDir => {
      if (fs.existsSync(testDir)) {
        const testFiles = fs.readdirSync(testDir).filter(file => 
          file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.spec.ts')
        );
        
        if (testFiles.length > 0) {
          this.addResult(`Found ${testFiles.length} test files in ${testDir}`, 'success');
        } else {
          this.addResult(`No test files found in ${testDir}`, 'warning');
        }
      } else {
        this.addResult(`Test directory ${testDir} not found`, 'warning');
      }
    });

    // Check for test scripts in package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts?.test) {
        this.addResult('Test script found in package.json', 'success');
      } else {
        this.addResult('No test script found in package.json', 'warning');
      }
    } catch (error) {
      this.addResult(`Error reading package.json: ${error.message}`, 'error');
    }
  }

  async cleanup() {
    this.log('🧹 Running cleanup tasks...', 'info');

    const cleanupTasks = [
      {
        name: 'Remove development files',
        action: () => {
          const devFiles = [
            'src/components/analytics/unused-component.tsx',
            'src/lib/analytics/old-service.ts',
            'temp-file.js'
          ];
          
          let removed = 0;
          devFiles.forEach(file => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
              removed++;
            }
          });
          
          return removed > 0 ? `Removed ${removed} unused files` : 'No unused files to remove';
        }
      },
      {
        name: 'Clean build cache',
        action: () => {
          try {
            if (fs.existsSync('.next/cache')) {
              execSync('rm -rf .next/cache', { stdio: 'pipe' });
              return 'Build cache cleared';
            }
            return 'No build cache to clear';
          } catch (error) {
            return `Failed to clear build cache: ${error.message}`;
          }
        }
      },
      {
        name: 'Optimize bundle size',
        action: () => {
          try {
            // Check bundle size
            const buildManifest = path.join('.next', 'build-manifest.json');
            if (fs.existsSync(buildManifest)) {
              const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
              const pageCount = Object.keys(manifest.pages || {}).length;
              return `Bundle contains ${pageCount} pages`;
            }
            return 'Bundle analysis not available';
          } catch (error) {
            return `Bundle analysis failed: ${error.message}`;
          }
        }
      }
    ];

    for (const task of cleanupTasks) {
      try {
        const result = task.action();
        this.addResult(`${task.name}: ${result}`, 'success');
      } catch (error) {
        this.addResult(`${task.name} failed: ${error.message}`, 'warning');
      }
    }
  }

  generateReport() {
    this.log('\n📊 Deployment Validation Report', 'info');
    this.log('='.repeat(50), 'info');
    
    const total = this.passed.length + this.warnings.length + this.errors.length;
    const score = Math.round((this.passed.length / total) * 100);
    
    console.log(`\n📈 Overall Score: ${score}%`);
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues (Must Fix):');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (Should Fix):');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n🚀 Deployment Recommendation:');
    if (this.errors.length === 0) {
      if (this.warnings.length === 0) {
        console.log('   ✅ READY FOR DEPLOYMENT - All checks passed!');
      } else {
        console.log('   ⚠️  DEPLOY WITH CAUTION - Address warnings for optimal performance');
      }
    } else {
      console.log('   ❌ NOT READY FOR DEPLOYMENT - Fix critical issues first');
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      score,
      total,
      passed: this.passed.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      details: {
        passed: this.passed,
        warnings: this.warnings,
        errors: this.errors
      }
    };
    
    fs.writeFileSync('deployment-validation-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: deployment-validation-report.json');
    
    return this.errors.length === 0;
  }

  async run() {
    this.log('🚀 Starting deployment validation...', 'info');
    
    await this.validateBuild();
    await this.validateEnvironmentVariables();
    await this.validateDependencies();
    await this.validateFiles();
    await this.validateAPIEndpoints();
    await this.validateConfiguration();
    await this.validateSecurity();
    await this.validateTests();
    await this.cleanup();
    
    const isReady = this.generateReport();
    
    process.exit(isReady ? 0 : 1);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentValidator;