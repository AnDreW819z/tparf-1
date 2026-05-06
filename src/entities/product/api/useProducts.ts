// src/entities/product/api/useProducts.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProductsByCategoryId, type ProductsResponse } from '@/shared/api/services/products';

// Ключи для кэша
export const productKeys = {
    all: ['products'] as const,
    byCategory: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,
    detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
};

/**
 * Хук для загрузки товаров категории с кэшированием
 */
export function useProductsByCategory(
    categoryId: string,
    page: number,
    pageSize: number
) {
    return useQuery({
        queryKey: productKeys.byCategory(categoryId),
        queryFn: () => fetchProductsByCategoryId(categoryId, { page, pageSize }),
        staleTime: 5 * 60 * 1000, // 5 минут
        gcTime: 10 * 60 * 1000, // 10 минут
        retry: 1,
    });
}

/**
 * Хук для загрузки одного товара с кэшированием
 */
export function useProduct(productId: string) {
    return useQuery({
        queryKey: productKeys.detail(productId),
        queryFn: () => fetchProductsByCategoryId(productId, { page: 1, pageSize: 1 }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        enabled: !!productId,
    });
}
