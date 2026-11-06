import { api } from '@/shared/api/axios';

/**
 * Серверные ручки аутентификации. Используются только server actions:
 * ответ содержит JWT, который сразу кладётся в HttpOnly-cookie и не возвращается в браузер.
 * В клиентский bundle этот модуль попадать не должен.
 */

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string };

export type RegisterPayload = {
    email: string;
    password: string;
    companyName: string;
    inn: string;
};

export type RegisterResponse = {
    token?: string;
    requiresEmailConfirmation?: boolean;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('auth/login', payload);
    return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('auth/register', payload);
    return data;
}
