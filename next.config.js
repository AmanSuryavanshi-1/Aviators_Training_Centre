/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from any host (Adjust if needed for security)
      },
    ],
  },
};

module.exports = nextConfig;
