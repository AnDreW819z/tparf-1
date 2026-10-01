'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/features/auth/actions';

const initialState: LoginState = { ok: false };

const inputClass =
    'h-11 w-full rounded border border-[#C9D0D8] bg-white px-3 text-[15px] text-[var(--ink)] outline-none transition focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]';

function SubmitBtn() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="button-brand-primary flex h-11 w-full items-center justify-center px-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? 'Входим...' : 'Войти'}
        </button>
    );
}

export function LoginForm() {
    const [state, formAction] = useActionState(loginAction, initialState);

    return (
        <>
            <form action={formAction} className="space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Email</label>
                    <input type="email" name="email" className={inputClass} required autoComplete="email" />
                    {state.errors?.email && <p className="mt-2 text-sm text-rose-600">{state.errors.email}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Пароль</label>
                    <input
                        type="password"
                        name="password"
                        className={inputClass}
                        required
                        autoComplete="current-password"
                    />
                    {state.errors?.password && <p className="mt-2 text-sm text-rose-600">{state.errors.password}</p>}
                </div>

                {state.message && <p className="text-sm text-rose-600">{state.message}</p>}

                <SubmitBtn />
            </form>

            <p className="mt-5 text-center text-[13.5px] text-[#6b6b6b]">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="font-medium text-[var(--blue-accent)] hover:text-[var(--primary-blue)]">
                    Зарегистрироваться
                </Link>
            </p>
        </>
    );
}
