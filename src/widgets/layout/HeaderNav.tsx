'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/widgets/auth/ui/LogoutButton';

export default function HeaderNav() {
    const pathname = usePathname();

    return (
        <div
            className="mb-8 flex items-center gap-8"
            style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16 }}
        >
            <nav className="flex items-center gap-8">
                <Link
                    href="/cart"
                    className="text-lg font-semibold transition-colors"
                    style={{
                        fontFamily: 'var(--font-display)',
                        color: pathname === '/cart' ? 'var(--ink)' : 'var(--muted)',
                    }}
                >
                    Корзина
                </Link>
                <Link
                    href="/orders"
                    className="text-lg font-semibold transition-colors"
                    style={{
                        fontFamily: 'var(--font-display)',
                        color: pathname === '/orders' ? 'var(--ink)' : 'var(--muted)',
                    }}
                >
                    Заказы
                </Link>
            </nav>
            <div className="flex-1" />
            <LogoutButton />
        </div>
    );
}
