'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { registerAction, type RegisterState } from '../actions';

const initialState: RegisterState = { ok: false };

const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200';

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, initialState);
    const [consentChecked, setConsentChecked] = useState(false);

    return (
        <>
            <form action={formAction} className="space-y-5">
                <div>
                    <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-slate-700">
                        Название компании *
                    </label>
                    <input id="companyName" name="companyName" required className={inputClass} />
                    {state.errors?.companyName && <p className="mt-2 text-sm text-rose-600">{state.errors.companyName}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="inn" className="mb-2 block text-sm font-medium text-slate-700">
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
                            className={inputClass}
                        />
                        {state.errors?.inn && <p className="mt-2 text-sm text-rose-600">{state.errors.inn}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                            Email *
                        </label>
                        <input type="email" id="email" name="email" required className={inputClass} />
                        {state.errors?.email && <p className="mt-2 text-sm text-rose-600">{state.errors.email}</p>}
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                            Пароль *
                        </label>
                        <input type="password" id="password" name="password" required className={inputClass} />
                        {state.errors?.password && <p className="mt-2 text-sm text-rose-600">{state.errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-slate-700">
                            Повторите пароль *
                        </label>
                        <input type="password" id="confirm" name="confirm" required className={inputClass} />
                        {state.errors?.confirm && <p className="mt-2 text-sm text-rose-600">{state.errors.confirm}</p>}
                    </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={consentChecked}
                        onChange={(event) => setConsentChecked(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300"
                    />
                    <span>Даю согласие на обработку данных компании</span>
                </label>
                {state.errors?.consent && <p className="text-sm text-rose-600">{state.errors.consent}</p>}

                {state.message && <p className="text-sm text-rose-600">{state.message}</p>}

                <button
                    type="submit"
                    disabled={!consentChecked}
                    className="button-brand-primary flex h-12 w-full items-center justify-center px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Зарегистрироваться
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="font-medium text-slate-900 transition hover:text-slate-700">
                    Войти
                </Link>
            </p>
        </>
    );
}
