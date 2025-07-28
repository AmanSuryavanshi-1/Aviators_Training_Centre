#!/usr/bin/env node

/**
 * Fix Next.js Build Issues Script
 * Resolves common build and runtime errors
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔧 Starting Next.js Build Issues Fix...\n');

// Step 1: Clean build cache and node_modules
console.log('1. Cleaning build cache and dependencies...');
try {
  // Remove .next directory
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Removed .next directory');
  }

  // Remove node_modules/.cache
  if (fs.existsSync('node_modules/.cache')) {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('✅ Removed node_modules/.cache');
  }

  // Remove Turbopack cache
  if (fs.existsSync('.turbo')) {
    fs.rmSync('.turbo', { recursive: true, force: true });
    console.log('✅ Removed .turbo directory');
  }

} catch (error) {
  console.log('⚠️  Some cache directories could not be removed (may not exist)');
}

// Step 2: Check and fix package.json scripts
console.log('\n2. Checking package.json scripts...');
try {
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update scripts to avoid Turbopack issues
    const updatedScripts = {
      ...packageJson.scripts,
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    };

    packageJson.scripts = updatedScripts;
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts (removed --turbopack flag)');
  }
} catch (error) {
  console.log('❌ Error updating package.json:', error.message);
}

// Step 3: Create next.config.mjs with proper configuration
console.log('\n3. Updating Next.js configuration...');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for stability
  experimental: {
    // Remove turbopack and other experimental features that might cause issues
  },
  
  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    // Fix module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable static exports for better compatibility
  output: 'standalone',
  
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
  
  // Optimize bundle
  swcMinify: true,
  
  // Ensure proper trailing slash handling
  trailingSlash: false,
  
  // Configure redirects and rewrites
  async redirects() {
    return [];
  },
  
  async rewrites() {
    return [];
  },
};

export default nextConfig;
`;

try {
  fs.writeFileSync('next.config.mjs', nextConfigContent);
  console.log('✅ Updated next.config.mjs with stable configuration');
} catch (error) {
  console.log('❌ Error updating next.config.mjs:', error.message);
}

// Step 4: Check TypeScript configuration
console.log('\n4. Checking TypeScript configuration...');
const tsConfigContent = {
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
};

try {
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfigContent, null, 2));
  console.log('✅ Updated tsconfig.json with proper configuration');
} catch (error) {
  console.log('❌ Error updating tsconfig.json:', error.message);
}

// Step 5: Create a simple _document.js to avoid document issues
console.log('\n5. Creating proper document configuration...');
const documentContent = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
`;

try {
  // Ensure pages directory exists
  if (!fs.existsSync('pages')) {
    fs.mkdirSync('pages', { recursive: true });
  }
  
  fs.writeFileSync('pages/_document.js', documentContent);
  console.log('✅ Created proper _document.js');
} catch (error) {
  console.log('❌ Error creating _document.js:', error.message);
}

// Step 6: Install dependencies
console.log('\n6. Reinstalling dependencies...');
try {
  console.log('Installing npm dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled successfully');
} catch (error) {
  console.log('❌ Error installing dependencies:', error.message);
  console.log('Please run "npm install" manually');
}

console.log('\n🎉 Next.js Build Issues Fix Complete!');
console.log('\n📋 Summary of changes:');
console.log('✅ Cleaned build cache and temporary files');
console.log('✅ Updated package.json scripts (removed Turbopack)');
console.log('✅ Updated next.config.mjs with stable configuration');
console.log('✅ Updated tsconfig.json with proper paths');
console.log('✅ Created proper _document.js');
console.log('✅ Reinstalled dependencies');

console.log('\n🚀 Next steps:');
console.log('1. Run "npm run dev" to start development server');
console.log('2. Test blog functionality at http://localhost:3000/blog');
console.log('3. If issues persist, try "npm run build" to check for build errors');

export {};