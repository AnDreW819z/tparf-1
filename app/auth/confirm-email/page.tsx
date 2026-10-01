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

    const badgeStyle = { background: state.success ? '#0f9d6a' : '#e0466f' };

    return (
        <section style={{ background: '#F0EFEF' }}>
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-md border border-[#e2e2e2] bg-white p-8 shadow-[0_8px_28px_rgba(0,46,109,0.1)] sm:p-10">
                    <div
                        className="inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ ...badgeStyle, fontFamily: 'var(--font-display)' }}
                    >
                        {state.success ? 'Готово' : 'Проверка'}
                    </div>
                    <h1 className="mt-5 heading-1 text-2xl">{state.title}</h1>
                    <p className="mt-3 text-sm leading-6 text-[#444]">{state.description}</p>
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
