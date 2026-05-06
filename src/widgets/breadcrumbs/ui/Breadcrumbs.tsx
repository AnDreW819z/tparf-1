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
        <nav aria-label="breadcrumbs" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {fullCrumbs.map((c, i) => {
                    const isLast = i === fullCrumbs.length - 1;
                    return (
                        <li key={`${c.id || 'breadcrumb'}-${i}`} className="flex items-center">
                            {isLast ? (
                                <span className="font-medium text-gray-900">{c.title}</span>
                            ) : c.href ? (
                                <Link href={c.href} className="hover:underline hover:text-blue-600 transition-colors">
                                    {c.title}
                                </Link>
                            ) : (
                                <span>{c.title}</span>
                            )}
                            {!isLast && <span className="mx-2 select-none text-gray-400 text-xs">{'>'}</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}