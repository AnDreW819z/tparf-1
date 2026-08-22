import Link from 'next/link';
import { confirmEmail } from '@/shared/api/services/auth';

export const metadata = {
    title: 'Подтверждение email',
};

type ConfirmEmailPageProps = {
    searchParams?: Promise<{
        userId?: string;
        token?: string;
        status?: string;
    }>;
};

type ConfirmationState = {
    title: string;
    description: string;
    success: boolean;
};

function getStateFromStatus(status?: string): ConfirmationState | null {
    if (status === 'success') {
        return {
            title: 'Email подтверждён',
            description: 'Адрес электронной почты подтверждён. Теперь вы можете войти и продолжить работу с площадкой.',
            success: true,
        };
    }

    if (status === 'error') {
        return {
            title: 'Не удалось подтвердить email',
            description: 'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.',
            success: false,
        };
    }

    return null;
}

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
    const params = (await searchParams) ?? {};
    let state = getStateFromStatus(params.status);

    if (!state && params.userId && params.token) {
        try {
            await confirmEmail(params.userId, params.token);
            state = {
                title: 'Email подтверждён',
                description: 'Адрес электронной почты подтверждён. Теперь вы можете войти и продолжить работу с площадкой.',
                success: true,
            };
        } catch {
            state = {
                title: 'Не удалось подтвердить email',
                description: 'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.',
                success: false,
            };
        }
    }

    if (!state) {
        state = {
            title: 'Некорректная ссылка подтверждения',
            description: 'В ссылке не хватает данных для подтверждения email. Откройте письмо ещё раз и перейдите по полной ссылке.',
            success: false,
        };
    }

    const badgeClass = state.success
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : 'bg-rose-100 text-rose-700 border-rose-200';

    return (
        <section className="bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
                        {state.success ? 'Готово' : 'Проверка'}
                    </div>
                    <h1 className="mt-5 text-3xl font-semibold text-slate-950">{state.title}</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{state.description}</p>
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
