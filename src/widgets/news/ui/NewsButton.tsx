import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Кнопка-призыв под новостью. Внутренние ссылки (/catalog/…) — переходом по сайту, внешние — в новой вкладке. */
export function NewsButton({
    url,
    text,
    className = '',
}: {
    url?: string | null;
    text?: string | null;
    className?: string;
}) {
    const href = url?.trim();
    if (!href) return null;

    const label = text?.trim() || 'Подробнее';
    const classes = `button-brand-primary inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold hover:text-white ${className}`;

    if (/^https?:\/\//i.test(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
                {label}
                <ArrowRight size={16} aria-hidden="true" />
            </a>
        );
    }

    return (
        <Link href={href} className={classes}>
            {label}
            <ArrowRight size={16} aria-hidden="true" />
        </Link>
    );
}
