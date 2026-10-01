// src/widgets/pagination/ui/Pagination.tsx
'use client';
import Link from 'next/link';
import clsx from 'clsx';

type Props = {
    basePath: string;    // например `/catalog/${id}`
    page: number;        // текущая страница (1-based)
    pageSize: number;    // текущий размер (фикс. 20)
    totalCount: number;  // всего элементов
    preserve?: Record<string, string | number | undefined>; // чтобы сохранять прочие query (фильтры)
};

function makeHref(basePath: string, p: number, pageSize: number, preserve?: Props['preserve']) {
    const params = new URLSearchParams();
    if (preserve) {
        Object.entries(preserve).forEach(([k, v]) => {
            if (v != null && v !== '') params.set(k, String(v));
        });
    }
    params.set('Page', String(p));
    params.set('PageSize', String(pageSize));
    return `${basePath}?${params.toString()}`;
}

function buildTokens(current: number, totalPages: number) {
    const tokens: Array<number | '...' | '<' | '>'> = [];

    if (totalPages <= 6) {
        // просто 1..N
        for (let i = 1; i <= totalPages; i++) tokens.push(i);
        return tokens;
    }

    const isFirst = current === 1;
    const isLast = current === totalPages;
    const inFirstBlock = current >= 1 && current <= 4;   // 1,2,3,4
    const inLastBlock = current >= totalPages - 2;       // N-2, N-1, N

    // Стрелка влево (если не на первой)
    if (!isFirst) tokens.push('<');

    if (inFirstBlock) {
        // 1 2 3 4 5 ... N
        tokens.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (inLastBlock) {
        // 1 ... N-4 N-3 N-2 N-1 N
        tokens.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        // центр:  < 1 ... P-1 P P+1 ... N >
        tokens.push(1, '...', current - 1, current, current + 1, '...', totalPages);
    }

    // Стрелка вправо (если не на последней)
    if (!isLast) tokens.push('>');

    return tokens;
}

export function Pagination({ basePath, page, pageSize, totalCount, preserve }: Props) {
    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 20)));
    if (totalPages <= 1) return null;

    const tokens = buildTokens(page, totalPages);

    return (
        <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Пагинация">
            {tokens.map((t, idx) => {
                if (t === '...') {
                    return (
                        <span
                            key={`dots-${idx}`}
                            className="min-w-10 h-10 px-3 inline-flex items-center justify-center text-sm text-gray-500 select-none"
                            aria-hidden="true"
                        >
              ...
            </span>
                    );
                }

                if (t === '<') {
                    const target = Math.max(1, page - 1);
                    return (
                        <Link
                            key="prev"
                            href={makeHref(basePath, target, pageSize, preserve)}
                            className="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-full border border-[#d8d8d8] bg-white px-2 text-[13px] font-bold text-[#555]"
                            style={{ fontFamily: 'var(--font-display)' }}
                            aria-label="Предыдущая страница"
                        >
                            {'<'}
                        </Link>
                    );
                }

                if (t === '>') {
                    const target = Math.min(totalPages, page + 1);
                    return (
                        <Link
                            key="next"
                            href={makeHref(basePath, target, pageSize, preserve)}
                            className="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-full border border-[#d8d8d8] bg-white px-2 text-[13px] font-bold text-[#555]"
                            style={{ fontFamily: 'var(--font-display)' }}
                            aria-label="Следующая страница"
                        >
                            {'>'}
                        </Link>
                    );
                }

                // Числовая кнопка
                const p = t as number;
                const active = p === page;
                return (
                    <Link
                        key={p}
                        href={makeHref(basePath, p, pageSize, preserve)}
                        className={clsx(
                            'inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-full border px-2 text-[13px] font-bold',
                            active
                                ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)] text-white'
                                : 'border-[#d8d8d8] bg-white text-[#555]'
                        )}
                        style={{ fontFamily: 'var(--font-display)' }}
                        aria-current={active ? 'page' : undefined}
                    >
                        {p}
                    </Link>
                );
            })}
        </nav>
    );
}
