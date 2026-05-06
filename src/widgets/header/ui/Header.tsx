'use client';
import Link from 'next/link';
import { HeaderAuthButton } from './HeaderAuthButton';
import { HeaderSearch } from './HeaderSearch';
import type { User } from '@/shared/api/services/auth';
import s from './Header.module.css';
import Image from 'next/image';

interface HeaderProps {
    user: User | null;
}

export function Header({ user }: HeaderProps) {
    return (
        <header className={s.header}>
            <div className={s.inner}>
                <nav className={s.lc}>
                    <Link href="/" className="text-xl font-semibold mr-8">
                        <Image
                            src='/Logo.png'
                            alt='Торогово промышленное агенство'
                            width={100}
                            height={100}
                        />
                    </Link>
                    <Link
                        className="inline-flex items-center justify-center h-10 px-6 rounded-md button-primary transition-colors"
                        href={'/catalog'}
                    >
                        каталог
                    </Link>
                </nav>
                <HeaderSearch />
                <div className="flex justify-end items-center">
                    {/*<nav className={s.nav}>*/}
                    {/*    <Link href="/about" className="hover:underline">*/}
                    {/*        О компании*/}
                    {/*    </Link>*/}
                    {/*    <Link href="/contacts" className="hover:underline">*/}
                    {/*        Контакты*/}
                    {/*    </Link>*/}
                    {/*    <Link href="/support" className="hover:underline">*/}
                    {/*        Поддержка*/}
                    {/*    </Link>*/}
                    {/*</nav>*/}
                    <HeaderAuthButton user={user} />
                </div>
            </div>
        </header>
    );
}
