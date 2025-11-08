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
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
