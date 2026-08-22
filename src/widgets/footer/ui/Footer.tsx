'use client';

import Image from 'next/image';
import Link from 'next/link';

const sectionLinks = [
    { href: '/catalog', label: 'Каталог' },
    { href: '/search', label: 'Поиск' },
    { href: '/cart', label: 'Корзина' },
];

const infoLinks = [
    { href: '/', label: 'Главная' },
    { href: '/auth/login', label: 'Войти' },
];

export function Footer() {
    return (
        <footer className="w-full bg-[#142137] text-slate-200">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4 break-words">
                        <Link href="/" aria-label="На главную" className="inline-flex items-center">
                            <Image
                                src="/Logo.png"
                                alt="Логотип"
                                width={180}
                                height={72}
                                className="h-16 w-auto object-contain sm:h-20"
                                unoptimized
                            />
                        </Link>
                        <p className="max-w-sm text-sm leading-6 text-slate-300">
                            Торгово-промышленное агентство. B2B-каталог оборудования и удобные сценарии для корпоративных закупок.
                        </p>
                    </div>

                    <div className="break-words">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Разделы
                        </div>
                        <ul className="space-y-3 text-sm">
                            {sectionLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="transition-colors hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="break-words">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Навигация
                        </div>
                        <ul className="space-y-3 text-sm">
                            {infoLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="transition-colors hover:text-white">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="break-words">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Контакты
                        </div>
                        <ul className="space-y-3 text-sm leading-6 text-slate-300">
                            <li>
                                <a href="tel:+79607957523" className="transition-colors hover:text-white">
                                    +7 (960) 795-75-23
                                </a>
                            </li>
                            <li>
                                <a href="tel:+79618722751" className="transition-colors hover:text-white">
                                    +7 (961) 872-27-51
                                </a>
                            </li>
                            <li>
                                <a href="mailto:tpa@tparf.ru" className="transition-colors hover:text-white">
                                    tpa@tparf.ru
                                </a>
                            </li>
                            <li>630132, Новосибирская область, г. Новосибирск, Нарымская ул., д. 9, кв. 89</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3 break-words pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} ООО «ТПА». Все права защищены.</span>
                    <span>TPARF — промышленный B2B-каталог для точной и спокойной работы с поставками.</span>
                </div>
            </div>
        </footer>
    );
}
