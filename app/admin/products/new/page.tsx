import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/shared/server/auth';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { NewProductForm } from '@/features/admin/ui/NewProductForm';

export const metadata = { title: 'Новый товар' };

export default async function NewProductPage() {
    const user = await getUserFromCookie();
    if (!user?.token) redirect('/auth/login');
    if (!canAccessAdminPanel(user)) redirect('/');

    return <NewProductForm token={user.token} />;
}
