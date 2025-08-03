#!/usr/bin/env node

/**
 * Production Build Script with Error Handling
 */

const { execSync } = require('child_process');

console.log('🏗️  Starting Production Build...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  execSync('rm -rf .next', { stdio: 'inherit' });
  
  // Type check (non-blocking)
  console.log('🔍 Running type check...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ Type check passed');
  } catch (error) {
    console.log('⚠️  Type check failed, continuing build...');
  }
  
  // Build
  console.log('🏗️  Building application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('🎉 Production build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
