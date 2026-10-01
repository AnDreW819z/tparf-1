'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { registerAction, type RegisterState } from '../actions';

const initialState: RegisterState = { ok: false };

const inputClass =
    'h-11 w-full rounded border border-[#C9D0D8] bg-white px-3 text-[15px] text-[var(--ink)] outline-none transition focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]';

const labelClass = 'mb-1.5 block text-[13px] text-[#444]';

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, initialState);
    const [consentChecked, setConsentChecked] = useState(false);

    return (
        <>
            <form action={formAction} className="space-y-5">
                <div>
                    <label htmlFor="companyName" className={labelClass}>
                        Название компании *
                    </label>
                    <input id="companyName" name="companyName" required className={inputClass} />
                    {state.errors?.companyName && <p className="mt-2 text-sm text-rose-600">{state.errors.companyName}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="inn" className={labelClass}>
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
                        <label htmlFor="email" className={labelClass}>
                            Email *
                        </label>
                        <input type="email" id="email" name="email" required className={inputClass} />
                        {state.errors?.email && <p className="mt-2 text-sm text-rose-600">{state.errors.email}</p>}
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="password" className={labelClass}>
                            Пароль *
                        </label>
                        <input type="password" id="password" name="password" required className={inputClass} />
                        {state.errors?.password && <p className="mt-2 text-sm text-rose-600">{state.errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="confirm" className={labelClass}>
                            Повторите пароль *
                        </label>
                        <input type="password" id="confirm" name="confirm" required className={inputClass} />
                        {state.errors?.confirm && <p className="mt-2 text-sm text-rose-600">{state.errors.confirm}</p>}
                    </div>
                </div>

                <label className="flex items-start gap-2.5 rounded border border-[#e2e2e2] bg-[var(--gray-bg)] px-3.5 py-3.5" style={{ cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={consentChecked}
                        onChange={(event) => setConsentChecked(event.target.checked)}
                        className="mt-0.5 h-4 w-4"
                        style={{ accentColor: 'var(--blue-accent)' }}
                    />
                    <span className="text-[13.5px] leading-relaxed text-[#444]">Даю согласие на обработку данных компании</span>
                </label>
                {state.errors?.consent && <p className="text-sm text-rose-600">{state.errors.consent}</p>}

                {state.message && <p className="text-sm text-rose-600">{state.message}</p>}

                <button
                    type="submit"
                    disabled={!consentChecked}
                    className="button-brand-primary flex h-11 w-full items-center justify-center px-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Зарегистрироваться
                </button>
            </form>

            <p className="mt-5 text-center text-[13.5px] text-[#6b6b6b]">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="font-medium text-[var(--blue-accent)] hover:text-[var(--primary-blue)]">
                    Войти
                </Link>
            </p>
        </>
    );
}
