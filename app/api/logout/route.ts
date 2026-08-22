import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const apiBaseUrl =
    process.env.API_BASE_URL_INTERNAL ||
    'http://localhost:7156/api/';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
        try {
            await fetch(new URL('auth/logout', apiBaseUrl), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });
        } catch {
            // Even if the backend logout call fails, we still clear the local session cookie.
        }
    }

    cookieStore.delete('auth_token');

    return NextResponse.json({ ok: true });
}
