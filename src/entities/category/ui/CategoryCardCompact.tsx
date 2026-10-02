'use client';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

export type CategoryCardCompactProps = {
    id: string;
    name: string;
    href?: string;
    imageUrl?: string | null;
    className?: string;
};

export function CategoryCardCompact({ id, name, href, imageUrl, className }: CategoryCardCompactProps) {
    const to = href ?? `/catalog/${id}`;
    const src = imageUrl || '/placeholder.png';
    return (
        <Link
            href={to}
            className={clsx('card-surface flex items-center gap-3 p-3', className)}
            title={name}
        >
            <div className="placeholder-media relative h-12 w-12 shrink-0 overflow-hidden rounded">
                <Image src={src} alt={name} fill className="photo-blend object-contain" sizes="48px" />
            </div>
            <span className="line-clamp-2 text-sm text-[#1a1a1a]">{name}</span>
        </Link>
    );
}
