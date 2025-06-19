/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image optimization for better Core Web Vitals
  images: {
    domains: ['aviatorstrainingcentre.com', 'www.aviatorstrainingcentre.in'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false, // Enable optimization for better performance
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable compression
  compress: true,
  
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Add webpack configuration for performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Add headers for better SEO and performance
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
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/studio/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3333/studio/:path*' // Default Sanity dev port
          : '/studio/index.html', // Assuming you build the studio to static files
      },
    ];
  }
};

export default nextConfig;
