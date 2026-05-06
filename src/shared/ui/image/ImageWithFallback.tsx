'use client';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & {
    src: string | undefined;
    fallbackSrc?: string;
};

const ALLOWED_REMOTE_HOSTS = new Set([
    'petropump.ru',
    'fotobank.eltreco.ru',
    'gate.skatpower.ru',
    'sts-rf.ru',
    'kedrweld.ru',
    'cdn.ibot.by',
]);

function resolveSafeImageSrc(src: string | undefined, fallbackSrc: string) {
    if (!src) {
        return fallbackSrc;
    }

    if (src.startsWith('/')) {
        return src;
    }

    try {
        const url = new URL(src);
        const isAllowedProtocol = url.protocol === 'http:' || url.protocol === 'https:';
        const isAllowedHost = ALLOWED_REMOTE_HOSTS.has(url.hostname);

        return isAllowedProtocol && isAllowedHost ? src : fallbackSrc;
    } catch {
        return fallbackSrc;
    }
}

export function ImageWithFallback({ src, fallbackSrc = '/placeholder.png', ...rest }: Props) {
    const [imgSrc, setImgSrc] = useState(resolveSafeImageSrc(src, fallbackSrc));
    useEffect(() => {
        setImgSrc(resolveSafeImageSrc(src, fallbackSrc));
    }, [src, fallbackSrc]);

    return (
        <Image
            {...rest}
            src={imgSrc as string}
            onError={() => setImgSrc(fallbackSrc)}
            onLoadingComplete={(result) => {
                // если браузер вернул «битое» изображение нулевой ширины — переключаемся на фолбек
                if ((result as any).naturalWidth === 0) setImgSrc(fallbackSrc);
            }}
        />
    );
}
