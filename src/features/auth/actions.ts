'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ZodError } from 'zod';
import { loginSchema, registerSchema } from './validation';
import { register, login as loginApi } from '@/shared/api/services/auth';

export type RegisterState = { ok: boolean; errors?: Record<string, string>; message?: string };
export type LoginState = { ok: boolean; errors?: Record<string, string>; message?: string };

function isZodError(error: unknown): error is ZodError {
    return !!error && typeof error === 'object' && 'issues' in (error as any) && Array.isArray((error as any).issues);
}

function extractErrors(error: ZodError) {
    const errors: Record<string, string> = {};

    for (const issue of error.issues) {
        const firstPathItem = Array.isArray(issue.path) ? issue.path[0] : undefined;
        const key = typeof firstPathItem === 'string' ? firstPathItem : 'form';

        if (!errors[key]) {
            errors[key] = issue.message;
        }
    }

    return errors;
}

async function shouldUseSecureCookie() {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get('x-forwarded-proto');
    const host = requestHeaders.get('host') ?? '';

    if (forwardedProto) {
        return forwardedProto.toLowerCase().includes('https');
    }

    const isLocalHost = /^localhost(?::\d+)?$/i.test(host) || /^127\.0\.0\.1(?::\d+)?$/i.test(host);
    return process.env.NODE_ENV === 'production' && !isLocalHost;
}

function extractApiMessage(error: unknown, fallback: string) {
    const responseData = (error as any)?.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
        return responseData;
    }

    if (Array.isArray(responseData)) {
        const descriptions = responseData
            .map((item) => item?.description || item?.message || item?.code)
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

        if (descriptions.length > 0) {
            return descriptions.join('\n');
        }
    }

    if (responseData?.errors && typeof responseData.errors === 'object') {
        const messages = Object.values(responseData.errors)
            .flatMap((value) => Array.isArray(value) ? value : [value])
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

        if (messages.length > 0) {
            return messages.join('\n');
        }
    }

    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
        return responseData.message;
    }

    return fallback;
}

export async function registerAction(_: RegisterState, formData: FormData): Promise<RegisterState> {
    try {
        const parsed = registerSchema.pick({
            email: true,
            password: true,
            companyName: true,
            inn: true,
            confirm: true,
            consent: true,
        }).parse({
            email: formData.get('email'),
            password: formData.get('password'),
            companyName: formData.get('companyName'),
            inn: formData.get('inn'),
            confirm: formData.get('confirm'),
            consent: formData.get('consent') === 'on',
        });

        const response = await register({
            email: parsed.email,
            password: parsed.password,
            companyName: parsed.companyName,
            inn: Number(parsed.inn),
        });

        const cookieStore = await cookies();
        const secure = await shouldUseSecureCookie();

        cookieStore.set({
            name: 'auth_token',
            value: response.token,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure,
            maxAge: 60 * 60 * 24 * 7,
        });
    } catch (error: unknown) {
        if (isZodError(error)) {
            return { ok: false, errors: extractErrors(error) };
        }

        return {
            ok: false,
            message: extractApiMessage(
                error,
                'Ошибка регистрации. Проверьте введённые данные и повторите попытку.'
            ),
        };
    }

    redirect('/cart');
}

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
    try {
        const parsed = loginSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        const response = await loginApi({ email: parsed.email, password: parsed.password });

        const cookieStore = await cookies();
        const secure = await shouldUseSecureCookie();

        cookieStore.set({
            name: 'auth_token',
            value: response.token,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure,
            maxAge: 60 * 60 * 24 * 7,
        });
    } catch (error: unknown) {
        if (isZodError(error)) {
            return { ok: false, errors: extractErrors(error) };
        }

        return {
            ok: false,
            message: extractApiMessage(
                error,
                'Не удалось выполнить вход. Проверьте email и пароль.'
            ),
        };
    }

    redirect('/cart');
}
