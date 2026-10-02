'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type NewsFeedItem = {
    id: string;
    title: string;
    imageUrl: string | null;
    date: string;
};

/** Лента новостей под главной новостью: горизонтальная прокрутка с привязкой к карточкам и стрелками. */
export function NewsFeedSlider({ items, title = 'Другие новости' }: { items: NewsFeedItem[]; title?: string }) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const update = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setCanPrev(track.scrollLeft > 4);
        setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    }, []);

    useEffect(() => {
        update();
        const track = trackRef.current;
        if (!track) return;
        const observer = new ResizeObserver(update);
        observer.observe(track);
        return () => observer.disconnect();
    }, [update, items.length]);

    const scrollByPage = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        // Листаем на ширину видимой части минус одну карточку — предыдущая остаётся ориентиром.
        const card = track.querySelector('li')?.getBoundingClientRect().width ?? 260;
        track.scrollBy({ left: direction * Math.max(card, track.clientWidth - card), behavior: 'smooth' });
    };

    if (items.length === 0) return null;

    const arrowClass =
        'flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] disabled:pointer-events-none disabled:opacity-35';

    return (
        <div className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="m-0 text-lg font-semibold text-[var(--ink)]">{title}</h3>
                {(canPrev || canNext) && (
                    <div className="flex gap-2">
                        <button type="button" className={arrowClass} onClick={() => scrollByPage(-1)} disabled={!canPrev} aria-label="Предыдущие новости">
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button type="button" className={arrowClass} onClick={() => scrollByPage(1)} disabled={!canNext} aria-label="Следующие новости">
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            <ul
                ref={trackRef}
                onScroll={update}
                className="m-0 -mx-1 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:thin]"
            >
                {items.map((item) => (
                    <li key={item.id} className="w-[260px] flex-none snap-start sm:w-[280px]">
                        <Link
                            href={`/news/${item.id}`}
                            className="group flex h-full flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white transition hover:border-[var(--primary-blue)] hover:shadow-[0_8px_24px_rgba(0,45,114,0.10)]"
                        >
                            <span className="relative block aspect-video bg-[#F0F3F7] text-[#8A95A5]">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="280px" />
                                ) : (
                                    <span className="flex h-full items-center justify-center">
                                        <ImageIcon className="h-7 w-7" aria-hidden="true" />
                                    </span>
                                )}
                            </span>
                            <span className="flex flex-col gap-1.5 p-4">
                                <span className="font-mono text-xs text-[var(--muted)]">{item.date}</span>
                                <span className="line-clamp-3 text-[15px] font-medium leading-snug text-[var(--ink)] group-hover:text-[var(--primary-blue)]">
                                    {item.title}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
