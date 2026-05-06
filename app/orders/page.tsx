// app/orders/page.tsx
import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/shared/server/auth';
import { getOrders } from '@/shared/api/services/orders';
import OrdersPageClient from './OrdersPageClient';

export default async function OrdersPage() {
    const user = await getUserFromCookie();
    if (!user) redirect('/auth/login');

    try {
        const orders = await getOrders(user.token);
        return <OrdersPageClient orders={orders} user={user} />;
    } catch (err: unknown) {
        // ✅ Безопасный доступ к ошибке
        if (err && typeof err === 'object' && 'response' in err) {
            const error = err as { response?: { status: number } };
            if (error.response?.status === 401 || error.response?.status === 403) {
                redirect('/auth/login');
            }
        }
        throw err;
    }
}
