'use client';

import { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & {
    src: string | undefined;
    fallbackSrc?: string;
};

function resolveSafeImageSrc(src: string | undefined, fallbackSrc: string) {
    if (!src) {
        return fallbackSrc;
    }

    const normalized = src.trim();
    if (!normalized) {
        return fallbackSrc;
    }

    if (normalized.startsWith('/')) {
        return normalized;
    }

    try {
        const withProtocol = normalized.startsWith('//') ? `https:${normalized}` : normalized;
        const url = new URL(withProtocol);
        const isAllowedProtocol = url.protocol === 'http:' || url.protocol === 'https:';

        return isAllowedProtocol ? url.toString() : fallbackSrc;
    } catch {
        return fallbackSrc;
    }
}

export function ImageWithFallback({ src, alt, fallbackSrc = '/placeholder.png', ...rest }: Props) {
    const [imgSrc, setImgSrc] = useState(resolveSafeImageSrc(src, fallbackSrc));

    useEffect(() => {
        setImgSrc(resolveSafeImageSrc(src, fallbackSrc));
    }, [src, fallbackSrc]);

    return (
        <Image
            {...rest}
            alt={alt ?? ''}
            src={imgSrc}
            onError={() => setImgSrc(fallbackSrc)}
            onLoadingComplete={(result) => {
                if (result.naturalWidth === 0) {
                    setImgSrc(fallbackSrc);
                }
            }}
        />
    );
}
