'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ZodError } from 'zod';
import { loginSchema, registerSchema } from './validation';
import { login as loginApi, register } from '@/shared/api/services/auth';

export type RegisterState = { ok: boolean; errors?: Record<string, string>; message?: string };
export type LoginState = { ok: boolean; errors?: Record<string, string>; message?: string };

type ApiErrorPayload =
	| string
	| {
			message?: string;
			errors?: Record<string, string | string[]>;
	  }
	| Array<{ description?: string; message?: string; code?: string }>
	| undefined;

function isZodError(error: unknown): error is ZodError {
	return !!error && typeof error === 'object' && 'issues' in error;
}

function extractErrors(error: ZodError) {
	const errors: Record<string, string> = {};

	for (const issue of error.issues) {
		const first = Array.isArray(issue.path) ? issue.path[0] : undefined;
		const key = typeof first === 'string' ? first : 'form';
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
	const response = (
		error as {
			response?: {
				status?: number;
				data?: ApiErrorPayload;
			};
		}
	).response;

	// Ответа нет вовсе — сервер недоступен, дело не в введённых данных.
	if (!response) {
		return 'Сервер не отвечает. Проверьте подключение к интернету и попробуйте ещё раз через минуту.';
	}

	const responseData = response.data;

	if (typeof responseData === 'string' && responseData.trim()) {
		return responseData;
	}

	if (Array.isArray(responseData)) {
		const descriptions = responseData
			.map((item) => item.description || item.message || item.code)
			.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

		if (descriptions.length > 0) {
			// Identity на занятый email присылает две одинаковые ошибки (DuplicateUserName и DuplicateEmail).
			return [...new Set(descriptions)].join('\n');
		}
	}

	if (responseData && typeof responseData === 'object' && 'errors' in responseData && responseData.errors) {
		const messages = Object.values(responseData.errors)
			.flatMap((value) => (Array.isArray(value) ? value : [value]))
			.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

		if (messages.length > 0) {
			return [...new Set(messages)].join('\n');
		}
	}

	if (responseData && typeof responseData === 'object' && 'message' in responseData) {
		const message = responseData.message;
		if (typeof message === 'string' && message.trim()) {
			return message;
		}
	}

	if (response.status && response.status >= 500) {
		return 'На сервере произошла ошибка. Попробуйте ещё раз чуть позже.';
	}

	return fallback;
}

export async function registerAction(_: RegisterState, formData: FormData): Promise<RegisterState> {
	let registeredEmail = '';

	try {
		const parsed = registerSchema.parse({
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
			inn: parsed.inn,
		});
		registeredEmail = parsed.email;

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
				'Ошибка регистрации. Проверьте введённые данные и повторите попытку.',
			),
		};
	}

	redirect(`/auth/register/success?email=${encodeURIComponent(registeredEmail)}`);
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
				'Не удалось выполнить вход. Проверьте email и пароль.',
			),
		};
	}

	redirect('/cart');
}
