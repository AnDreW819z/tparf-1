import Link from 'next/link';

type AuthTab = 'login' | 'register';

const tabs: { id: AuthTab; href: string; label: string }[] = [
    { id: 'login', href: '/auth/login', label: 'Вход' },
    { id: 'register', href: '/auth/register', label: 'Регистрация компании' },
];

/** Карточка входа/регистрации с двумя вкладками. Каждая вкладка — отдельная страница со своим адресом. */
export function AuthCard({ active, title, subtitle, children }: {
    active: AuthTab;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex justify-center px-7 py-12">
            <div className="w-full max-w-[520px] rounded-md border border-[var(--line)] bg-white">
                <nav aria-label="Вход или регистрация" className="flex border-b border-[var(--line)]">
                    {tabs.map((tab) => {
                        const isActive = tab.id === active;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={
                                    '-mb-px flex h-14 flex-1 items-center justify-center border-b-2 text-base ' +
                                    (isActive
                                        ? 'border-[var(--primary-blue)] font-semibold text-[var(--ink)]'
                                        : 'border-transparent font-medium text-[var(--muted)] hover:text-[var(--ink)]')
                                }
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex flex-col gap-5 p-8">
                    <h1 className="sr-only">{title}</h1>
                    <p className="m-0 text-[15px] text-[var(--muted)]">{subtitle}</p>
                    {children}
                </div>
            </div>
        </section>
    );
}
