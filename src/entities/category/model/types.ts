// src/entities/category/model/types.ts
export type CategoryCrumb = {
    id: string;     // идентификатор категории (slug/uuid)
    title: string;  // отображаемое название в крошке
};

export type CategoryItem = {
    id: string;
    name: string;
    logoUrl: string | null;
    /** Внешняя ссылка: категория ведёт на другой сайт. */
    externalUrl?: string | null;
    path: string | null;
    level: number;
    /** Товаров на сайте в категории вместе с подкатегориями. */
    productCount?: number;
    children?: CategoryItem[];
};

export type CategoryNode = {
    id: string;
    name: string;
    logoUrl: string | null;
    externalUrl?: string | null;
    parentId: string | null;
    path: string | null;
    sortOrder: number;
    isActive: boolean;
    level: number;
    pathItems: { id: string; name: string }[];
    children: CategoryNode[];
};
