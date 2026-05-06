'use client';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

export type CategoryCardProps = {
    id: string;
    name: string;
    href?: string;
    subtitle?: string;
    imageUrl?: string | null; // добавлено
    className?: string;
};

export function CategoryCard({ id, name, href, subtitle, imageUrl, className }: CategoryCardProps) {
    const to = href ?? `/catalog/${id}`;
    const src = imageUrl || '/placeholder.png'; // если logoUrl нет — показываем плейсхолдер
    return (
        <Link
            href={to}
            className={clsx(
                // базовый бордер и цвет текста
                'rounded-lg border border-[#DDDDDD] bg-white text-[#767676]',
                // ховер-эффект
                'transition-transform transition-colors duration-200 ease-out hover:scale-[1.02] hover:border-[#646464]',
                // содержимое
                'p-5 flex flex-col gap-3',
                className
            )}
        >
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded border border-[#DDDDDD] bg-white">
                <Image
                    src={src}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw"
                />
            </div>
            <div>
                <div className="text-base font-semibold text-[#767676]">{name}</div>
                {subtitle && <div className="mt-1 text-xs text-[#767676]">{subtitle}</div>}
            </div>
        </Link>
    );
}
