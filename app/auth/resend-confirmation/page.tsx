import Link from 'next/link';
import { ResendConfirmationForm } from '@/features/auth/ui/ResendConfirmationForm';

export const metadata = { title: 'Подтверждение email' };

export default function ResendConfirmationPage() {
    return (
        <section className="flex justify-center px-7 py-12">
            <div className="w-full max-w-[520px] rounded-md border border-[var(--line)] bg-white p-8">
                <h1 className="heading-1 text-2xl">Подтверждение email</h1>
                <p className="mt-3 text-[15px] leading-6 text-[var(--muted)]">
                    Укажите email, на который зарегистрирован аккаунт. Мы отправим новую ссылку
                    для подтверждения — старая после этого перестанет действовать.
                </p>

                <ResendConfirmationForm />

                <p className="mt-5 text-center text-[13.5px] text-[#6b6b6b]">
                    <Link
                        href="/auth/login"
                        className="font-medium text-[var(--blue-accent)] hover:text-[var(--primary-blue)]"
                    >
                        Вернуться ко входу
                    </Link>
                </p>
            </div>
        </section>
    );
}
