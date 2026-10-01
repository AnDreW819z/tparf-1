// src/widgets/breadcrumbs/ui/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { CategoryCrumb } from '@/entities/category/model/types';

type Props = {
    crumbs: CategoryCrumb[]; // [{id, title}] из node.pathItems
    className?: string;
    /** Последний элемент (например, название товара) — не ссылка */
    currentName?: string;
};

export function Breadcrumbs({ crumbs, className, currentName }: Props) {
    // Формируем полный список: "Главная" → "Каталог" → элементы pathItems → currentName
    const fullCrumbs: { id: string; title: string; href?: string }[] = [
        { id: '', title: 'Главная', href: '/' },
        { id: 'catalog', title: 'Каталог', href: '/catalog' },
        ...crumbs.map((c) => ({
            id: c.id,
            title: c.title,
            href: `/catalog/${c.id}`,
        })),
    ];

    // Если передан currentName (название товара), добавляем как последний элемент без ссылки
    if (currentName) {
        fullCrumbs.push({ id: '', title: currentName });
    }

    return (
        <nav aria-label="Хлебные крошки" className={className}>
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-[13px] text-[var(--muted)]">
                {fullCrumbs.map((c, i) => {
                    const isLast = i === fullCrumbs.length - 1;
                    return (
                        <li key={`${c.id || 'breadcrumb'}-${i}`} className="flex items-center gap-1.5">
                            {isLast ? (
                                <span aria-current="page" className="text-[var(--ink)]">{c.title}</span>
                            ) : c.href ? (
                                <Link href={c.href} className="text-[var(--muted)] transition-colors hover:text-[var(--primary-blue)]">
                                    {c.title}
                                </Link>
                            ) : (
                                <span>{c.title}</span>
                            )}
                            {!isLast && <span className="select-none" aria-hidden="true">/</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}