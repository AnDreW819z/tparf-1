import { redirect } from 'next/navigation';
import { getCart } from '@/shared/api/services/cart';
import CartPageClient from './CartPageClient';
import { getUserFromCookie } from '@/shared/server/auth';

export default async function CartPage() {
    const user = await getUserFromCookie();
    if (!user || !user.token) {
        redirect('/auth/login');
    }

    const authenticatedUser = user as typeof user & { token: string };

    try {
        const cart = await getCart(authenticatedUser.token);
        return <CartPageClient cart={cart} user={authenticatedUser} />;
    } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
            redirect('/auth/login');
        }
        throw err;
    }
}
