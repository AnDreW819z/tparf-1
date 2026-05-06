import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@/shared/server/auth';
import { canAccessAdminPanel } from '@/shared/lib/access';
import { AdminPageClient } from '@/features/admin/ui/AdminPageClient';

export const metadata = {
	title: 'Админ-панель',
};

export default async function AdminPage() {
	const user = await getUserFromCookie();

	if (!user?.token) {
		redirect('/auth/login');
	}

	if (!canAccessAdminPanel(user)) {
		redirect('/');
	}

	return <AdminPageClient user={user as typeof user & { token: string }} />;
}
