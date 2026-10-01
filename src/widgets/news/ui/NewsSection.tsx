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
        <section className="mx-auto my-14 max-w-[1280px] px-6">
            <div className="rounded-md p-10" style={{ background: 'var(--primary-blue)' }}>
                <div className="mb-7 flex items-center gap-3">
                    <span
                        className="flex h-8 w-8 flex-none items-center justify-center rounded"
                        style={{ background: 'var(--gold)' }}
                    >
                        <Newspaper className="h-4 w-4" style={{ color: 'var(--primary-blue)' }} />
                    </span>
                    <h2 className="heading-1 text-[22px]" style={{ color: '#ffffff' }}>
                        Информация / Новости и обновления
                    </h2>
                </div>

                {items.length > 0 ? (
                    <div className="grid gap-5 lg:grid-cols-3">
                        {items.slice(0, 3).map((item) => (
                            <Link
                                key={item.id}
                                href={`/news/${item.id}`}
                                className="group block overflow-hidden rounded-md border transition"
                                style={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.08)' }}
                            >
                                {item.imageUrl && (
                                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                            sizes="(min-width:1024px) 33vw, 100vw"
                                        />
                                    </div>
                                )}
                                <article className="p-4.5">
                                    <p className="mb-2 font-mono text-xs" style={{ color: '#9fb2cf' }}>
                                        {formatDate(item.createdAt)}
                                    </p>
                                    <h3
                                        className="mb-2 text-base font-bold leading-snug text-white"
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="mb-3.5 line-clamp-3 text-[13.5px] leading-relaxed" style={{ color: '#c3cfe4' }}>
                                        {item.content}
                                    </p>
                                    <div
                                        className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide"
                                        style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}
                                    >
                                        <span>Читать полностью</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div
                        className="rounded-md border border-dashed p-5 text-sm"
                        style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#9fb2cf' }}
                    >
                        Новости ещё не добавлены.{' '}
                        <Link href="/admin" className="font-bold" style={{ color: 'var(--gold)' }}>
                            Открыть админ-панель
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
