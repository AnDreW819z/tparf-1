'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/features/auth/actions';
import { Button } from '@/shared/ui/button/ui/Button';
import Link from 'next/link';

const initialState: LoginState = { ok: false };

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="primary" disabled={pending}>
            {pending ? 'Входим...' : 'Войти'}
        </Button>
    );
}

export function LoginForm() {
    // ✅ Заменено: useFormState → useActionState
    const [state, formAction] = useActionState(loginAction, initialState);

    return (
        <>
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full rounded border p-2"
                        required
                        autoComplete="email"
                    />
                    {state.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm mb-1">Пароль</label>
                    <input
                        type="password"
                        name="password"
                        className="w-full rounded border p-2"
                        required
                        autoComplete="current-password"
                    />
                    {state.errors?.password && <p className="text-sm text-red-600">{state.errors.password}</p>}
                </div>
                {state.message && <p className="text-sm text-red-600">{state.message}</p>}
                <SubmitBtn />
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Зарегистрироваться
                </Link>
            </p>
        </>
    );
}
