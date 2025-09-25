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
    domains: ['localhost', 'cdn.sanity.io', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
