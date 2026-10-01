import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

export type CategoryOverviewItem = {
    id: string;
    name: string;
    imageUrl: string | null;
    children: { id: string; name: string }[];
};

/** Сетка категорий «картинка + название + до 4 подкатегорий» — главная и корень каталога */
export function CategoryOverviewGrid({ items }: { items: CategoryOverviewItem[] }) {
    return (
        <div className="grid border-l border-t border-[var(--line)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))]">
            {items.map((category) => (
                <div key={category.id} className="flex items-start gap-5 border-b border-r border-[var(--line)] p-6">
                    <Link
                        href={`/catalog/${category.id}`}
                        className="relative flex h-[88px] w-[88px] flex-none items-center justify-center overflow-hidden rounded bg-[#F0F3F7] text-[#8A95A5]"
                        aria-label={category.name}
                    >
                        {category.imageUrl ? (
                            <Image src={category.imageUrl} alt="" fill className="object-contain p-2" sizes="88px" />
                        ) : (
                            <ImageIcon className="h-7 w-7" aria-hidden="true" />
                        )}
                    </Link>
                    <div className="flex min-w-0 flex-col gap-2.5">
                        <Link href={`/catalog/${category.id}`} className="text-[17px] font-semibold text-[var(--ink)]">
                            {category.name}
                        </Link>
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
