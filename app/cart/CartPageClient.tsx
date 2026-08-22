// app/cart/CartPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore, type CartResponse } from '@/shared/store/useCartStore';
import type { User } from '@/shared/api/services/auth';
import CartItemsList from '@/entities/cart/ui/CartItemsList';
import CartSummary from '@/entities/cart/ui/CartSummary';
import HeaderNav from '@/widgets/layout/HeaderNav';

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

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <HeaderNav />
            {currentCart.items.length === 0 ? (
                <p className="text-gray-600">Корзина пуста.</p>
            ) : (
                <>
                    <CartItemsList items={currentCart.items} token={token} />
                    {/* ✅ Передаем token в CartSummary */}
                    <CartSummary items={currentCart.items} token={token} />
                </>
            )}
        </section>
    );
}
