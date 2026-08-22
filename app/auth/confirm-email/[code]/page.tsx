import Link from 'next/link';
import { confirmEmailByCode } from '@/shared/api/services/auth';

export const metadata = {
    title: 'Подтверждение email',
};

type ConfirmEmailByCodePageProps = {
    params: Promise<{
        code: string;
    }>;
};

export default async function ConfirmEmailByCodePage({ params }: ConfirmEmailByCodePageProps) {
    const { code } = await params;

    let success = false;
    let title = 'Не удалось подтвердить email';
    let description =
        'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.';

    try {
        await confirmEmailByCode(code);
        success = true;
        title = 'Email успешно подтверждён';
        description = 'Регистрация завершена. Теперь вы можете войти на площадку и продолжить работу.';
    } catch {
        success = false;
    }

    const badgeClass = success
        ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
        : 'border-rose-200 bg-rose-100 text-rose-700';

    return (
        <section className="bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
                        {success ? 'Подтверждено' : 'Ошибка'}
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold text-slate-950">{title}</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
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
