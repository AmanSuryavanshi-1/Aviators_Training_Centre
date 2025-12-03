import crypto from 'crypto';
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  compress: true,

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

      // Optimization: Aggressive Split Chunks
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              framework: {
                name: 'framework',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 40,
                enforce: true,
              },
              lib: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                  const packageName = match ? match[1] : 'unknown';
                  return `npm.${packageName.replace('@', '')}`;
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
            },
            maxInitialRequests: 25,
            minSize: 20000,
          },
        };
      }
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

    // Mobile-specific optimization
    loader: 'default',
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
  // Experimental features
  experimental: {
    ppr: false, // Disable partial prerendering for now, enable when stable
    optimizeCss: false, // Enable critical CSS inlining
    optimizePackageImports: ['framer-motion', 'lucide-react', '@radix-ui/react-icons', 'date-fns'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Optimize builds for ISR
  generateBuildId: async () => {
    // Use timestamp for build ID to ensure proper cache invalidation
    return `build-${Date.now()}`;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
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
      // Static assets - long cache
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Fonts - long cache
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // HTML pages - short cache with revalidation
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
