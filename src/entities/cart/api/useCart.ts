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
 * Хук для получения корзины с кэшированием.
 * Авторизация берётся из HttpOnly-cookie на стороне BFF-прокси.
 */
export function useCart() {
    return useQuery({
        queryKey: cartKeys.detail('current'),
        queryFn: () => getCart(),
        staleTime: 2 * 60 * 1000, // 2 минуты
        gcTime: 5 * 60 * 1000, // 5 минут
        retry: 1,
    });
}

/**
 * Хук для добавления товара в корзину
 */
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            addToCartApi(productId, quantity),
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
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            updateCartItemApi(productId, quantity),
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
        mutationFn: ({ productId }: { productId: string }) =>
            removeFromCartApi(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}
