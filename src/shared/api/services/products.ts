// src/shared/api/services/products.ts
import { api } from '@/shared/api/axios';

export type ProductImage = {
    id: string;
    imageUrl: string;
    isMain: boolean;
    sortOrder: number;
};

export type ProductBrand = {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    countryOfOrigin: string | null;
    isActive: boolean;
};

export type ProductCurrency = {
    id: string;
    code: string;
    name: string;
    rateToBase: number;
    isBase: boolean;
};

export type ProductCategoryRef = {
    id: string;
    name: string;
    logoUrl: string | null;
    parentId: string | null;
    path: string | null;
    sortOrder: number;
    isActive: boolean;
    level: number;
    pathItems: { id: string; name: string }[];
    children: unknown[];
};

export type ProductItem = {
    id: string;
    name: string;
    sku: string;
    price: number;
    currency: ProductCurrency;
    brand: ProductBrand;
    brandName: string;
    currencyCode: string;
    categories: ProductCategoryRef[];
    images: ProductImage[];
    descriptions: unknown[];
    characteristics: Record<string, unknown>;
    stockQuantity: number;
    isActive: boolean;
    createdAt: string;
};

export type ProductsResponse = {
    items: ProductItem[];
    totalCount: number;
    page: number;
    pageSize: number;
};

export type ProductFilterParams = {
    page?: number;
    pageSize?: number;
    brandIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
};

export async function fetchProductsByCategoryId(
    categoryId: string,
    params?: ProductFilterParams
) {
    const { page = 1, pageSize = 20, brandIds, minPrice, maxPrice, searchQuery } = params ?? {};
    const queryParams: Record<string, string | number> = {
        Page: page,
        PageSize: pageSize,
    };
    if (brandIds && brandIds.length > 0) {
        queryParams.BrandIds = brandIds.join(',');
    }
    if (minPrice !== undefined) {
        queryParams.MinPrice = minPrice;
    }
    if (maxPrice !== undefined) {
        queryParams.MaxPrice = maxPrice;
    }
    if (searchQuery) {
        queryParams.SearchQuery = searchQuery;
    }
    const { data } = await api.get<ProductsResponse>(`categories/${categoryId}/products`, {
        params: queryParams,
    });
    return data;
}