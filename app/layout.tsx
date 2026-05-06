import { getUserFromCookie } from '@/shared/server/auth';
import { ClientRoot } from './ClientRoot';
import { ReactQueryProvider } from '@/app/providers';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import './globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await getUserFromCookie();
    return (
        <html lang="ru">
        <body>
        <ReactQueryProvider>
            <ClientRoot>
                <Header user={user} />
                <main className="min-h-[70vh]">{children}</main>
                <Footer />
            </ClientRoot>
        </ReactQueryProvider>
        </body>
        </html>
    );
}
