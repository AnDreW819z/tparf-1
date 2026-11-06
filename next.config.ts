import type { NextConfig } from 'next';

const apiBaseUrl = process.env.API_BASE_URL_INTERNAL || 'http://localhost:7156/api/';
const apiBaseWithSlash = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;

const nextConfig: NextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                // Загруженные из админки файлы: браузер → Next → API (wwwroot/uploads).
                source: '/uploads/:path*',
                destination: `${apiBaseWithSlash}uploads/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '**',
                port: '',
                pathname: '/**',
            },
        ]
    }
};

export default nextConfig;
