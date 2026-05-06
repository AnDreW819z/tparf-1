// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function resolveApiBaseUrl(request: Request) {
    const configuredBaseUrl =
        process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!configuredBaseUrl) {
        return null;
    }

    try {
        return new URL(configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`);
    } catch {
        return new URL(
            configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`,
            request.url
        );
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const apiBaseUrl = resolveApiBaseUrl(request);

    if (token && apiBaseUrl) {
        try {
            await fetch(new URL('auth/logout', apiBaseUrl), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });
        } catch {
        }
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('auth_token', '', {
        path: '/',
        expires: new Date(0),
    });
    return response;
}
