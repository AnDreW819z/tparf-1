// src/shared/server/auth.ts
import { cookies } from 'next/headers';
import { fetchMeServer, type UserWithToken } from '@/shared/api/services/auth';

export async function getUserFromCookie(): Promise<UserWithToken | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    try {
        const user = await fetchMeServer(token);
        return { ...user, token } as UserWithToken;
    } catch {
        return null;
    }
}