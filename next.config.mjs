/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image optimization
  images: {
    domains: ['aviatorstrainingcentre.com'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  // Add webpack configuration
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
