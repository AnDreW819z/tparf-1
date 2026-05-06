// app/catalog/[id]/page.tsx

import { notFound } from 'next/navigation';
import { fetchCategoryById } from '../../../src/shared/api/services/categories';
import { fetchProductsByCategoryId } from '../../../src/shared/api/services/products';
import { fetchAllBrands } from '../../../src/shared/api/services/brands';
import { Breadcrumbs } from '../../../src/widgets/breadcrumbs/ui/Breadcrumbs';
import { CategoryGrid } from '../../../src/entities/category/ui/CategoryGrid';
import { ProductFilters } from '../../../src/widgets/product-filters/ui/ProductFilters';
import { ProductGrid } from '../../../src/entities/product/ui/ProductGrid';
import { Pagination } from '../../../src/widgets/pagination/ui/Pagination';

export const revalidate = 300;

type CatalogPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ Page?: string; PageSize?: string; BrandIds?: string; MinPrice?: string; MaxPrice?: string }>;
};

export default async function CategoryByIdPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { id } = await params;
  const { Page, PageSize, BrandIds, MinPrice, MaxPrice } = await searchParams;

  let node;
  try {
    node = await fetchCategoryById(id);
  } catch (e: any) {
    if (e?.response?.status === 404) notFound();
    throw e;
  }

  // ✅ Breadcrumbs
  const crumbs = node.pathItems.map((p: any) => ({
    id: p.id,
    title: p.name,
  }));

  // ✅ Подкатегории
  const categoryItems = node.children.map((child: any) => ({
    id: child.id,
    name: child.name,
    childrenCount: child.children?.length ?? undefined,
    imageUrl: child.logoUrl ?? null,
  }));

  const page = Number(Page ?? 1);
  const pageSize = Number(PageSize ?? 20);

  let productsData: Awaited<
    ReturnType<typeof fetchProductsByCategoryId>
  > | null = null;

  if (node.level >= 1) {
    const brandIds = BrandIds?.split(',').filter(Boolean) ?? [];
    const minPrice = MinPrice ? Number(MinPrice) : undefined;
    const maxPrice = MaxPrice ? Number(MaxPrice) : undefined;

    productsData = await fetchProductsByCategoryId(node.id, {
      page,
      pageSize,
      brandIds: brandIds.length > 0 ? brandIds : undefined,
      minPrice,
      maxPrice,
    });
  }

  const productItems =
    productsData?.items.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currencyCode: p.currencyCode,
      imageUrl: p.images?.find((i: any) => i.isMain)?.imageUrl,
      brandName: p.brandName,
    })) ?? [];

  const totalCount = productsData?.totalCount ?? 0;

  // ✅ Загружаем бренды на сервере (SSR), чтобы клиент не делал запрос через nginx
  let brands: Awaited<ReturnType<typeof fetchAllBrands>> = [];
  try {
    brands = await fetchAllBrands();
  } catch {
    // игнорируем ошибку загрузки брендов
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* ✅ Breadcrumbs */}
      <Breadcrumbs crumbs={crumbs} />

      {/* ✅ Заголовок категории */}
      <h1 className="text-2xl font-semibold mb-6">{node.name}</h1>

      {/* ✅ Подкатегории */}
      {categoryItems.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Подкатегории</h2>
          <CategoryGrid items={categoryItems} parentLevel={node.level} />
        </div>
      )}

      {/* ✅ Список товаров (только для уровней >= 1) */}
      {node.level >= 1 && (
        <div className="flex gap-8">
          {/* Фильтры — левая колонка */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ProductFilters brands={brands} />
          </aside>

          {/* Основной контент — правая колонка */}
          <div className="flex-1 min-w-0">
            {productItems.length > 0 ? (
              <>
                <ProductGrid items={productItems} />
                <div className="mt-8">
                  <Pagination
                    basePath={`/catalog/${id}`}
                    page={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg">В данной категории товаров пока нет.</p>
                <p className="text-sm mt-2">Попробуйте посмотреть в других категориях.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}