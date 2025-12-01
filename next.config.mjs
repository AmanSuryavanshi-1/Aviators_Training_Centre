/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,

  // Suppress React 19 warnings in development and handle Node.js modules
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    // Handle Node.js modules for client-side
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

    return config;
  },

  images: {
    domains: ['localhost', 'cdn.sanity.io', 'images.unsplash.com', 'img.youtube.com', 'i.ytimg.com'],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Optimized device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimum cache time for optimized images (1 year)
    minimumCacheTTL: 31536000,

    // Disable static image import for better control
    disableStaticImages: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features
  experimental: {
    ppr: false, // Disable partial prerendering for now, enable when stable
    optimizeCss: true, // Enable critical CSS inlining
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Cache configuration for better performance
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Optimize builds for ISR
  generateBuildId: async () => {
    // Use timestamp for build ID to ensure proper cache invalidation
    return `build-${Date.now()}`;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net https://www.facebook.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://cdn.sanity.io https://images.unsplash.com https://*.google-analytics.com https://www.facebook.com https://www.googletagmanager.com https://img.youtube.com https://i.ytimg.com https://*.ytimg.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.facebook.com https://www.youtube.com; connect-src 'self' https://*.googleapis.com https://*.google-analytics.com https://*.facebook.com https://vitals.vercel-insights.com https://cdn.sanity.io https://*.sanity.io;"
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  },
};

export default nextConfig;
