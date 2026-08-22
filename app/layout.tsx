// app/layout.tsx
import type { Metadata } from 'next';
import { getUserFromCookie } from '@/shared/server/auth';
import { ClientRoot } from './ClientRoot';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import './globals.css';

export const metadata: Metadata = {
    icons: {
        icon: '/favicon.png?v=2',
        shortcut: '/favicon.png?v=2',
        apple: '/favicon.png?v=2',
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserFromCookie();

    return (
        <html lang="ru">
            <body>
                <ClientRoot>
                    <Header user={user} />
                    <main className="min-h-[70vh] overflow-x-hidden">{children}</main>
                    <Footer />
                </ClientRoot>
            </body>
        </html>
    );
}
