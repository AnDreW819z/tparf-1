'use client';

import { useActionState } from 'react';
import { resendConfirmationAction, type ResendState } from '../actions';
import { FieldError, inputClassFor } from './FieldError';

const initialState: ResendState = { ok: false };

export function ResendConfirmationForm() {
    const [state, formAction] = useActionState(resendConfirmationAction, initialState);

    return (
        <form action={formAction} className="mt-5 space-y-4">
            <div>
                <label htmlFor="resend-email" className="mb-1.5 block text-[13px] text-[#444]">
                    Email, указанный при регистрации
                </label>
                <input
                    id="resend-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    aria-invalid={!!state.errors?.email}
                    aria-describedby="resend-email-error"
                    className={inputClassFor(state.errors?.email)}
                />
                <FieldError id="resend-email-error" message={state.errors?.email} />
            </div>

            {state.message && (
                <p
                    role="status"
                    className={
                        state.ok
                            ? 'rounded border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800'
                            : 'rounded border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700'
                    }
                >
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                className="button-brand-primary flex h-11 w-full items-center justify-center px-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Отправить письмо
            </button>
        </form>
    );
}
