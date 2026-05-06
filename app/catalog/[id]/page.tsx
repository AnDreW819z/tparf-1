// app/catalog/[id]/page.tsx

import { notFound } from 'next/navigation';
import { fetchCategoryById } from '@/shared/api/services/categories';
import { fetchProductsByCategoryId } from '@/shared/api/services/products';
import { Breadcrumbs } from '@/widgets/breadcrumbs/ui/Breadcrumbs';
import { CategoryGrid } from '@/entities/category/ui/CategoryGrid';
import { ProductFilters } from '@/widgets/product-filters/ui/ProductFilters';
import { ProductGrid } from '@/entities/product/ui/ProductGrid';
import { Pagination } from '@/widgets/pagination/ui/Pagination';

export const revalidate = 300;

type CatalogPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    Page?: string;
    PageSize?: string;
    BrandIds?: string | string[];
    MinPrice?: string;
    MaxPrice?: string;
    SearchQuery?: string;
  }>;
};

function readArrayParam(value?: string | string[]) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => item.split(',')).filter(Boolean);
}

function isResponseError(error: unknown): error is { response?: { status?: number } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default async function CategoryByIdPage({
                                                   params,
                                                   searchParams,
                                               }: {
    params: { id: string };
    searchParams: { Page?: string; PageSize?: string };
}) {
    let node;
    try {

        node = await fetchCategoryById(params.id);
    } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
    }

    const crumbs = node.pathItems.map((p) => ({ id: p.id, title: p.name }));


    const categoryItems = node.children.map((child) => ({
        id: child.id,
        name: child.name,
        childrenCount: child.children?.length ?? undefined,
        imageUrl: child.logoUrl ?? null, // добавлено
    }));

    // Читаем пагинацию из URL
    const page = Number(searchParams.Page ?? 1);
    const pageSize = Number(searchParams.PageSize ?? 20);

    // Товары с уровня 1 и выше
    let productsData = null as Awaited<ReturnType<typeof fetchProductsByCategoryId>> | null;
    if (node.level >= 1) {
        productsData = await fetchProductsByCategoryId(node.id, { page, pageSize });
    }
    const productItems =
        productsData?.items.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            currencyCode: p.currencyCode,
            imageUrl: p.images?.find((i) => i.isMain)?.imageUrl ,
            brandName: p.brandName,
        })) ?? [];

    const totalCount = productsData?.totalCount ?? 0;
    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <Breadcrumbs crumbs={crumbs} className="mb-6" />
            <h1 className="text-2xl font-semibold mb-4">{node.name}</h1>

      {/* ✅ Подкатегории */}
      {categoryItems.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Подкатегории</h2>
          <CategoryGrid items={categoryItems} parentLevel={node.level} />
        </div>
      )}

            {node.level >= 1 && (
                <>
                    <div className="flex">
                    {/*<ProductFilters />*/}

                    {productItems.length > 0 ? (
                        <>
                            <ProductGrid items={productItems} />
                            {/* Пагинация под гридом */}

                        </>
                    ) : (
                        <p className="text-gray-600">Товары не найдены.</p>
                    )}
                    </div>
                    <Pagination
                        basePath={`/catalog/${node.id}`}
                        page={page}
                        pageSize={pageSize}
                        totalCount={totalCount}
                    />
                </>
            )}
        </section>
    );
}
