#!/usr/bin/env tsx

/**
 * Pre-deployment validation script
 * Runs comprehensive checks before production deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

class PreDeploymentValidator {
  private results: ValidationResult[] = [];

  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting pre-deployment validation...\n');

    await this.validateTypeScript();
    await this.validateESLint();
    await this.validateBuild();
    await this.validateEnvironmentVariables();
    await this.validateDependencies();
    await this.validateAssets();
    await this.validateConfiguration();

    this.printResults();
    this.exitIfCriticalFailures();
  }

  private async validateTypeScript(): Promise<void> {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.addResult('TypeScript Compilation', true, 'All TypeScript files compile successfully', true);
    } catch (error) {
      this.addResult('TypeScript Compilation', false, 'TypeScript compilation errors found', true);
    }
  }

  private async validateESLint(): Promise<void> {
    try {
      execSync('npx eslint . --ext .ts,.tsx,.js,.jsx', { stdio: 'pipe' });
      this.addResult('ESLint', true, 'No linting errors found', false);
    } catch (error) {
      this.addResult('ESLint', false, 'ESLint errors found - check and fix before deployment', false);
    }
  }

  private async validateBuild(): Promise<void> {
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.addResult('Build Process', true, 'Application builds successfully', true);
    } catch (error) {
      this.addResult('Build Process', false, 'Build process failed', true);
    }
  }

  private async validateEnvironmentVariables(): Promise<void> {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_API_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      this.addResult('Environment Variables', true, 'All required environment variables are set', true);
    } else {
      this.addResult('Environment Variables', false, `Missing: ${missingVars.join(', ')}`, true);
    }
  }

  private async validateDependencies(): Promise<void> {
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      this.addResult('Security Audit', true, 'No high-severity vulnerabilities found', false);
    } catch (error) {
      this.addResult('Security Audit', false, 'High-severity vulnerabilities found', false);
    }
  }

  private async validateAssets(): Promise<void> {
    const criticalAssets = [
      'public/favicon.ico',
      'public/robots.txt',
      'app/sitemap.ts'
    ];

    const missingAssets = criticalAssets.filter(asset => !existsSync(asset));
    
    if (missingAssets.length === 0) {
      this.addResult('Critical Assets', true, 'All critical assets are present', false);
    } else {
      this.addResult('Critical Assets', false, `Missing: ${missingAssets.join(', ')}`, false);
    }
  }

  private async validateConfiguration(): Promise<void> {
    const configFiles = [
      'next.config.mjs',
      'tailwind.config.mjs',
      'package.json'
    ];

    const missingConfigs = configFiles.filter(config => !existsSync(config));
    
    if (missingConfigs.length === 0) {
      this.addResult('Configuration Files', true, 'All configuration files are present', true);
    } else {
      this.addResult('Configuration Files', false, `Missing: ${missingConfigs.join(', ')}`, true);
    }
  }

  private addResult(name: string, passed: boolean, message: string, critical: boolean): void {
    this.results.push({ name, passed, message, critical });
  }

  private printResults(): void {
    console.log('\n📋 Validation Results:\n');
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const criticality = result.critical ? '[CRITICAL]' : '[WARNING]';
      const status = result.passed ? 'PASS' : 'FAIL';
      
      console.log(`${icon} ${result.name}: ${status}`);
      console.log(`   ${result.message}`);
      if (!result.passed && result.critical) {
        console.log(`   ${criticality} This must be fixed before deployment`);
      }
      console.log('');
    });
  }

  private exitIfCriticalFailures(): void {
    const criticalFailures = this.results.filter(r => !r.passed && r.critical);
    
    if (criticalFailures.length > 0) {
      console.log('❌ DEPLOYMENT BLOCKED: Critical validation failures detected');
      console.log('Please fix the critical issues above before proceeding with deployment.\n');
      process.exit(1);
    } else {
      console.log('✅ All critical validations passed! Ready for deployment.\n');
      
      const warnings = this.results.filter(r => !r.passed && !r.critical);
      if (warnings.length > 0) {
        console.log(`⚠️  ${warnings.length} warning(s) found. Consider fixing before deployment.\n`);
      }
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PreDeploymentValidator();
  validator.runAllValidations().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default PreDeploymentValidator;
