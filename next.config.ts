import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Standalone режим для Docker
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'petropump.ru',
        pathname: '/upload/**',
      },
      {
        protocol: 'http',
        hostname: 'fotobank.eltreco.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gate.skatpower.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sts-rf.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kedrweld.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ibot.by',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
