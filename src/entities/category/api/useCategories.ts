// src/entities/category/api/useCategories.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRootCategories, fetchCategoryById } from '@/shared/api/services/categories';

// Ключи для кэша
export const categoryKeys = {
    all: ['categories'] as const,
    root: () => [...categoryKeys.all, 'root'] as const,
    detail: (categoryId: string) => [...categoryKeys.all, 'detail', categoryId] as const,
};

/**
 * Хук для загрузки корневых категорий с кэшированием
 */
export function useRootCategories() {
    return useQuery({
        queryKey: categoryKeys.root(),
        queryFn: fetchRootCategories,
        staleTime: 10 * 60 * 1000, // 10 минут для категорий
        gcTime: 20 * 60 * 1000, // 20 минут
        retry: 1,
    });
}

/**
 * Хук для загрузки категории по ID с кэшированием
 */
export function useCategory(categoryId: string) {
    return useQuery({
        queryKey: categoryKeys.detail(categoryId),
        queryFn: () => fetchCategoryById(categoryId),
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        retry: 1,
        enabled: !!categoryId,
    });
}
