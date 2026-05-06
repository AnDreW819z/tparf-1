// src/shared/api/services/cart.ts
import { api } from '@/shared/api/axios';
import type { CartResponse } from '@/shared/store/useCartStore';

// GET /cart — получить корзину (требует токен)
export async function getCart(token: string): Promise<CartResponse> {
    const { data } = await api.get<CartResponse>('cart', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

// POST /cart/items — добавить товар в корзину
export async function addToCart(
    token: string,
    productId: string,
    quantity: number
): Promise<void> {
    await api.post(
        'cart/items',
        { productId, quantity },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

// PUT /cart/items/{productId} — изменить количество товара в корзине
export async function updateCartItem(
    token: string,
    productId: string,
    quantity: number
): Promise<void> {
    await api.put(
        `cart/items/${productId}`,
        { quantity },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

// DELETE /cart/items/{productId} — удалить товар из корзины
export async function removeFromCart(
    token: string,
    productId: string
): Promise<void> {
    await api.delete(`cart/items/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}
