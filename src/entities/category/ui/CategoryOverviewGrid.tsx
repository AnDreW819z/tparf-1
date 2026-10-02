import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, ImageIcon } from 'lucide-react';

export type CategoryOverviewItem = {
    id: string;
    name: string;
    imageUrl: string | null;
    /** Внешняя ссылка: категория ведёт на другой сайт (в новой вкладке). */
    externalUrl?: string | null;
    children: { id: string; name: string }[];
    /** Всего подразделов — если больше, чем передано в children, показываем «Ещё N». */
    childrenCount?: number;
    /** Товаров в разделе вместе с подразделами. */
    productCount?: number;
};

const VISIBLE_CHILDREN = 4;

function plural(n: number, one: string, few: string, many: string) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

/**
 * Название подраздела из фида поставщика бывает КАПСОМ («ГОЛОВКИ ТОРЦЕВЫЕ И ПРИНАДЛЕЖНОСТИ»).
 * Кириллицу целиком заглавными показываем с заглавной буквы; латинские аббревиатуры (DMR, LED) не трогаем.
 */
export function displayCategoryName(name: string) {
    const letters = name.match(/\p{L}/gu) ?? [];
    const isShoutingCyrillic =
        letters.length > 3 && /\p{Script=Cyrillic}/u.test(name) && letters.every((ch) => ch === ch.toUpperCase());
    if (!isShoutingCyrillic) return name;
    const lower = name.toLocaleLowerCase('ru-RU');
    return lower.charAt(0).toLocaleUpperCase('ru-RU') + lower.slice(1);
}

/** Сетка карточек разделов: главная и корень каталога. Карточка кликабельна целиком. */
export function CategoryOverviewGrid({ items }: { items: CategoryOverviewItem[] }) {
    return (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))] sm:gap-5">
            {items.map((category) => {
                const external = Boolean(category.externalUrl);
                const href = category.externalUrl || `/catalog/${category.id}`;
                const shownChildren = category.children.slice(0, VISIBLE_CHILDREN);
                const totalChildren = Math.max(category.childrenCount ?? 0, category.children.length);
                const moreChildren = totalChildren - shownChildren.length;

                return (
                    <article
                        key={category.id}
                        className="group relative flex items-start gap-5 rounded-lg border border-[var(--line)] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary-blue)] hover:shadow-[0_8px_24px_rgba(0,45,114,0.10)] sm:p-6"
                    >
                        <div className="relative flex h-[104px] w-[104px] flex-none items-center justify-center overflow-hidden rounded-md bg-[#F0F3F7] text-[#8A95A5]">
                            {category.imageUrl ? (
                                <Image src={category.imageUrl} alt="" fill className="photo-blend object-contain p-2.5" sizes="104px" />
                            ) : (
                                <ImageIcon className="h-8 w-8" aria-hidden="true" />
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <h3 className="m-0 text-[17px] font-semibold leading-snug text-[var(--ink)]">
                                {/* Растянутая ссылка: ::after накрывает всю карточку, подразделы лежат поверх неё. */}
                                {external ? (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-inherit after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover:text-[var(--primary-blue)]"
                                    >
                                        {category.name}
                                        <ExternalLink className="h-4 w-4 flex-none text-[var(--muted)]" aria-label="откроется в новой вкладке" />
                                    </a>
                                ) : (
                                    <Link
                                        href={href}
                                        className="text-inherit after:absolute after:inset-0 after:rounded-lg after:content-[''] group-hover:text-[var(--primary-blue)]"
                                    >
                                        {category.name}
                                    </Link>
                                )}
                            </h3>

                            {external ? (
                                <span className="text-[13px] text-[var(--muted)]">Сайт партнёра</span>
                            ) : (
                                category.productCount !== undefined &&
                                category.productCount > 0 && (
                                    <span className="text-[13px] text-[var(--muted)]">
                                        {category.productCount.toLocaleString('ru-RU')}{' '}
                                        {plural(category.productCount, 'товар', 'товара', 'товаров')}
                                    </span>
                                )
                            )}

                            {shownChildren.length > 0 && (
                                <ul className="relative z-10 m-0 mt-1 flex list-none flex-col gap-1.5 p-0 text-sm">
                                    {shownChildren.map((child) => (
                                        <li key={child.id}>
                                            <Link href={`/catalog/${child.id}`} className="text-[#3D4757] hover:text-[var(--primary-blue)] hover:underline">
                                                {displayCategoryName(child.name)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {moreChildren > 0 && (
                                <Link
                                    href={href}
                                    className="relative z-10 mt-0.5 inline-flex w-fit items-center gap-1 text-[13px] font-medium text-[var(--blue-accent)] hover:text-[var(--primary-blue)]"
                                >
                                    Ещё {moreChildren} {plural(moreChildren, 'раздел', 'раздела', 'разделов')}
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
