// app/catalog/[id]/page.tsx

import { notFound } from 'next/navigation';
import { fetchCategoryById } from '@/shared/api/services/categories';
import { fetchProductsByCategoryId } from '@/shared/api/services/products';
import { Breadcrumbs } from '@/widgets/breadcrumbs/ui/Breadcrumbs';
import Link from 'next/link';
import { CategoryOverviewGrid } from '@/entities/category/ui/CategoryOverviewGrid';
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

function isResponseError(error: unknown): error is { response?: { status?: number } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default async function CategoryByIdPage({ params, searchParams }: CatalogPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    let node;
    try {
        node = await fetchCategoryById(id);
    } catch (e: unknown) {
        if (isResponseError(e) && e.response?.status === 404) notFound();
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
    const page = Number(resolvedSearchParams.Page ?? 1);
    const pageSize = Number(resolvedSearchParams.PageSize ?? 20);

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
            imageUrl: p.images?.find((i) => i.isMain)?.imageUrl ?? p.images?.[0]?.imageUrl,
            brandName: p.brandName,
        })) ?? [];

    const totalCount = productsData?.totalCount ?? 0;
    const hasProducts = node.level >= 1;

    return (
        <section className="px-7 pb-16 pt-7">
            <Breadcrumbs crumbs={crumbs} />

            <div className="mb-10 mt-2.5 flex flex-wrap items-baseline gap-3">
                <h1 className="m-0 text-[32px] font-semibold">{node.name}</h1>
                {hasProducts && totalCount > 0 && <span className="text-[var(--muted)]">{totalCount}</span>}
            </div>

            {!hasProducts ? (
                categoryItems.length > 0 ? (
                    <CategoryOverviewGrid
                        items={node.children.map((child) => ({
                            id: child.id,
                            name: child.name,
                            imageUrl: child.logoUrl ?? null,
                            children: (child.children ?? []).map((c) => ({ id: c.id, name: c.name })),
                        }))}
                    />
                ) : (
                    <p className="text-[var(--muted)]">В этом разделе пока нет категорий.</p>
                )
            ) : (
                <div className="flex flex-wrap items-start gap-14">
                    {categoryItems.length > 0 && (
                        <nav aria-label="Подразделы" className="flex max-w-[220px] flex-[1_1_200px] flex-col gap-2.5 text-sm">
                            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Подразделы</span>
                            {categoryItems.map((item) => (
                                <Link key={item.id} href={`/catalog/${item.id}`} className="text-[var(--muted)] hover:text-[var(--ink)]">
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    )}

                    <div className="min-w-0 flex-[999_1_600px]">
                        {productItems.length > 0 ? (
                            <ProductGrid items={productItems} />
                        ) : (
                            <p className="text-[var(--muted)]">Товары не найдены.</p>
                        )}
                        <Pagination basePath={`/catalog/${node.id}`} page={page} pageSize={pageSize} totalCount={totalCount} />
                        {productItems.length > 0 && <p className="mt-6 text-[13px] text-[#8A95A5]">Цены с НДС 22%</p>}
                    </div>
                </div>
            )}
        </section>
    );
}
