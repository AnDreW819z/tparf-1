// src/shared/api/services/cart.ts
import { api } from '@/shared/api/axios';
import type { CartResponse } from '@/shared/store/useCartStore';

/**
 * На сервере (SSR) токен передаётся явно. В браузере он не нужен:
 * BFF-прокси добавит Authorization из HttpOnly-cookie.
 */
function authConfig(token?: string) {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

// GET /cart — получить корзину
export async function getCart(token?: string): Promise<CartResponse> {
    const { data } = await api.get<CartResponse>('cart', authConfig(token));
    return data;
}

// POST /cart/items — добавить товар в корзину
export async function addToCart(
    productId: string,
    quantity: number,
    token?: string
): Promise<void> {
    await api.post('cart/items', { productId, quantity }, authConfig(token));
}

// PUT /cart/items/{productId} — изменить количество товара в корзине
export async function updateCartItem(
    productId: string,
    quantity: number,
    token?: string
): Promise<void> {
    await api.put(`cart/items/${productId}`, { quantity }, authConfig(token));
}

// DELETE /cart/items/{productId} — удалить товар из корзины
export async function removeFromCart(
    productId: string,
    token?: string
): Promise<void> {
    await api.delete(`cart/items/${productId}`, authConfig(token));
}
