'use client';

import type { ReactNode } from 'react';
import { useId, useState } from 'react';

/** Карточка-«шторка»: заголовок раскрывает и сворачивает содержимое. По умолчанию свёрнута. */
export function CollapsibleCard({
    title,
    count,
    children,
    defaultOpen = false,
    compact = false,
}: {
    title: string;
    /** Сколько пунктов внутри — показывается рядом с заголовком, чтобы было видно, что там есть. */
    count?: number;
    children: ReactNode;
    defaultOpen?: boolean;
    compact?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = useId();
    const padding = compact ? 'px-6' : 'px-8';

    return (
        <section className="w-full max-w-full rounded-md border border-[#e2e2e2] bg-white">
            <h2 className="heading-1 text-xl">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => setIsOpen((value) => !value)}
                    className={`flex w-full items-center justify-between gap-4 ${padding} py-6 text-left`}
                >
                    <span className="min-w-0 break-words">
                        {title}
                        {count !== undefined && (
                            <span className="ml-2 text-base font-normal text-[#888]">{count}</span>
                        )}
                    </span>
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className={`h-5 w-5 shrink-0 text-[#888] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
            <div id={contentId} hidden={!isOpen} className={`min-w-0 ${padding} pb-8`}>
                {children}
            </div>
        </section>
    );
}
