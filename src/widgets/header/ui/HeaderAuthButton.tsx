'use client';

import Link from 'next/link';
import type { User } from '@/shared/api/services/auth';

interface HeaderAuthButtonProps {
    user: User | null;
}

const secondaryLinkClass =
    'inline-flex items-center justify-center min-h-[38px] rounded-full border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]';

const primaryLinkClass =
    'inline-flex items-center justify-center min-h-[38px] rounded-full px-4 text-sm font-semibold button-primary transition-colors';

export function HeaderAuthButton({ user }: HeaderAuthButtonProps) {
    if (user) {
        return (
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Link href="/cart" className={primaryLinkClass}>
                    Корзина
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/auth/login" className={secondaryLinkClass}>
                Войти
            </Link>
            <Link href="/auth/login" className={primaryLinkClass}>
                Корзина
            </Link>
        </div>
    );
}
