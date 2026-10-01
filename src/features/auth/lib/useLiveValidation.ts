'use client';

import type { FocusEvent, FormEvent } from 'react';
import { useCallback, useState } from 'react';
import type { ZodType } from 'zod';

type FieldErrors = Record<string, string>;

function readForm(form: HTMLFormElement) {
    const values: Record<string, string | boolean> = {};
    for (const element of Array.from(form.elements)) {
        if (!(element instanceof HTMLInputElement) || !element.name) continue;
        values[element.name] = element.type === 'checkbox' ? element.checked : element.value;
    }
    return values;
}

function collectErrors(schema: ZodType, form: HTMLFormElement): FieldErrors {
    const result = schema.safeParse(readForm(form));
    if (result.success) return {};

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !errors[field]) errors[field] = issue.message;
    }
    return errors;
}

/**
 * Проверка полей формы той же zod-схемой, что и на сервере, — сразу, а не после отправки:
 * при уходе с поля, при вводе в поле, где уже показана ошибка (чтобы она исчезла, как только исправлено),
 * и при отправке (форма с ошибками не уходит на сервер).
 * Ошибки сервера (serverErrors) показываются, пока пользователь не тронул поле.
 */
export function useLiveValidation(schema: ZodType, serverErrors?: FieldErrors) {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Set<string>>(() => new Set());

    const validate = useCallback(
        (form: HTMLFormElement, fields: string[]) => {
            const all = collectErrors(schema, form);
            setErrors((current) => {
                const next = { ...current };
                for (const field of fields) {
                    if (all[field]) next[field] = all[field];
                    else delete next[field];
                }
                return next;
            });
        },
        [schema],
    );

    const onBlur = useCallback(
        (event: FocusEvent<HTMLFormElement>) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.name || target.type === 'checkbox') return;
            // Пустое поле, из которого просто ушли табом, не ругаем — это сделает отправка.
            if (!target.value && !touched.has(target.name)) return;

            setTouched((current) => new Set(current).add(target.name));
            validate(event.currentTarget, [target.name]);
        },
        [touched, validate],
    );

    const onChange = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.name) return;

            // Пересчитываем поле, если по нему уже что-то показано, и зависимые от него поля.
            const fields = [target.name, ...(target.name === 'password' ? ['confirm'] : [])]
                .filter((field) => touched.has(field) || target.type === 'checkbox');
            if (fields.length) validate(event.currentTarget, fields);
        },
        [touched, validate],
    );

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            const all = collectErrors(schema, event.currentTarget);
            if (Object.keys(all).length === 0) return;

            event.preventDefault();
            setErrors(all);
            setTouched(new Set(Object.keys(all)));
            const firstInvalid = event.currentTarget.querySelector<HTMLInputElement>(
                `[name="${Object.keys(all)[0]}"]`,
            );
            firstInvalid?.focus();
        },
        [schema],
    );

    const errorFor = (field: string) => (touched.has(field) ? errors[field] : serverErrors?.[field]);

    return { formProps: { onBlur, onChange, onSubmit, noValidate: true }, errorFor };
}
