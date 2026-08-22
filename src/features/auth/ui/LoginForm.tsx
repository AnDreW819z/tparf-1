'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/features/auth/actions';

const initialState: LoginState = { ok: false };

const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200';

function SubmitBtn() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="button-brand-primary flex h-12 w-full items-center justify-center px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" name="email" className={inputClass} required autoComplete="email" />
                    {state.errors?.email && <p className="mt-2 text-sm text-rose-600">{state.errors.email}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Пароль</label>
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

            <p className="mt-6 text-center text-sm text-slate-500">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="font-medium text-slate-900 transition hover:text-slate-700">
                    Зарегистрироваться
                </Link>
            </p>
        </>
    );
}
