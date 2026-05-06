// src/shared/api/services/brands.ts
import { api } from '@/shared/api/axios';

export type BrandItem = {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    countryOfOrigin: string | null;
    isActive: boolean;
};

export type BrandsResponse = {
    items: BrandItem[];
    totalCount: number;
    page: number;
    pageSize: number;
};

export async function fetchAllBrands(): Promise<BrandItem[]> {
    const { data } = await api.get<BrandsResponse>('brands', {
        params: { PageSize: 100 }
    });
    return data.items;
}

export type MinMaxPrice = {
    minPrice: number;
    maxPrice: number;
};

export async function fetchPriceRange(categoryId?: string): Promise<MinMaxPrice> {
    const params: Record<string, string> = {};
    if (categoryId) params.categoryId = categoryId;
    const { data } = await api.get<MinMaxPrice>('products/price-range', {
        params,
    });
    return data;
}