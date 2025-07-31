#!/usr/bin/env node

/**
 * Final Production Fix Script
 * Applies all remaining fixes for production deployment
 */

import fs from 'fs';
import path from 'path';

class FinalProductionFixer {
  async applyAllFixes(): Promise<void> {
    console.log('🔧 Applying final production fixes...\n');

    await this.addSecurityHeaders();
    await this.createErrorPage();
    await this.addBundleAnalyzer();
    await this.optimizePerformance();
    await this.validateConfiguration();

    console.log('✅ All production fixes applied successfully!\n');
  }

  private async addSecurityHeaders(): Promise<void> {
    console.log('🔒 Adding security headers...');

    const nextConfigPath = 'next.config.mjs';
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Check if headers are already configured
      if (!content.includes('headers()')) {
        // Add security headers
        const headersConfig = `
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },`;

        // Insert headers config before the closing brace
        content = content.replace(/}\s*$/, `${headersConfig}\n}`);
        fs.writeFileSync(nextConfigPath, content);
        console.log('  ✅ Security headers added to next.config.mjs');
      } else {
        console.log('  ✅ Security headers already configured');
      }
    }
  }

  private async createErrorPage(): Promise<void> {
    console.log('🚨 Creating error page...');

    const errorPagePath = 'app/error.tsx';
    if (!fs.existsSync(errorPagePath)) {
      const errorPageContent = `'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. An error occurred while processing your request.
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Homepage
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}`;

      fs.writeFileSync(errorPagePath, errorPageContent);
      console.log('  ✅ Error page created');
    } else {
      console.log('  ✅ Error page already exists');
    }
  }

  private async addBundleAnalyzer(): Promise<void> {
    console.log('📊 Adding bundle analyzer...');

    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts.analyze) {
        packageJson.scripts.analyze = 'ANALYZE=true npm run build';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('  ✅ Bundle analyzer script added');
      } else {
        console.log('  ✅ Bundle analyzer already configured');
      }
    }
  }

  private async optimizePerformance(): Promise<void> {
    console.log('⚡ Optimizing performance...');

    // Create performance optimization config
    const performanceConfigPath = 'lib/config/performance.ts';
    const performanceDir = path.dirname(performanceConfigPath);
    
    if (!fs.existsSync(performanceDir)) {
      fs.mkdirSync(performanceDir, { recursive: true });
    }

    if (!fs.existsSync(performanceConfigPath)) {
      const performanceConfig = `/**
 * Performance optimization configuration
 */

export const PERFORMANCE_CONFIG = {
  // Cache settings
  CACHE_TTL: {
    BLOG_POSTS: 5 * 60 * 1000, // 5 minutes
    STATIC_CONTENT: 24 * 60 * 60 * 1000, // 24 hours
    API_RESPONSES: 2 * 60 * 1000, // 2 minutes
  },

  // Image optimization
  IMAGE_QUALITY: 85,
  IMAGE_FORMATS: ['webp', 'avif'],

  // Bundle optimization
  CHUNK_SIZE_LIMIT: 244 * 1024, // 244KB

  // API rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // Database query optimization
  QUERY_TIMEOUT: 10000, // 10 seconds
  MAX_QUERY_RESULTS: 50,
} as const;

export type PerformanceConfig = typeof PERFORMANCE_CONFIG;`;

      fs.writeFileSync(performanceConfigPath, performanceConfig);
      console.log('  ✅ Performance configuration created');
    } else {
      console.log('  ✅ Performance configuration already exists');
    }
  }

  private async validateConfiguration(): Promise<void> {
    console.log('✅ Validating final configuration...');

    const validations = [
      {
        name: 'Environment Variables',
        check: () => {
          const requiredVars = [
            'NEXT_PUBLIC_SANITY_PROJECT_ID',
            'NEXT_PUBLIC_SANITY_DATASET',
            'SANITY_API_TOKEN',
            'NEXT_PUBLIC_SITE_URL'
          ];
          
          const envContent = fs.readFileSync('.env.local', 'utf8');
          return requiredVars.every(varName => envContent.includes(varName));
        }
      },
      {
        name: 'Critical Files',
        check: () => {
          const criticalFiles = [
            'app/layout.tsx',
            'app/page.tsx',
            'app/blog/page.tsx',
            'app/blog/[id]/page.tsx',
            'lib/sanity/client.ts'
          ];
          return criticalFiles.every(file => fs.existsSync(file));
        }
      },
      {
        name: 'API Routes',
        check: () => {
          const apiRoutes = [
            'app/api/blog/posts/route.ts',
            'app/api/blog/posts/[slug]/route.ts',
            'app/api/contact/route.ts'
          ];
          return apiRoutes.every(route => fs.existsSync(route));
        }
      }
    ];

    for (const validation of validations) {
      const result = validation.check();
      console.log(`  ${result ? '✅' : '❌'} ${validation.name}`);
    }
  }
}

// Run the fixer
const fixer = new FinalProductionFixer();
fixer.applyAllFixes().catch(console.error);
