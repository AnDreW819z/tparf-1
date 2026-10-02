'use client';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

export type CategoryCardProps = {
    id: string;
    name: string;
    href?: string;
    subtitle?: string;
    imageUrl?: string | null;
    className?: string;
};

export function CategoryCard({ id, name, href, subtitle, imageUrl, className }: CategoryCardProps) {
    const to = href ?? `/catalog/${id}`;
    const src = imageUrl || '/placeholder.png';
    return (
        <Link href={to} className={clsx('card-surface block overflow-hidden', className)}>
            <div className="placeholder-media relative aspect-[16/10] w-full">
                <Image
                    src={src}
                    alt={name}
                    fill
                    className="photo-blend object-contain"
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                />
            </div>
            <div className="p-4">
                <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>
                    {name}
                </div>
                {subtitle && <div className="text-[13px] text-[#888]">{subtitle}</div>}
            </div>
        </Link>
    );
}
