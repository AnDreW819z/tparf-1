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

    const badgeStyle = { background: success ? '#0f9d6a' : '#e0466f' };

    return (
        <section style={{ background: '#F0EFEF' }}>
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-md border border-[#e2e2e2] bg-white p-8 shadow-[0_8px_28px_rgba(0,46,109,0.1)] sm:p-10">
                    <div
                        className="inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ ...badgeStyle, fontFamily: 'var(--font-display)' }}
                    >
                        {success ? 'Подтверждено' : 'Ошибка'}
                    </div>
                    <h1 className="mt-5 heading-1 text-2xl">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-[#444]">{description}</p>
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
