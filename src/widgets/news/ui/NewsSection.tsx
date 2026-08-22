import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import type { NewsItem } from '@/shared/api/services/news';

interface NewsSectionProps {
    items: NewsItem[];
    showEmptyState?: boolean;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
    }).format(new Date(value));
}

export function NewsSection({ items, showEmptyState = false }: NewsSectionProps) {
    if (items.length === 0 && !showEmptyState) {
        return null;
    }

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <div className="overflow-hidden rounded-[28px] bg-[var(--primary-blue)] text-white shadow-[0_22px_70px_rgba(20,32,55,0.16)]">
                <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[var(--primary-yellow1)]">
                            <Newspaper className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                Информация
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                                Новости и обновления
                            </h2>
                        </div>
                    </div>

                    {items.length > 0 ? (
                        <div className="mt-6 grid gap-4 lg:grid-cols-3">
                            {items.slice(0, 3).map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/news/${item.id}`}
                                    className="group block overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.06] backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.09]"
                                >
                                    {item.imageUrl && (
                                        <div className="relative h-44 w-full overflow-hidden">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                                sizes="(min-width:1024px) 33vw, 100vw"
                                            />
                                        </div>
                                    )}
                                    <article className="flex min-h-[250px] flex-col p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                            {formatDate(item.createdAt)}
                                        </p>
                                        <h3 className="mt-3 text-xl font-semibold text-white transition group-hover:text-[var(--primary-yellow1)]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-3 line-clamp-5 flex-1 text-sm leading-6 text-slate-200">
                                            {item.content}
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-yellow1)]">
                                            <span>Читать полностью</span>
                                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-[22px] border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm text-slate-200">
                            Новости ещё не добавлены.{' '}
                            <Link href="/admin" className="font-semibold text-[var(--primary-yellow1)] hover:underline">
                                Открыть админ-панель
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
