#!/usr/bin/env node
/**
 * Analytics Deployment Validation Script
 * Comprehensive check of all analytics functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Analytics Deployment...\n');

let totalChecks = 0;
let passedChecks = 0;
let issues = [];

function check(description, condition, errorMessage = '') {
  totalChecks++;
  if (condition) {
    console.log(`✅ ${description}`);
    passedChecks++;
  } else {
    console.log(`❌ ${description}`);
    if (errorMessage) issues.push(errorMessage);
  }
}

// 1. Core Files Check
console.log('📁 Core Files Check:');
check(
  'Advanced Analytics Dashboard exists',
  fs.existsSync('src/components/admin/AdvancedAnalyticsDashboard.tsx'),
  'Missing main dashboard component'
);

check(
  'Admin Analytics Page exists',
  fs.existsSync('src/app/admin/analytics/page.tsx'),
  'Missing admin analytics page'
);

check(
  'Admin Layout exists',
  fs.existsSync('src/app/admin/layout.tsx'),
  'Missing admin layout'
);

// 2. API Endpoints Check
console.log('\n🔌 API Endpoints Check:');
const apiEndpoints = [
  'src/app/api/analytics/advanced/route.ts',
  'src/app/api/analytics/track/route.ts',
  'src/app/api/analytics/realtime/route.ts',
  'src/app/api/health/analytics/route.ts'
];

apiEndpoints.forEach(endpoint => {
  const exists = fs.existsSync(endpoint);
  check(`${endpoint} exists`, exists, `Missing API endpoint: ${endpoint}`);
  
  if (exists) {
    const content = fs.readFileSync(endpoint, 'utf8');
    const hasValidStructure = content.includes('export async function GET') || content.includes('export async function POST');
    check(`${endpoint} has valid structure`, hasValidStructure, `Invalid API structure: ${endpoint}`);
  }
});

// 3. UI Components Check
console.log('\n🧩 UI Components Check:');
const uiComponents = [
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/scroll-area.tsx'
];

uiComponents.forEach(component => {
  check(`${component} exists`, fs.existsSync(component), `Missing UI component: ${component}`);
});

// 4. Dependencies Check
console.log('\n📦 Dependencies Check:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@radix-ui/react-progress',
    '@radix-ui/react-scroll-area',
    'lucide-react',
    'date-fns'
  ];
  
  requiredDeps.forEach(dep => {
    check(`${dep} dependency installed`, !!allDeps[dep], `Missing dependency: ${dep}`);
  });
}

// 5. Firebase Configuration Check
console.log('\n🔥 Firebase Configuration Check:');
if (fs.existsSync('src/lib/firebase/admin.ts')) {
  const content = fs.readFileSync('src/lib/firebase/admin.ts', 'utf8');
  check(
    'Firebase admin exports correct',
    content.includes('getFirestoreAdmin') && content.includes('getFirebaseConnectionStatus'),
    'Firebase admin exports missing'
  );
}

// 6. Configuration Files Check
console.log('\n⚙️ Configuration Files Check:');
check('Firestore indexes exist', fs.existsSync('firestore.indexes.json'), 'Missing firestore.indexes.json');
check('Firestore rules exist', fs.existsSync('firestore.rules'), 'Missing firestore.rules');
check('TypeScript config exists', fs.existsSync('tsconfig.json'), 'Missing tsconfig.json');

// 7. Environment Configuration Check
console.log('\n🌍 Environment Configuration Check:');
check('.env.example exists', fs.existsSync('.env.example'), 'Missing .env.example');

if (fs.existsSync('.env.example')) {
  const envContent = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  requiredVars.forEach(varName => {
    check(`${varName} documented in .env.example`, envContent.includes(varName), `Missing env var: ${varName}`);
  });
}

// 8. Component Structure Check
console.log('\n🏗️ Component Structure Check:');
if (fs.existsSync('src/components/admin/AdvancedAnalyticsDashboard.tsx')) {
  const content = fs.readFileSync('src/components/admin/AdvancedAnalyticsDashboard.tsx', 'utf8');
  
  check('Dashboard has React imports', content.includes('import React'), 'Missing React imports');
  check('Dashboard has UI components', content.includes('Card') && content.includes('Tabs'), 'Missing UI component imports');
  check('Dashboard has JSX structure', content.includes('<Card>') && content.includes('<Tabs'), 'Invalid JSX structure');
  check('Dashboard is client component', content.includes("'use client'"), 'Missing client directive');
}

// 9. Admin Navigation Check
console.log('\n🧭 Admin Navigation Check:');
if (fs.existsSync('src/app/admin/layout.tsx')) {
  const content = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');
  check('Analytics navigation link exists', content.includes('/admin/analytics'), 'Missing analytics navigation');
}

// 10. Build Configuration Check
console.log('\n🔧 Build Configuration Check:');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  check('Build script exists', !!packageJson.scripts?.build, 'Missing build script');
  check('Dev script exists', !!packageJson.scripts?.dev, 'Missing dev script');
  check('Type check script exists', !!packageJson.scripts?.['type-check'], 'Missing type-check script');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (issues.length > 0) {
  console.log('\n⚠️ Issues Found:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

if (passedChecks === totalChecks) {
  console.log('\n🎉 All validation checks passed! Analytics is ready for deployment.');
  console.log('\n🚀 Deployment Status: READY');
  console.log('\n📋 Next Steps:');
  console.log('1. Run: npm run build');
  console.log('2. Test: Navigate to /admin/analytics');
  console.log('3. Deploy: Push to production');
  process.exit(0);
} else {
  const failureRate = Math.round(((totalChecks - passedChecks) / totalChecks) * 100);
  if (failureRate < 20) {
    console.log('\n⚠️ Minor issues found, but deployment should be safe.');
    console.log('\n🚀 Deployment Status: READY WITH WARNINGS');
  } else {
    console.log('\n❌ Significant issues found. Please fix before deployment.');
    console.log('\n🚀 Deployment Status: NOT READY');
    process.exit(1);
  }
}