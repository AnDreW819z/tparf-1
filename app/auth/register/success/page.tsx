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
        <section className="bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="inline-flex rounded-full bg-[#142137] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e7dc12]">
                        TPARF
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold text-slate-950">Регистрация прошла успешно</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                        Аккаунт создан. Чтобы завершить регистрацию, откройте письмо и подтвердите email.
                    </p>
                    {email ? (
                        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Письмо отправлено на: <span className="font-semibold text-slate-950">{email}</span>
                        </p>
                    ) : null}
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                        Если письма нет во входящих, проверьте папку спама или подождите несколько минут.
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
                            className="button-brand-secondary flex h-12 items-center justify-center px-5 text-sm font-semibold"
                        >
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
