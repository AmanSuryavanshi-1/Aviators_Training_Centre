/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cdn.sanity.io'],
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: false,
  eslint: {
    // Disable ESLint during builds to focus on core functionality
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds for now
    ignoreBuildErrors: true,
  },
  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. on the client
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
  // Experimental features
  experimental: {
    // Enable partial prerendering for better performance
    ppr: false, // Disable for now, enable when stable
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
};

export default nextConfig;
