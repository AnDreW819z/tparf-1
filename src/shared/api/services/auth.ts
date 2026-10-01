import { api } from '@/shared/api/axios';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string };

export type RegisterPayload = {
    email: string;
    password: string;
    companyName: string;
    inn: string;
};

export type RegisterResponse = {
    token: string;
};

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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('auth/login', payload);
    return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('auth/register', payload);
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

export async function getCart(token: string): Promise<CartResponse> {
    const { data } = await api.get<CartResponse>('cart', {
        headers: { Authorization: `Bearer ${token}` },
    });
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

export type UserWithToken = User & {
    token: string;
};

export async function fetchMeServer(token: string): Promise<User> {
    const { data } = await api.get<User>('auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data;
}

export async function logout(): Promise<void> {
    await api.post('auth/logout');
}
