'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { User } from '@/shared/api/services/auth';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { HeaderAuthButton } from './HeaderAuthButton';
import { HeaderSearch } from './HeaderSearch';
import s from './Header.module.css';

interface HeaderProps {
    user: User | null;
}

export function Header({ user }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartHref = user ? '/cart' : '/auth/login';

    const mobileMenuLinks = useMemo(() => {
        const links = [{ href: '/catalog', label: 'Каталог' }];

        if (user) {
            links.push({ href: '/orders', label: 'Заказы' });
        } else {
            links.push({ href: '/auth/login', label: 'Войти' });
        }

        if (canAccessAdminPanel(user)) {
            links.push({ href: '/admin', label: 'Админ' });
        }

        links.push({ href: cartHref, label: 'Корзина' });
        return links;
    }, [cartHref, user]);

    return (
        <>
            <header className={s.header}>
                <div className={s.mainbar}>
                    <div className={s.mainbarInner}>
                        <button
                            type="button"
                            className={s.iconButton}
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Открыть меню"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/" className={s.brand} aria-label="На главную">
                            <Image
                                src="/Logo.png"
                                alt="Торгово-промышленное агентство"
                                width={108}
                                height={108}
                                className={s.logo}
                                unoptimized
                                priority
                            />
                        </Link>

                        <div className={s.desktopNav}>
                            <Link href="/catalog" className={s.desktopNavLink}>
                                Каталог
                            </Link>
                            {canAccessAdminPanel(user) && (
                                <Link href="/admin" className={s.desktopNavLink}>
                                    Панель администратора
                                </Link>
                            )}
                        </div>

                        <div className={s.desktopSearch}>
                            <HeaderSearch />
                        </div>

                        <div className={s.desktopActions}>
                            <HeaderAuthButton user={user} />
                        </div>

                        <div className={s.mobileActions}>
                            <Link href={cartHref} className={s.iconButton} aria-label="Корзина">
                                <ShoppingCart className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={s.mobileSearchRow}>
                    <div className={s.mobileSearchInner}>
                        <HeaderSearch compact />
                    </div>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className={s.mobileOverlay} role="dialog" aria-modal="true">
                    <button
                        type="button"
                        className={s.backdrop}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Закрыть меню"
                    />
                    <div className={s.drawer}>
                        <div className={s.drawerHeader}>
                            <div>
                                <div className={s.drawerTitle}>Меню</div>
                                <div className={s.drawerSubtitle}>Навигация по основным разделам</div>
                            </div>
                            <button
                                type="button"
                                className={s.iconButton}
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Закрыть меню"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className={s.drawerNav}>
                            {mobileMenuLinks.map((link) => (
                                <Link
                                    key={`${link.href}-${link.label}`}
                                    href={link.href}
                                    className={s.drawerLink}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
