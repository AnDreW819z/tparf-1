import { api } from '@/shared/api/axios';

export type ConfirmEmailResponse = {
    message: string;
};

export type CartProduct = {
    id: string;
    name: string;
    sku: string;
    price: number;
    currencyCode: string;
    brandName?: string;
    images?: { imageUrl: string }[];
};

export type CartItem = {
    id: string;
    product: CartProduct;
    quantity: number;
    price: number;
    totalPrice: number;
};

export type CartResponse = {
    id: string;
    items: CartItem[];
    totalAmount: number;
    createdAt: string;
};

export async function resendConfirmation(email: string): Promise<{ message: string }> {
    // SMTP может отвечать дольше обычного — даём этому запросу больше времени.
    const { data } = await api.post<{ message: string }>(
        'auth/resend-confirmation',
        { email },
        { timeout: 30000 }
    );
    return data;
}

export async function confirmEmail(userId: string, token: string): Promise<ConfirmEmailResponse> {
    const { data } = await api.get<ConfirmEmailResponse>('auth/confirm-email', {
        params: {
            userId,
            token,
            redirectToFrontend: false,
        },
    });

    return data;
}

export async function confirmEmailByCode(code: string): Promise<ConfirmEmailResponse> {
    const { data } = await api.get<ConfirmEmailResponse>(`auth/confirm-email/code/${encodeURIComponent(code)}`);
    return data;
}

export type User = {
    id: string;
    email: string;
    companyName: string | null;
    inn: string | null;
    isActive: boolean;
    emailConfirmed: boolean;
    roles: string[];
    role?: string | null;
    brandIds: string[];
};

/** Клиентский запрос: BFF-прокси сам добавит Authorization из HttpOnly-cookie. */
export async function fetchMe(): Promise<User> {
    const { data } = await api.get<User>('auth/me');
    return data;
}

export async function logout(): Promise<void> {
    await api.post('auth/logout');
}
