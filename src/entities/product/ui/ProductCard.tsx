// src/entities/product/ui/ProductCard.tsx
'use client';
import Link from 'next/link';
import clsx from 'clsx';
import { formatProductPrice } from '@/shared/lib/price';
import { ImageWithFallback } from '@/shared/ui/image/ImageWithFallback';

export type ProductCardProps = {
    id: string;
    name: string;
    price: number;
    currencyCode: string;
    imageUrl?: string;
    brandName?: string;
    className?: string;
    hrefName?: string;
};

export function ProductCard({
                                id,
                                name,
                                price,
                                currencyCode,
                                imageUrl,
                                brandName,
                                className,
                                hrefName,
                            }: ProductCardProps) {
    const to = hrefName ?? `/product/${id}`;

    return (
        <article className={clsx('flex flex-col gap-2', className)}>
            <Link href={to} aria-label={name} className="relative mb-1 block aspect-square overflow-hidden rounded bg-[var(--surface)]">
                <ImageWithFallback
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-contain p-3"
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                />
            </Link>

            <h3 className="m-0 line-clamp-2 text-[15px] font-medium leading-snug text-[var(--ink)]">
                <Link href={to} className="text-inherit hover:text-[var(--primary-blue)]">{name}</Link>
            </h3>

            {brandName && <div className="text-[13px] text-[var(--muted)]">{brandName}</div>}

            <div className="mt-auto text-lg font-semibold text-[var(--ink)]">
                {formatProductPrice(price, currencyCode)}
            </div>
        </article>
    );
}
