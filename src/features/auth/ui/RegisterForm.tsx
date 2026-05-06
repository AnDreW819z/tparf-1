'use client';
import Link from 'next/link';
import { useActionState } from 'react'; // ✅ Импорт из react
import { useState } from 'react';
import { registerAction, type RegisterState } from '../actions';
import { Button } from '@/shared/ui/button/ui/Button';

const initialState: RegisterState = { ok: false };

export function RegisterForm() {
    // ✅ useActionState вместо useFormState
    const [state, formAction] = useActionState(registerAction, initialState);
    const [consentChecked, setConsentChecked] = useState(false);

    return (
        <>
            <form action={formAction} className="space-y-4">
                <div>
                    <label htmlFor="companyName" className="block text-sm mb-1">
                        Название компании *
                    </label>
                    <input
                        id="companyName"
                        name="companyName"
                        required
                        className="w-full rounded border p-2"
                    />
                    {state.errors?.companyName && <p className="text-sm text-red-600">{state.errors.companyName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="inn" className="block text-sm mb-1">
                            ИНН *
                        </label>
                        <input
                            id="inn"
                            name="inn"
                            type="tel"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            inputMode="numeric"
                            placeholder="1234567890"
                            required
                            className="w-full rounded border p-2"
                        />
                        {state.errors?.inn && <p className="text-sm text-red-600">{state.errors.inn}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full rounded border p-2"
                        />
                        {state.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm mb-1">
                            Пароль *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full rounded border p-2"
                        />
                        {state.errors?.password && <p className="text-sm text-red-600">{state.errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="confirm" className="block text-sm mb-1">
                            Повторите пароль *
                        </label>
                        <input
                            type="password"
                            id="confirm"
                            name="confirm"
                            required
                            className="w-full rounded border p-2"
                        />
                        {state.errors?.confirm && <p className="text-sm text-red-600">{state.errors.confirm}</p>}
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <span>Даю свое согласие на обработку персональных данных</span>
                </label>
                {state.errors?.consent && <p className="text-sm text-red-600">{state.errors.consent}</p>}

                {state.message && <p className="text-sm">{state.message}</p>}

                <Button type="submit" variant="primary" disabled={!consentChecked}>
                    Зарегистрироваться
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Войти
                </Link>
            </p>
        </>
    );
}
