#!/usr/bin/env node
/**
 * Production-Ready Deployment Script
 * Industry standard deployment with proper error handling
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Production Deployment...');
console.log('📋 Industry Standard Deployment Process');
console.log('');

// Step 1: Validate Environment
console.log('🔍 Step 1: Validating Environment...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}
console.log('✅ Environment validation passed');

// Step 2: Clean Build
console.log('🧹 Step 2: Cleaning previous build...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  console.log('✅ Clean completed');
} catch (error) {
  console.error('❌ Clean failed:', error.message);
  process.exit(1);
}

// Step 3: Type Check
console.log('🔍 Step 3: Running TypeScript validation...');
const typeCheck = spawn('npm', ['run', 'type-check'], { stdio: 'inherit', shell: true });
typeCheck.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ TypeScript validation failed');
    process.exit(1);
  }
  
  console.log('✅ TypeScript validation passed');
  
  // Step 4: Production Build
  console.log('🏗️  Step 4: Building for production...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  
  build.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('❌ Production build failed');
      process.exit(1);
    }
    
    console.log('✅ Production build completed successfully');
    console.log('');
    console.log('🎉 Deployment Ready!');
    console.log('📋 Next Steps:');
    console.log('   1. Deploy to Vercel: vercel --prod');
    console.log('   2. Test production: npm run start');
    console.log('   3. Validate deployment: npm run production:validate');
    console.log('');
    console.log('🌐 Production URLs:');
    console.log('   - Website: https://your-domain.com');
    console.log('   - Studio: https://your-domain.com/studio');
    console.log('   - Admin: https://your-domain.com/studio/admin');
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Deployment cancelled by user');
  process.exit(0);
});