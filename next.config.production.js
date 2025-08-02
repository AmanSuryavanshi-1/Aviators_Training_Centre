/**
 * Production Next.js Configuration
 * Optimized for production deployment with Sanity Studio integration
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: [
      'localhost',
      'cdn.sanity.io',
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/https?:\/\//, '') || 'localhost',
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // URL configuration
  trailingSlash: false,
  
  // Build optimization
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint in production
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking in production
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        http2: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Bundle analyzer (only in production with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }

    // Optimize for production
    if (!dev) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };

      // Minimize bundle size
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy libraries with lighter alternatives in production
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      };
    }

    return config;
  },

  // Security headers
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow Studio to be embedded
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
            ].join('; '),
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.sanity.io",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/studio',
        destination: '/studio/',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/',
        permanent: true,
      },
    ];
  },

  // Rewrites for Studio integration
  async rewrites() {
    return [
      {
        source: '/studio/:path*',
        destination: '/studio/:path*',
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features for production
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable SWC minification
    swcMinify: true,
    // Enable modern builds
    modern: true,
    // Enable server components (if using App Router)
    serverComponentsExternalPackages: ['@sanity/client'],
  },

  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate build ID for cache busting
  generateBuildId: async () => {
    if (process.env.BUILD_ID) {
      return process.env.BUILD_ID;
    }
    
    // Use git commit hash if available
    try {
      const { execSync } = require('child_process');
      const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
      return `git-${gitHash}`;
    } catch (error) {
      // Fallback to timestamp
      return `build-${Date.now()}`;
    }
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Cache configuration
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5,
  },

  // Server runtime configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.MY_SECRET,
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },

  // Standalone output for Docker deployment
  ...(process.env.DOCKER_BUILD === 'true' && {
    output: 'standalone',
    experimental: {
      outputFileTracingRoot: process.cwd(),
    },
  }),
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Next.js Production Configuration Loaded');
  console.log(`   - Build ID: ${nextConfig.generateBuildId ? 'Dynamic' : 'Static'}`);
  console.log(`   - Output: ${nextConfig.output || 'default'}`);
  console.log(`   - Compression: ${nextConfig.compress ? 'enabled' : 'disabled'}`);
}

module.exports = nextConfig;