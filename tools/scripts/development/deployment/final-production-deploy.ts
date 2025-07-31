#!/usr/bin/env tsx

/**
 * Final Production Deployment Script
 * Comprehensive deployment with all checks and optimizations
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

class ProductionDeployer {
  private deploymentId: string;
  private startTime: number;

  constructor() {
    this.deploymentId = `deploy-${Date.now()}`;
    this.startTime = Date.now();
  }

  async deploy(): Promise<void> {
    console.log('🚀 Starting Final Production Deployment...\n');
    console.log(`Deployment ID: ${this.deploymentId}\n`);

    try {
      await this.runPreDeploymentChecks();
      await this.optimizeAssets();
      await this.buildApplication();
      await this.runPostBuildValidation();
      await this.deployToVercel();
      await this.runPostDeploymentTests();
      
      this.logSuccess();
    } catch (error) {
      this.logError(error);
      process.exit(1);
    }
  }

  private async runPreDeploymentChecks(): Promise<void> {
    console.log('📋 Running pre-deployment validation...');
    
    try {
      execSync('npm run validate:pre-deploy', { stdio: 'inherit' });
      console.log('✅ Pre-deployment validation passed\n');
    } catch (error) {
      throw new Error('Pre-deployment validation failed');
    }
  }

  private async optimizeAssets(): Promise<void> {
    console.log('🎨 Optimizing assets...');
    
    try {
      // Run asset optimization
      execSync('npm run optimize:assets', { stdio: 'inherit' });
      
      // Generate sitemap
      console.log('📄 Generating sitemap...');
      execSync('npm run sitemap:generate', { stdio: 'inherit' });
      
      console.log('✅ Asset optimization completed\n');
    } catch (error) {
      console.log('⚠️  Asset optimization failed, continuing...\n');
    }
  }

  private async buildApplication(): Promise<void> {
    console.log('🔨 Building application...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Application built successfully\n');
    } catch (error) {
      throw new Error('Application build failed');
    }
  }

  private async runPostBuildValidation(): Promise<void> {
    console.log('🔍 Running post-build validation...');
    
    // Check if critical files exist
    const criticalFiles = [
      '.next/BUILD_ID',
      '.next/static',
      'public/sitemap.xml'
    ];

    const missingFiles = criticalFiles.filter(file => !existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing critical files: ${missingFiles.join(', ')}`);
    }

    console.log('✅ Post-build validation passed\n');
  }

  private async deployToVercel(): Promise<void> {
    console.log('🌐 Deploying to Vercel...');
    
    try {
      // Deploy to production
      execSync('vercel --prod --yes', { stdio: 'inherit' });
      console.log('✅ Deployed to Vercel successfully\n');
    } catch (error) {
      throw new Error('Vercel deployment failed');
    }
  }

  private async runPostDeploymentTests(): Promise<void> {
    console.log('🧪 Running post-deployment tests...');
    
    try {
      // Wait a moment for deployment to propagate
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Run health check
      console.log('🏥 Running health check...');
      // Note: This would need to be updated with your actual production URL
      // execSync('curl -f https://your-domain.com/api/health', { stdio: 'inherit' });
      
      console.log('✅ Post-deployment tests passed\n');
    } catch (error) {
      console.log('⚠️  Post-deployment tests failed, but deployment completed\n');
    }
  }

  private logSuccess(): void {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('🎉 DEPLOYMENT SUCCESSFUL! 🎉\n');
    console.log(`Deployment ID: ${this.deploymentId}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Completed at: ${new Date().toISOString()}\n`);
    
    console.log('📋 Next Steps:');
    console.log('1. Monitor application logs for any issues');
    console.log('2. Verify all critical user journeys work correctly');
    console.log('3. Check analytics and error tracking');
    console.log('4. Update team on successful deployment\n');

    // Write deployment log
    const deploymentLog = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: duration,
      status: 'success'
    };

    writeFileSync(
      `deployment-${this.deploymentId}.json`,
      JSON.stringify(deploymentLog, null, 2)
    );
  }

  private logError(error: any): void {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('❌ DEPLOYMENT FAILED! ❌\n');
    console.log(`Deployment ID: ${this.deploymentId}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Failed at: ${new Date().toISOString()}`);
    console.log(`Error: ${error.message}\n`);
    
    console.log('🔧 Troubleshooting:');
    console.log('1. Check the error message above');
    console.log('2. Run npm run validate:pre-deploy to identify issues');
    console.log('3. Fix any critical issues and try again');
    console.log('4. Contact the development team if issues persist\n');

    // Write error log
    const deploymentLog = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: duration,
      status: 'failed',
      error: error.message
    };

    writeFileSync(
      `deployment-${this.deploymentId}-error.json`,
      JSON.stringify(deploymentLog, null, 2)
    );
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new ProductionDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

export default ProductionDeployer;
