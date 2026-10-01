// app/cart/CartPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore, type CartResponse } from '@/shared/store/useCartStore';
import type { User } from '@/shared/api/services/auth';
import CartItemsList from '@/entities/cart/ui/CartItemsList';
import CartSummary from '@/entities/cart/ui/CartSummary';
import Link from 'next/link';

interface UserWithToken extends User {
    token: string;
}

interface CartPageClientProps {
    cart: CartResponse;
    user: UserWithToken;
}

export default function CartPageClient({ cart, user }: CartPageClientProps) {
    const token = user.token;
    const setCart = useCartStore((state) => state.setCart);
    const cartState = useCartStore((state) => state.cart);

    useEffect(() => {
        setCart(cart);
    }, [cart, setCart]);

    const currentCart = cartState || cart;

    const lines = currentCart.items.length;
    const word = lines % 10 === 1 && lines % 100 !== 11 ? 'позиция' : lines % 10 >= 2 && lines % 10 <= 4 && (lines % 100 < 10 || lines % 100 >= 20) ? 'позиции' : 'позиций';

    return (
        <section className="px-7 pb-16 pt-7">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div className="flex items-baseline gap-3">
                    <h1 className="m-0 text-[32px] font-semibold">Корзина</h1>
                    {lines > 0 && <span className="text-[var(--muted)]">{lines} {word}</span>}
                </div>
                <Link href="/catalog" className="font-medium">← Продолжить выбор</Link>
            </div>

            {lines === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[#C9D0D8] px-6 py-14 text-center">
                    <span className="text-lg font-semibold">В корзине пока пусто</span>
                    <span className="text-[var(--muted)]">Найдите позиции через поиск или каталог.</span>
                    <Link href="/catalog" className="button-brand-primary mt-2 inline-flex h-11 items-center px-5 text-white hover:text-white">
                        Перейти в каталог
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <CartItemsList items={currentCart.items} token={token} />
                    <CartSummary items={currentCart.items} token={token} companyName={user.companyName} inn={user.inn} />
                </div>
            )}
        </section>
    );
}
