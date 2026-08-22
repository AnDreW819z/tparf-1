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
        <div
            className={clsx(
                // базовое состояние
                'rounded border border-[#DDDDDD] bg-white text-[#767676]',
                'p-4',
                // hover-эффект: немного увеличить и добавить тень
                'transition-transform transition-shadow duration-200 ease-out hover:scale-[1.02] hover:shadow-md',
                className
            )}
        >
            <Link href={to} aria-label={name}>
                <div className="aspect-square relative mb-3 overflow-hidden rounded">
                    <ImageWithFallback
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain"
                        sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                    />
                </div>
            </Link>

            {brandName && <div className="text-sm text-[#767676] mb-1">{brandName}</div>}

            <h3 className="font-medium mb-2 leading-snug line-clamp-2">
                <Link href={to} className="hover:underline">
                    {name}
                </Link>
            </h3>

            <div className="text-black font-semibold">
                {formatProductPrice(price, currencyCode)}
            </div>
        </div>
    );
}
