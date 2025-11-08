import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Ignore TS build errors (optional, but included since you had it)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint build errors
    ignoreDuringBuilds: true,
  },
  images: {
    // Add all allowed external domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: '1000logos.net',
      },
      {
        protocol: 'https',
        hostname: 'www.bing.com',
      },
    ],
  },
};

export default nextConfig;
