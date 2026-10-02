import { CategoryOverviewGrid } from '@/entities/category/ui/CategoryOverviewGrid';
import { fetchRootCategories } from '@/shared/api/services/categories';

export const revalidate = 300;

export default async function CatalogRootPage() {
    const roots = await fetchRootCategories();
    const items = roots.map((category) => ({
        id: category.id,
        name: category.name,
        imageUrl: category.logoUrl ?? null,
        externalUrl: category.externalUrl ?? null,
        children: (category.children ?? []).map((child) => ({ id: child.id, name: child.name })),
    }));

    return (
        <section className="px-7 pb-16 pt-7">
            <h1 className="m-0 mb-8 text-[32px] font-semibold">Каталог</h1>
            {items.length > 0 ? (
                <CategoryOverviewGrid items={items} />
            ) : (
                <p className="text-[var(--muted)]">Категории пока не загружены.</p>
            )}
        </section>
    );
}
