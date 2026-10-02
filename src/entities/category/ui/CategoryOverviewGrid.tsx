import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { CategoryLink } from './CategoryLink';

export type CategoryOverviewItem = {
    id: string;
    name: string;
    imageUrl: string | null;
    /** Внешняя ссылка: категория ведёт на другой сайт (в новой вкладке). */
    externalUrl?: string | null;
    children: { id: string; name: string }[];
};

/** Сетка категорий «картинка + название + до 4 подкатегорий» — главная и корень каталога */
export function CategoryOverviewGrid({ items }: { items: CategoryOverviewItem[] }) {
    return (
        <div className="grid border-l border-t border-[var(--line)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))]">
            {items.map((category) => (
                <div key={category.id} className="flex items-start gap-5 border-b border-r border-[var(--line)] p-6">
                    <CategoryLink
                        id={category.id}
                        externalUrl={category.externalUrl}
                        className="relative flex h-[88px] w-[88px] flex-none items-center justify-center overflow-hidden rounded bg-[#F0F3F7] text-[#8A95A5]"
                        aria-label={category.name}
                    >
                        {category.imageUrl ? (
                            <Image src={category.imageUrl} alt="" fill className="photo-blend object-contain p-2" sizes="88px" />
                        ) : (
                            <ImageIcon className="h-7 w-7" aria-hidden="true" />
                        )}
                    </CategoryLink>
                    <div className="flex min-w-0 flex-col gap-2.5">
                        <CategoryLink
                            id={category.id}
                            externalUrl={category.externalUrl}
                            className="inline-flex items-center gap-1.5 text-[17px] font-semibold text-[var(--ink)]"
                        >
                            {category.name}
                            {category.externalUrl && (
                                <ExternalLink className="h-4 w-4 flex-none text-[var(--muted)]" aria-label="откроется в новой вкладке" />
                            )}
                        </CategoryLink>
                        {category.children.length > 0 && (
                            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
                                {category.children.slice(0, 4).map((child) => (
                                    <li key={child.id}>
                                        <Link href={`/catalog/${child.id}`} className="text-[#3D4757] hover:text-[var(--primary-blue)]">
                                            {child.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
