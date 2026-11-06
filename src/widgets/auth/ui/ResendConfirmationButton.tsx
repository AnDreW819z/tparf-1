'use client';

import { useState } from 'react';
import { resendConfirmation } from '@/shared/api/services/auth';

type ResendState = 'idle' | 'loading' | 'sent' | 'error';

export function ResendConfirmationButton({ email }: { email: string }) {
    const [state, setState] = useState<ResendState>('idle');

    const handleResend = async () => {
        setState('loading');
        try {
            await resendConfirmation(email);
            setState('sent');
        } catch {
            setState('error');
        }
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={handleResend}
                disabled={state === 'loading' || state === 'sent'}
                className="button-brand-outline h-10 px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
                {state === 'loading'
                    ? 'Отправляем…'
                    : state === 'sent'
                      ? 'Письмо отправлено'
                      : 'Отправить письмо ещё раз'}
            </button>

            <p role="status" aria-live="polite" className="mt-2 text-[12.5px] text-[#6b6b6b]">
                {state === 'sent' && 'Проверьте почту и папку «Спам».'}
                {state === 'error' && 'Не удалось отправить письмо. Попробуйте позже.'}
            </p>
        </div>
    );
}
