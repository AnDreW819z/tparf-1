// src/entities/product/ui/ProductGrid.tsx
'use client';
import { ProductCard, ProductCardProps } from './ProductCard';

export type ProductGridItem = ProductCardProps;

export function ProductGrid({ items }: { items: ProductGridItem[] }) {
    return (
        <div className="grid w-full gap-x-6 gap-y-10 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {items.map((it) => (
                <ProductCard key={it.id} {...it} />
            ))}
        </div>
    );
}
