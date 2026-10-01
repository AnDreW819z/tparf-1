'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/features/auth/actions';
import { useLiveValidation } from '../lib/useLiveValidation';
import { loginSchema } from '../validation';
import { FieldError, inputClassFor } from './FieldError';

const initialState: LoginState = { ok: false };

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
    const { formProps, errorFor } = useLiveValidation(loginSchema, state.errors);

    return (
        <>
            <form action={formAction} {...formProps} className="space-y-5">
                <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        aria-invalid={!!errorFor('email')}
                        aria-describedby="login-email-error"
                        className={inputClassFor(errorFor('email'))}
                    />
                    <FieldError id="login-email-error" message={errorFor('email')} />
                </div>

                <div>
                    <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Пароль</label>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        aria-invalid={!!errorFor('password')}
                        aria-describedby="login-password-error"
                        className={inputClassFor(errorFor('password'))}
                    />
                    <FieldError id="login-password-error" message={errorFor('password')} />
                </div>

                {state.message && (
                    <p role="alert" className="whitespace-pre-line rounded border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                        {state.message}
                    </p>
                )}

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
