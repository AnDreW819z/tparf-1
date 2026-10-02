import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Search, ShieldCheck, Truck } from 'lucide-react';
import { CategoryOverviewGrid } from '@/entities/category/ui/CategoryOverviewGrid';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { fetchAllBrands } from '@/shared/api/services/brands';
import { fetchRootCategories } from '@/shared/api/services/categories';
import { fetchNews, type NewsItem } from '@/shared/api/services/news';
import { getUserFromCookie } from '@/shared/server/auth';

export const revalidate = 300;

const advantages = [
    {
        icon: Search,
        title: 'Точный подбор позиций',
        description: 'Подбираем оборудование под реальные задачи снабжения, а не только по артикулу.',
    },
    {
        icon: ShieldCheck,
        title: 'Проверенные поставки',
        description: 'Рабочие решения для B2B-заказов с понятной логикой комплектации и сопровождения.',
    },
    {
        icon: Truck,
        title: 'Отгрузка по РФ',
        description: 'Сопровождаем поставки по России, помогаем быстро перейти от поиска к оформлению заказа.',
    },
];

type HomeCategory = {
    id: string;
    name: string;
    imageUrl: string | null;
    externalUrl: string | null;
    children: { id: string; name: string }[];
};

type HomeBrand = { id: string; name: string; logoUrl: string | null };

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function excerpt(text: string, max = 220) {
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

function SectionTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
    return (
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[28px] font-semibold text-[var(--ink)]">{title}</h2>
            {href && linkLabel && (
                <Link href={href} className="inline-flex items-center gap-1.5 font-medium">
                    {linkLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

export default async function Home() {
    let categories: HomeCategory[] = [];
    let brands: HomeBrand[] = [];
    let news: NewsItem[] = [];
    const user = await getUserFromCookie();
    const canManageNews = canAccessAdminPanel(user);

    try {
        const roots = await fetchRootCategories();
        categories = roots.slice(0, 6).map((category) => ({
            id: category.id,
            name: category.name,
            imageUrl: category.logoUrl,
            externalUrl: category.externalUrl ?? null,
            children: (category.children ?? []).slice(0, 4).map((child) => ({ id: child.id, name: child.name })),
        }));
    } catch (error) {
        console.error('Failed to load categories for home page', error);
    }

    try {
        brands = (await fetchAllBrands())
            .filter((brand) => brand.isActive)
            .slice(0, 8)
            .map((brand) => ({ id: brand.id, name: brand.name, logoUrl: brand.logoUrl }));
    } catch (error) {
        console.error('Failed to load brands for home page', error);
    }

    try {
        news = (await fetchNews()).slice(0, 5);
    } catch (error) {
        console.error('Failed to load news for home page', error);
    }

    const [leadNews, ...feed] = news;

    return (
        <div>
            {/* Представление агентства (по ТЗ: лого, название, слоган и текст вместо фото) */}
            <section
                aria-label="О компании"
                className="flex flex-wrap items-center gap-x-10 gap-y-6 border-b border-[var(--line)] px-7 pb-8 pt-9"
            >
                <div className="flex min-w-0 flex-[1_1_420px] flex-wrap items-center gap-5">
                    <Image src="/Logo.png" alt="" width={173} height={76} className="h-[60px] w-auto flex-none sm:h-[76px]" priority />
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <h1 className="text-[clamp(20px,5vw,26px)] font-bold uppercase leading-tight tracking-[0.02em] text-[var(--primary-blue)]">
                            Торгово-промышленное агентство
                        </h1>
                        <span className="text-sm font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                            В интересах бизнеса, во благо человечества
                        </span>
                    </div>
                </div>
                <p className="m-0 flex-[1_1_360px] border-l-[3px] border-[var(--gold)] pl-6 text-base leading-relaxed text-[#26303E]">
                    Комплексное обеспечение предприятий на территории Российской Федерации и экспорт продукции на мировой рынок.
                </p>
            </section>

            {/* Новости: главная новость + информационный столбик (лента и контакты) */}
            <section className="px-7 pb-6 pt-10">
                <SectionTitle title="Новости и обновления" />
                <div className="flex flex-wrap items-start gap-8">
                    <div className="min-w-0 flex-[2_1_460px]">
                        {leadNews ? (
                            <article className="flex flex-col gap-3">
                                <Link
                                    href={`/news/${leadNews.id}`}
                                    className="relative block aspect-video overflow-hidden rounded-md bg-[#F0F3F7]"
                                    aria-label={leadNews.title}
                                >
                                    {leadNews.imageUrl ? (
                                        <Image
                                            src={leadNews.imageUrl}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="(min-width:1024px) 640px, 100vw"
                                        />
                                    ) : (
                                        <span className="flex h-full items-center justify-center text-[#8A95A5]">
                                            <ImageIcon className="h-8 w-8" aria-hidden="true" />
                                        </span>
                                    )}
                                </Link>
                                <span className="font-mono text-[13px] text-[var(--muted)]">{formatDate(leadNews.createdAt)}</span>
                                <Link href={`/news/${leadNews.id}`} className="text-[22px] font-semibold leading-snug text-[var(--ink)]">
                                    {leadNews.title}
                                </Link>
                                <p className="m-0 text-[15px] leading-relaxed text-[#3D4757]">{excerpt(leadNews.content)}</p>
                            </article>
                        ) : (
                            <div className="rounded-md border border-dashed border-[#C9D0D8] p-8 text-sm text-[var(--muted)]">
                                Новости ещё не добавлены.
                                {canManageNews && (
                                    <>
                                        {' '}
                                        <Link href="/admin" className="font-semibold">
                                            Добавить в админ-панели
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-6">
                        {feed.length > 0 && (
                            <div className="flex flex-col">
                                <span className="border-b-2 border-[var(--primary-blue)] pb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                                    Лента
                                </span>
                                {feed.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/news/${item.id}`}
                                        className="flex flex-col gap-1 border-b border-[#EDF0F3] py-3.5 text-[var(--ink)]"
                                    >
                                        <span className="font-mono text-xs text-[var(--muted)]">{formatDate(item.createdAt)}</span>
                                        <span className="text-[15px] font-medium leading-snug">{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 rounded-md bg-[var(--surface)] p-5 text-sm">
                            <span className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Контакты</span>
                            <a href="tel:+79607957523" className="text-base font-semibold text-[var(--ink)]">+7 (960) 795-75-23</a>
                            <a href="tel:+79618722751" className="text-base font-semibold text-[var(--ink)]">+7 (961) 872-27-51</a>
                            <a href="mailto:tpa@tparf.ru">tpa@tparf.ru</a>
                            <span className="text-[#3D4757]">630132, г. Новосибирск, ул. Нарымская, д. 9</span>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Каталог */}
            <section className="px-7 pb-6 pt-14">
                <SectionTitle title="Каталог" href="/catalog" linkLabel="Все категории" />
                {categories.length > 0 ? (
                    <CategoryOverviewGrid items={categories} />
                ) : (
                    <div className="rounded-md border border-dashed border-[#C9D0D8] p-6 text-sm text-[var(--muted)]">
                        Категории появятся здесь, как только API вернёт данные.
                    </div>
                )}
            </section>

            {/* Производители */}
            {brands.length > 0 && (
                <section className="px-7 py-10">
                    <SectionTitle title="Производители" />
                    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/search?SearchQuery=${encodeURIComponent(brand.name)}`}
                                className="relative flex h-[72px] items-center justify-center rounded border border-[var(--line)] px-3 text-[15px] font-bold tracking-[0.06em] text-[#3D4757] hover:border-[#B8C0CB]"
                            >
                                {brand.logoUrl ? (
                                    <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-3" sizes="150px" />
                                ) : (
                                    brand.name
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Преимущества */}
            <section className="mt-4 border-y border-[var(--line)] bg-[var(--surface)]">
                <div className="grid gap-8 px-7 py-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
                    {advantages.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex flex-col gap-2.5">
                            <Icon className="h-7 w-7 text-[var(--primary-blue)]" strokeWidth={1.8} aria-hidden="true" />
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <p className="m-0 leading-relaxed text-[#3D4757]">{description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
