// src/entities/cart/api/useCart.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart as addToCartApi, updateCartItem as updateCartItemApi, removeFromCart as removeFromCartApi } from '@/shared/api/services/cart';
import type { CartResponse } from '@/shared/store/useCartStore';

// Ключи для кэша
export const cartKeys = {
    all: ['cart'] as const,
    detail: (userId: string) => [...cartKeys.all, 'user', userId] as const,
};

/**
 * Хук для получения корзины с кэшированием
 */
export function useCart(token: string) {
    return useQuery({
        queryKey: cartKeys.detail('current'),
        queryFn: () => getCart(token),
        staleTime: 2 * 60 * 1000, // 2 минуты
        gcTime: 5 * 60 * 1000, // 5 минут
        retry: 1,
        enabled: !!token,
    });
}

/**
 * Хук для добавления товара в корзину
 */
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ token, productId, quantity }: { token: string; productId: string; quantity: number }) =>
            addToCartApi(token, productId, quantity),
        onSuccess: () => {
            // Инвалидация кэша корзины для перезагрузки
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Хук для обновления количества товара в корзине
 */
export function useUpdateCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ token, productId, quantity }: { token: string; productId: string; quantity: number }) =>
            updateCartItemApi(token, productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

/**
 * Хук для удаления товара из корзины
 */
export function useRemoveFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ token, productId }: { token: string; productId: string }) =>
            removeFromCartApi(token, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}
