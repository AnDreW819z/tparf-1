// src/entities/cart/ui/CartItemsList.tsx
'use client';

import React from 'react';
import CartItem from './CartItem';
import type { CartItemType } from '@/shared/store/useCartStore';

interface CartItemsListProps {
    items: CartItemType[];
    token: string;
}

export default function CartItemsList({ items, token }: CartItemsListProps) {
    return (
        <div className="rounded-md border border-[var(--line)]">
            <div className="hidden gap-4 rounded-t-md border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-[13px] text-[var(--muted)] md:flex">
                <span className="flex-auto">Товар</span>
                <span className="w-[132px] flex-none">Количество</span>
                <span className="w-[110px] flex-none text-right">Сумма</span>
                <span className="w-10 flex-none" />
            </div>
            {items.map((item) => (
                <CartItem key={item.id} item={item} token={token} />
            ))}
        </div>
    );
}
