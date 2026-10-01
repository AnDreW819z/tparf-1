'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { registerAction, type RegisterState } from '../actions';
import { useLiveValidation } from '../lib/useLiveValidation';
import { registerSchema } from '../validation';
import { FieldError, inputClassFor } from './FieldError';

const initialState: RegisterState = { ok: false };

const labelClass = 'mb-1.5 block text-[13px] text-[#444]';

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, initialState);
    const [consentChecked, setConsentChecked] = useState(false);
    const { formProps, errorFor } = useLiveValidation(registerSchema, state.errors);

    return (
        <>
            <form action={formAction} {...formProps} className="space-y-5">
                <div>
                    <label htmlFor="companyName" className={labelClass}>
                        Название компании *
                    </label>
                    <input
                        id="companyName"
                        name="companyName"
                        required
                        autoComplete="organization"
                        aria-invalid={!!errorFor('companyName')}
                        aria-describedby="companyName-error"
                        className={inputClassFor(errorFor('companyName'))}
                    />
                    <FieldError id="companyName-error" message={errorFor('companyName')} />
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
                            inputMode="numeric"
                            maxLength={16}
                            placeholder="10 цифр, для ИП — 12"
                            required
                            aria-invalid={!!errorFor('inn')}
                            aria-describedby="inn-error"
                            className={inputClassFor(errorFor('inn'))}
                        />
                        <FieldError id="inn-error" message={errorFor('inn')} />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            autoComplete="email"
                            aria-invalid={!!errorFor('email')}
                            aria-describedby="email-error"
                            className={inputClassFor(errorFor('email'))}
                        />
                        <FieldError id="email-error" message={errorFor('email')} />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="password" className={labelClass}>
                            Пароль *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            autoComplete="new-password"
                            aria-invalid={!!errorFor('password')}
                            aria-describedby="password-error"
                            className={inputClassFor(errorFor('password'))}
                        />
                        <FieldError
                            id="password-error"
                            message={errorFor('password')}
                            hint="Не короче 8 символов, хотя бы одна цифра"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm" className={labelClass}>
                            Повторите пароль *
                        </label>
                        <input
                            type="password"
                            id="confirm"
                            name="confirm"
                            required
                            autoComplete="new-password"
                            aria-invalid={!!errorFor('confirm')}
                            aria-describedby="confirm-error"
                            className={inputClassFor(errorFor('confirm'))}
                        />
                        <FieldError id="confirm-error" message={errorFor('confirm')} />
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
                <FieldError id="consent-error" message={errorFor('consent')} />

                {state.message && (
                    <p role="alert" className="whitespace-pre-line rounded border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                        {state.message}
                    </p>
                )}

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
