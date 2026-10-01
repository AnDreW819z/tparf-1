'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClipboardList, LayoutGrid, LogOut, Search, Settings, ShoppingCart, User as UserIcon } from 'lucide-react';
import type { User } from '@/shared/api/services/auth';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { useCartStore } from '@/shared/store/useCartStore';
import s from './Header.module.css';

type HeaderUser = (User & { token?: string }) | null;

interface HeaderProps {
    user: HeaderUser;
}

export function Header({ user }: HeaderProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const cart = useCartStore((state) => state.cart);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const isAdmin = canAccessAdminPanel(user);
    const cartCount = cart?.items?.length ?? 0;

    useEffect(() => {
        if (user?.token && !cart) {
            void fetchCart(user.token);
        }
    }, [user?.token, cart, fetchCart]);

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalized = query.trim();
        if (!normalized) return;
        router.push(`/search?SearchQuery=${encodeURIComponent(normalized)}`);
    }

    async function handleLogout() {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        router.refresh();
        router.push('/auth/login');
    }

    return (
        <header className={s.header}>
            <div className={`${s.side} ${s.sideLeft}`} aria-hidden="true" />
            <div className={`${s.side} ${s.sideRight}`} aria-hidden="true" />

            <div className={s.panel}>
                <span className={`${s.fold} ${s.foldLeft}`} aria-hidden="true" />
                <span className={`${s.fold} ${s.foldRight}`} aria-hidden="true" />

                <div className={s.content}>
                    <Link href="/" className={s.brand} aria-label="Торгово-промышленное агентство — на главную">
                        <Image src="/Logo.png" alt="Торгово-промышленное агентство" width={114} height={50} priority />
                    </Link>

                    <Link href="/catalog" className={s.outlineBtn}>
                        <LayoutGrid size={15} strokeWidth={1.9} aria-hidden="true" />
                        <span className={s.label}>Каталог</span>
                    </Link>

                    <form role="search" className={s.search} onSubmit={submitSearch}>
                        <label htmlFor="header-search" className="sr-only">
                            Поиск по каталогу
                        </label>
                        <input
                            id="header-search"
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Название, артикул или бренд"
                        />
                        <button type="submit" aria-label="Найти">
                            <Search size={17} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                    </form>

                    <nav className={s.nav} aria-label="Личный кабинет">
                        <Link href="/search" className={`${s.navLink} ${s.searchIconOnly}`} aria-label="Поиск">
                            <Search size={16} strokeWidth={1.9} aria-hidden="true" />
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={s.navLink}>
                                <Settings size={16} strokeWidth={1.9} aria-hidden="true" />
                                <span className={s.label}>Админ</span>
                            </Link>
                        )}
                        <Link href={user ? '/orders' : '/auth/login'} className={s.navLink}>
                            <ClipboardList size={16} strokeWidth={1.9} aria-hidden="true" />
                            <span className={s.label}>Заказы</span>
                        </Link>
                        <Link href={user ? '/cart' : '/auth/login'} className={`${s.navLink} ${s.cartLink}`}>
                            <ShoppingCart size={16} strokeWidth={1.9} aria-hidden="true" />
                            <span className={s.label}>Корзина</span>
                            {cartCount > 0 && <span className={s.badge}>{cartCount}</span>}
                        </Link>
                        {user ? (
                            <button type="button" className={s.outlineBtn} onClick={handleLogout}>
                                <LogOut size={15} strokeWidth={1.9} aria-hidden="true" />
                                <span className={s.label}>Выйти</span>
                            </button>
                        ) : (
                            <Link href="/auth/login" className={s.outlineBtn}>
                                <UserIcon size={15} strokeWidth={1.9} aria-hidden="true" />
                                <span className={s.label}>Войти</span>
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
