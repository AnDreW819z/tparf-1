import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, PackageSearch, ShieldCheck, Truck } from 'lucide-react';
import { CategoryGrid } from '@/entities/category/ui/CategoryGrid';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { fetchAllBrands } from '@/shared/api/services/brands';
import { fetchRootCategories } from '@/shared/api/services/categories';
import { fetchNews, type NewsItem } from '@/shared/api/services/news';
import { getUserFromCookie } from '@/shared/server/auth';
import { Hero } from '@/widgets/hero/ui/Hero';
import { NewsSection } from '@/widgets/news/ui/NewsSection';

export const revalidate = 300;

const advantages = [
    {
        icon: PackageSearch,
        title: 'Точный подбор позиций',
        description: 'Подбираем оборудование и комплектующие под реальные задачи снабжения, а не только по артикулу.',
    },
    {
        icon: ShieldCheck,
        title: 'Проверенные поставки',
        description: 'Собираем рабочие решения для B2B-заказов с понятной логикой комплектации и сопровождения.',
    },
    {
        icon: Truck,
        title: 'Отгрузка по РФ',
        description: 'Сопровождаем поставки по России и помогаем быстро перейти от поиска к оформлению заказа.',
    },
];

export default async function Home() {
    let categoryItems: Array<{
        id: string;
        name: string;
        childrenCount?: number;
        imageUrl?: string | null;
    }> = [];

    let brandItems: Array<{
        id: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        countryOfOrigin: string | null;
    }> = [];

    let newsItems: NewsItem[] = [];
    const user = await getUserFromCookie();
    const canManageNews = canAccessAdminPanel(user);

    try {
        const roots = await fetchRootCategories();
        categoryItems = roots.slice(0, 6).map((category) => ({
            id: category.id,
            name: category.name,
            childrenCount: category.children?.length ?? undefined,
            imageUrl: category.logoUrl,
        }));
    } catch (error) {
        console.error('Failed to load categories for home page', error);
    }

    try {
        const brands = await fetchAllBrands();
        brandItems = brands
            .filter((brand) => brand.isActive)
            .slice(0, 8)
            .map((brand) => ({
                id: brand.id,
                name: brand.name,
                description: brand.description,
                logoUrl: brand.logoUrl,
                countryOfOrigin: brand.countryOfOrigin,
            }));
    } catch (error) {
        console.error('Failed to load brands for home page', error);
    }

    try {
        newsItems = (await fetchNews()).slice(0, 3);
    } catch (error) {
        console.error('Failed to load news for home page', error);
    }

    return (
        <div className="bg-[linear-gradient(180deg,#f2f4f7_0%,#ffffff_18%,#f8fafc_100%)]">
            <Hero />
            <NewsSection items={newsItems} showEmptyState={canManageNews} />

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Каталог
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                            Основные категории оборудования
                        </h2>
                    </div>
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--primary-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b2b49]"
                    >
                        Весь каталог
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="mt-6 sm:mt-8">
                    {categoryItems.length > 0 ? (
                        <CategoryGrid items={categoryItems} parentLevel={0} />
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                            Категории загрузятся здесь, как только API вернет данные.
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Партнеры
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                            Производители и поставщики
                        </h2>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 xl:grid-cols-4">
                    {brandItems.length > 0 ? (
                        brandItems.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/search?SearchQuery=${encodeURIComponent(brand.name)}`}
                                className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                                        {brand.logoUrl ? (
                                            <Image
                                                src={brand.logoUrl}
                                                alt={brand.name}
                                                width={56}
                                                height={56}
                                                className="h-10 w-auto object-contain"
                                            />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-slate-500" />
                                        )}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-[var(--primary-blue)]" />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-slate-900">{brand.name}</h3>
                                {brand.description && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{brand.description}</p>
                                )}
                                {brand.countryOfOrigin && (
                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                        {brand.countryOfOrigin}
                                    </p>
                                )}
                            </Link>
                        ))
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 sm:col-span-2 xl:col-span-4">
                            Производители появятся здесь после загрузки данных.
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="grid gap-4 md:grid-cols-3">
                    {advantages.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.title}
                                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:p-6"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-blue)] text-[var(--primary-yellow1)]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
