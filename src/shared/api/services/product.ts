// src/shared/api/services/products.ts (или где находится функция)
import { api } from '@/shared/api/axios';

export type CartInfo = {
    inCart: boolean;
    quantity: number;
} | null;

export type ProductImage = {
    id: string;
    imageUrl: string;
    isMain: boolean;
    sortOrder: number;
};

export type ProductDescription = {
    id: string;
    type: number;
    content: string;
    sortOrder: number;
};

export type ProductCategory = {
    id: string;
    name: string;
    logoUrl: string | null;
    parentId: string | null;
    path: string;
    sortOrder: number;
    isActive: boolean;
    level: number;
    pathItems: {
        id: string;
        name: string;
    }[];
    children: unknown[];
};

export type ProductDetail = {
    id: string;
    name: string;
    sku: string;
    price: number;
    currencyCode: string;
    brandName: string | null;
    categories: ProductCategory[];
    images: ProductImage[];
    descriptions: ProductDescription[];
    characteristics: Record<string, unknown>;
    stockQuantity: number;
    isActive: boolean;
    cartInfo: CartInfo;
    createdAt: string;
};

export async function fetchProductById(id: string): Promise<ProductDetail> {
    const { data } = await api.get<ProductDetail>(`products/${id}`);
    return data;
}
