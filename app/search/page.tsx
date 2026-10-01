import { ProductGrid } from '@/entities/product/ui/ProductGrid';
import { fetchProducts, type ProductItem } from '@/shared/api/services/products';
import { Pagination } from '@/widgets/pagination/ui/Pagination';

export const revalidate = 300;

export const metadata = { title: 'Поиск товаров' };

type SearchPageProps = {
    searchParams: Promise<{
        SearchQuery?: string;
        Page?: string;
        PageSize?: string;
    }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { SearchQuery, Page, PageSize } = await searchParams;
    const searchQuery = SearchQuery?.trim() ?? '';
    const page = Number(Page ?? 1);
    const pageSize = Number(PageSize ?? 20);

    const productsData = searchQuery
        ? await fetchProducts({
            searchQuery,
            page,
            pageSize,
        })
        : null;

    const productItems =
        productsData?.items.map((product: ProductItem) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            currencyCode: product.currencyCode,
            imageUrl: product.images?.find((image) => image.isMain)?.imageUrl ?? product.images?.[0]?.imageUrl,
            brandName: product.brandName,
            isAvailable: product.isAvailable,
        })) ?? [];

    return (
        <section className="px-7 pb-20 pt-10">
            <h1 className="heading-1 mb-2.5 text-[28px]">Результаты поиска</h1>

            {searchQuery ? (
                <p className="mb-8 text-[14.5px] text-[#888]">
                    По запросу «{searchQuery}» найдено {productsData?.totalCount ?? 0} товаров
                </p>
            ) : (
                <p className="mb-8 text-[14.5px] text-[#888]">
                    Введите название товара в строку поиска.
                </p>
            )}

            {searchQuery && productItems.length > 0 && (
                <>
                    <ProductGrid items={productItems} />
                    <Pagination
                        basePath="/search"
                        page={page}
                        pageSize={pageSize}
                        totalCount={productsData?.totalCount ?? 0}
                        preserve={{ SearchQuery: searchQuery }}
                    />
                </>
            )}

            {searchQuery && productItems.length === 0 && (
                <div
                    className="rounded-md border border-dashed border-[#cfcfcf] px-6 py-16 text-center text-[15px] text-[#777]"
                    style={{ background: 'var(--gray-bg)' }}
                >
                    Ничего не найдено. Попробуйте изменить запрос.
                </div>
            )}
        </section>
    );
}
