import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const apiBaseUrl = (process.env.API_BASE_URL_INTERNAL || 'http://localhost:7156/api/').replace(/\/+$/, '');

const FORBIDDEN_AUTH_PATHS = new Set(['login', 'register']);

type RouteContext = {
    params: Promise<{ path: string[] }>;
};

/**
 * BFF-прокси: браузер ходит сюда без токена, а роут-хендлер добавляет
 * Authorization из HttpOnly-cookie. Так JWT не попадает в клиентский JS.
 *
 * Логин и регистрация намеренно запрещены: эти ручки возвращают токен в теле,
 * а с ними работают только server actions, которые кладут его в HttpOnly-cookie.
 */
async function proxy(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;

    if (!path?.length) {
        return Response.json({ message: 'Не указан путь запроса' }, { status: 404 });
    }

    if (isForbiddenAuthPath(path)) {
        return Response.json({ message: 'Этот endpoint доступен только через сервер приложения' }, { status: 404 });
    }

    if (path.some((segment) => !segment || segment === '..' || segment.includes('/') || segment.includes('\\'))) {
        return Response.json({ message: 'Некорректный путь запроса' }, { status: 400 });
    }

    const target = `${apiBaseUrl}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    const accept = request.headers.get('accept');
    if (contentType) headers.set('content-type', contentType);
    if (accept) headers.set('accept', accept);

    const token = request.cookies.get('auth_token')?.value;
    if (token) {
        headers.set('authorization', `Bearer ${token}`);
    }

    let body: ArrayBuffer | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
    }

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
            redirect: 'manual',
        });
    } catch {
        return Response.json(
            { message: 'Сервер временно недоступен. Попробуйте позже' },
            { status: 502 },
        );
    }

    const responseHeaders = new Headers();
    for (const name of ['content-type', 'content-disposition', 'location']) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders.set(name, value);
    }

    const noBody = upstream.status === 204 || upstream.status === 304;
    return new Response(noBody ? null : upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    });
}

function isForbiddenAuthPath(path: string[]) {
    if (path[0]?.toLowerCase() !== 'auth') return false;
    const action = path[1]?.toLowerCase();
    return action !== undefined && FORBIDDEN_AUTH_PATHS.has(action);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
