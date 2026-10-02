import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Ссылка на категорию. Если у категории есть внешняя ссылка (витрина другого сайта, например
 * производителя) — ведёт туда в новой вкладке, иначе на страницу категории в каталоге.
 */
export function CategoryLink({
    id,
    externalUrl,
    className,
    children,
    'aria-label': ariaLabel,
}: {
    id: string;
    externalUrl?: string | null;
    className?: string;
    children: ReactNode;
    'aria-label'?: string;
}) {
    if (externalUrl) {
        return (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel}>
                {children}
            </a>
        );
    }

    return (
        <Link href={`/catalog/${id}`} className={className} aria-label={ariaLabel}>
            {children}
        </Link>
    );
}
