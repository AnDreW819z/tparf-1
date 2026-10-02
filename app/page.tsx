import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Search, ShieldCheck, Truck } from 'lucide-react';
import { CategoryOverviewGrid } from '@/entities/category/ui/CategoryOverviewGrid';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { fetchAllBrands } from '@/shared/api/services/brands';
import { fetchRootCategories } from '@/shared/api/services/categories';
import { fetchNews, type NewsItem } from '@/shared/api/services/news';
import { getUserFromCookie } from '@/shared/server/auth';
import { NewsButton } from '@/widgets/news/ui/NewsButton';

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
    childrenCount: number;
    productCount?: number;
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
            childrenCount: category.children?.length ?? 0,
            productCount: category.productCount,
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
            {/* О компании: одна строка — знак и название слева, описание справа за жёлтой чертой */}
            <section
                aria-label="О компании"
                className="flex flex-col gap-6 border-b border-[var(--line)] px-7 py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12"
            >
                <div className="flex min-w-0 flex-col gap-3">
                    <h1 className="m-0 text-[clamp(17px,4.4vw,28px)] font-bold uppercase leading-[1.12] tracking-[0.02em] text-[var(--primary-blue)]">
                        <span className="block sm:whitespace-nowrap">Торгово-промышленное</span>
                        <span className="block">агентство</span>
                    </h1>
                    <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
                        В интересах бизнеса, во благо человечества
                    </span>
                </div>

                <p lang="ru" className="m-0 max-w-[460px] border-l-[3px] border-[var(--gold)] py-1 pl-5 sm:text-justify sm:hyphens-auto text-[17px] leading-relaxed text-[#26303E]">
                    Комплексное обеспечение предприятий на территории Российской Федерации и экспорт продукции на мировой рынок.
                </p>
            </section>

            {/* Новости: главная новость во всю основную ширину + узкая лента сбоку. Контакты — в подвале. */}
            <section className="px-7 pb-6 pt-10">
                <SectionTitle title="Новости и обновления" />
                {leadNews ? (
                    <div
                        className={
                            feed.length > 0
                                ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10'
                                : 'block'
                        }
                    >
                        <article
                            className={
                                feed.length > 0
                                    ? 'flex min-w-0 flex-col gap-3'
                                    : 'grid min-w-0 items-center gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]'
                            }
                        >
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
                                        sizes={feed.length > 0 ? '(min-width:1024px) 820px, 100vw' : '(min-width:1024px) 640px, 100vw'}
                                        priority
                                    />
                                ) : (
                                    <span className="flex h-full items-center justify-center text-[#8A95A5]">
                                        <ImageIcon className="h-8 w-8" aria-hidden="true" />
                                    </span>
                                )}
                            </Link>
                            <div className="flex min-w-0 flex-col gap-3">
                                <span className="font-mono text-[13px] text-[var(--muted)]">{formatDate(leadNews.createdAt)}</span>
                                <Link href={`/news/${leadNews.id}`} className="text-[24px] font-semibold leading-snug text-[var(--ink)]">
                                    {leadNews.title}
                                </Link>
                                <p className="m-0 text-[15px] leading-relaxed text-[#3D4757]">{excerpt(leadNews.content, 260)}</p>
                                <NewsButton url={leadNews.buttonUrl} text={leadNews.buttonText} className="mt-1 self-start" />
                            </div>
                        </article>

                        {feed.length > 0 && (
                            <aside aria-label="Другие новости" className="flex min-w-0 flex-col">
                                <span className="border-b-2 border-[var(--primary-blue)] pb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                                    Лента
                                </span>
                                {feed.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/news/${item.id}`}
                                        className="group flex items-start gap-3 border-b border-[#EDF0F3] py-3.5 text-[var(--ink)]"
                                    >
                                        {item.imageUrl && (
                                            <span className="relative mt-0.5 block h-[42px] w-[64px] flex-none overflow-hidden rounded bg-[#F0F3F7]">
                                                <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                                            </span>
                                        )}
                                        <span className="flex min-w-0 flex-col gap-1">
                                            <span className="font-mono text-xs text-[var(--muted)]">{formatDate(item.createdAt)}</span>
                                            <span className="text-[15px] font-medium leading-snug group-hover:text-[var(--primary-blue)]">
                                                {item.title}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </aside>
                        )}
                    </div>
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
