// src/widgets/product-filters/ui/ProductFilters.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { BrandItem } from '@/shared/api/services/brands';

export function ProductFilters({ brands = [] }: { brands?: BrandItem[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Текущие значения из URL
    const selectedBrandIds = searchParams.get('BrandIds')?.split(',').filter(Boolean) ?? [];
    const minPrice = searchParams.get('MinPrice') ?? '';
    const maxPrice = searchParams.get('MaxPrice') ?? '';

    // Локальные стейты для полей ввода цены
    const [localMinPrice, setLocalMinPrice] = useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

    // Синхронизация локальных стейтов с URL при изменении searchParams
    useEffect(() => {
        setLocalMinPrice(minPrice);
        setLocalMaxPrice(maxPrice);
    }, [minPrice, maxPrice]);

    const buildUrl = useCallback((params: Record<string, string | string[] | undefined>) => {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                newParams.delete(key);
            } else if (Array.isArray(value)) {
                newParams.set(key, value.join(','));
            } else {
                newParams.set(key, value);
            }
        });

        // Сброс страницы при изменении фильтров
        newParams.delete('Page');

        const qs = newParams.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    }, [pathname, searchParams]);

    const handleBrandToggle = (brandId: string) => {
        const current = new Set(selectedBrandIds);
        if (current.has(brandId)) {
            current.delete(brandId);
        } else {
            current.add(brandId);
        }
        const url = buildUrl({ BrandIds: Array.from(current) });
        router.push(url);
    };

    const handlePriceApply = () => {
        const url = buildUrl({
            MinPrice: localMinPrice || undefined,
            MaxPrice: localMaxPrice || undefined,
        });
        router.push(url);
    };

    const handleReset = () => {
        router.push(pathname);
    };

    const hasActiveFilters = selectedBrandIds.length > 0 || minPrice || maxPrice;

    return (
        <aside className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="font-medium text-gray-900">Фильтры</div>
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Сбросить
                    </button>
                )}
            </div>

            {/* Фильтр по цене */}
            <div className="mb-5">
                <div className="text-sm font-medium text-gray-700 mb-2">Цена</div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={localMinPrice}
                        onChange={e => setLocalMinPrice(e.target.value)}
                        placeholder="от"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                        type="number"
                        value={localMaxPrice}
                        onChange={e => setLocalMaxPrice(e.target.value)}
                        placeholder="до"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={handlePriceApply}
                    disabled={!localMinPrice && !localMaxPrice}
                    className="mt-2 w-full py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                >
                    Применить
                </button>
            </div>

            {/* Фильтр по брендам */}
            <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Бренд</div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {brands.length === 0 && (
                        <div className="text-sm text-gray-400">Нет брендов</div>
                    )}
                    {brands.map(brand => {
                        const isSelected = selectedBrandIds.includes(brand.id);
                        return (
                            <label
                                key={brand.id}
                                className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleBrandToggle(brand.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{brand.name}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}