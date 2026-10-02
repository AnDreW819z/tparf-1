'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Единая карточка блока на странице товара: «Описание», «Характеристики», «Комплектация» и т. п.
 * Одинаковые рамка, отступы, заголовок со счётчиком и стрелкой — блоки выглядят как один набор.
 */
export function CollapsibleCard({
    title,
    count,
    children,
    defaultOpen = false,
}: {
    title: string;
    /** Сколько пунктов внутри — показывается рядом с заголовком, чтобы было видно, что там есть. */
    count?: number;
    children: ReactNode;
    defaultOpen?: boolean;
    /** Оставлено для совместимости: отступы теперь у всех карточек одинаковые. */
    compact?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = useId();

    return (
        <section className="w-full max-w-full rounded-md border border-[var(--line)] bg-white">
            <h2 className="heading-1 m-0 text-xl">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setIsOpen((value) => !value)}
                    className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left"
                >
                    <span className="min-w-0 break-words">
                        {title}
                        {count !== undefined && (
                            <span className="ml-2 text-base font-normal text-[var(--muted)]">{count}</span>
                        )}
                    </span>
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className={`h-5 w-5 shrink-0 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path
                            d="M5 7.5 10 12.5 15 7.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </h2>
            <div id={contentId} hidden={!isOpen} className="min-w-0 border-t border-[var(--line)] px-7 pb-6 pt-5">
                {children}
            </div>
        </section>
    );
}

/** Кнопка «Показать полностью / Свернуть» — одна и та же во всех карточках. */
export function ExpandToggle({
    expanded,
    onToggle,
    moreLabel = 'Показать полностью',
}: {
    expanded: boolean;
    onToggle: () => void;
    moreLabel?: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="mt-5 inline-flex h-10 items-center rounded border border-[#C9D0D8] bg-white px-4 text-sm font-medium text-[var(--primary-blue)] transition hover:border-[var(--primary-blue)]"
        >
            {expanded ? 'Свернуть' : moreLabel}
        </button>
    );
}

/**
 * Длинный текст обрезается по высоте (а не по символам — так не рвётся посередине слова),
 * снизу мягкое затухание и кнопка «Показать полностью». Короткий текст показывается целиком.
 */
export function ClampedBody({ children, maxHeight = 440 }: { children: ReactNode; maxHeight?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [overflows, setOverflows] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const check = () => setOverflows(element.scrollHeight > maxHeight + 60);
        check();
        const observer = new ResizeObserver(check);
        observer.observe(element);
        return () => observer.disconnect();
    }, [maxHeight]);

    const clamped = overflows && !expanded;

    return (
        <>
            <div className="relative">
                <div ref={ref} style={clamped ? { maxHeight, overflow: 'hidden' } : undefined}>
                    {children}
                </div>
                {clamped && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                )}
            </div>
            {overflows && <ExpandToggle expanded={expanded} onToggle={() => setExpanded((value) => !value)} />}
        </>
    );
}
