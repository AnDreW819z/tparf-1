import Link from 'next/link';
import { Check, X } from 'lucide-react';

/** Экран результата подтверждения email: всё по центру — значок, заголовок, текст, кнопки. */
export function ConfirmEmailResult({
    success,
    title,
    description,
}: {
    success: boolean;
    title: string;
    description: string;
}) {
    return (
        <section className="flex min-h-[60vh] items-center justify-center px-5 py-14">
            <div className="flex w-full max-w-[480px] flex-col items-center text-center">
                <div
                    aria-hidden="true"
                    className={[
                        'flex h-[72px] w-[72px] items-center justify-center rounded-full ring-8',
                        success ? 'bg-[#067647] ring-[#ECFDF3]' : 'bg-[#B42318] ring-[#FEF3F2]',
                    ].join(' ')}
                >
                    {success ? <Check size={36} strokeWidth={2.5} color="#fff" /> : <X size={36} strokeWidth={2.5} color="#fff" />}
                </div>

                <h1 className="heading-1 m-0 mt-8 text-[28px] leading-tight">{title}</h1>
                <p className="m-0 mt-3 text-[15px] leading-6 text-[var(--muted)]">{description}</p>

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                    <Link
                        href="/auth/login"
                        className="button-brand-primary flex h-12 items-center justify-center px-5 text-sm font-semibold hover:text-white"
                    >
                        {success ? 'Войти' : 'Ко входу'}
                    </Link>
                    <Link href="/" className="button-brand-outline flex h-12 items-center justify-center px-5 text-sm font-semibold">
                        На главную
                    </Link>
                </div>

                {!success && (
                    <p className="m-0 mt-6 text-[13px] leading-5 text-[var(--muted)]">
                        Не получается? Позвоните{' '}
                        <a href="tel:+79607957523" className="font-medium text-[var(--primary-blue)]">
                            +7 (960) 795-75-23
                        </a>{' '}
                        или напишите на{' '}
                        <a href="mailto:tpa@tparf.ru" className="font-medium text-[var(--primary-blue)]">
                            tpa@tparf.ru
                        </a>
                        .
                    </p>
                )}
            </div>
        </section>
    );
}
