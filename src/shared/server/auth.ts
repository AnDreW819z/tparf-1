// src/shared/server/auth.ts
import { cookies } from 'next/headers';
import { api } from '@/shared/api/axios';
import type { User } from '@/shared/api/services/auth';

/** Токен читается только на сервере и никогда не передаётся в клиентские props. */
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value ?? null;
}

/**
 * Серверный запрос к /auth/me. Токен передаётся явно и не покидает сервер.
 * Держим этот код отдельно от клиентского api-сервиса, чтобы Bearer-заголовок
 * не попадал в клиентский bundle.
 */
export async function fetchMeServer(token: string): Promise<User> {
    const { data } = await api.get<User>('auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function getUserFromCookie(): Promise<User | null> {
    const token = await getAuthToken();
    if (!token) return null;

    try {
        return await fetchMeServer(token);
    } catch {
        return null;
    }
}
