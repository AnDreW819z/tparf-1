import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            new URL('https://petropump.ru/upload/**'),
            {
                protocol: 'http',
                hostname: 'fotobank.eltreco.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gate.skatpower.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'sts-rf.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'kedrweld.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.ibot.by',
                port: '',
                pathname: '/**',
            }
        ],
    }
};

export default nextConfig;
