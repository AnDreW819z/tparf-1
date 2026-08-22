'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface HeaderSearchProps {
    compact?: boolean;
}

export function HeaderSearch({ compact = false }: HeaderSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const normalizedQuery = useMemo(() => query.trim(), [query]);

    function submitSearch() {
        if (!normalizedQuery) {
            return;
        }

        router.push(`/search?SearchQuery=${encodeURIComponent(normalizedQuery)}`);
    }

    const inputClass = compact
        ? 'h-9 rounded-full border-white/10 bg-white px-9 pr-10 text-sm text-slate-900 focus:border-[var(--primary-yellow1)] focus:ring-2 focus:ring-[rgba(221,213,33,0.2)]'
        : 'h-10 rounded-full border-white/12 bg-white px-9 pr-10 text-sm text-slate-900 focus:border-white focus:ring-2 focus:ring-white/20';

    return (
        <div className="min-w-0 flex-1">
            <form
                className="relative"
                onSubmit={(event) => {
                    event.preventDefault();
                    submitSearch();
                }}
            >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="search"
                    placeholder="Поиск товаров"
                    className={`w-full border outline-none transition ${inputClass}`}
                    aria-label="Поиск товаров"
                />
                {!query && (
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                        aria-label="Найти товары"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                )}
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                        aria-label="Очистить поиск"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>
        </div>
    );
}
