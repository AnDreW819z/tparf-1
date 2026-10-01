import Link from 'next/link';

export const metadata = {
    title: 'Регистрация завершена',
};

type RegisterSuccessPageProps = {
    searchParams?: Promise<{
        email?: string;
    }>;
};

export default async function RegisterSuccessPage({ searchParams }: RegisterSuccessPageProps) {
    const params = (await searchParams) ?? {};
    const email = params.email?.trim();

    return (
        <section style={{ background: '#F0EFEF' }}>
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-md border border-[#e2e2e2] bg-white p-8 shadow-[0_8px_28px_rgba(0,46,109,0.1)] sm:p-10">
                    <div className="inline-flex rounded-full bg-[var(--primary-blue)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--gold)]" style={{ fontFamily: 'var(--font-display)' }}>
                        TPARF
                    </div>
                    <h1 className="mt-5 heading-1 text-2xl">Регистрация прошла успешно</h1>
                    <p className="mt-3 text-sm leading-6 text-[#444]">
                        Аккаунт создан. Чтобы завершить регистрацию, откройте письмо и подтвердите email.
                    </p>
                    {email ? (
                        <p className="mt-4 text-sm text-[#444]">
                            Письмо с подтверждением отправлено на <span className="font-semibold text-[#1a1a1a]">{email}</span>
                        </p>
                    ) : null}
                    <div className="mt-2 text-[12.5px] text-[#999]">
                        Не пришло письмо? Проверьте папку «Спам» или подождите несколько минут.
                    </div>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/auth/login"
                            className="button-brand-primary flex h-12 items-center justify-center px-5 text-sm font-semibold"
                        >
                            Перейти ко входу
                        </Link>
                        <Link
                            href="/"
                            className="button-brand-outline flex h-12 items-center justify-center px-5 text-sm font-semibold"
                        >
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
