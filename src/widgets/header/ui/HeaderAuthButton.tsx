'use client';

import Link from 'next/link';
import { Button } from '@/shared/ui/button/ui/Button';
import type { User } from '@/shared/api/services/auth';
import { canAccessAdminPanel } from '@/shared/lib/access';

interface HeaderAuthButtonProps {
	user: User | null;
}

export function HeaderAuthButton({ user }: HeaderAuthButtonProps) {
	const showAdminLink = canAccessAdminPanel(user);

	if (user) {
		return (
			<div className="flex items-center gap-2">
				{showAdminLink && (
					<Button variant="secondary">
						<Link href="/admin">Админка</Link>
					</Button>
				)}
				<Button>
					<Link href="/cart">Корзина</Link>
				</Button>
			</div>
		);
	}

	return (
		<Button>
			<Link href="/auth/login">Корзина</Link>
		</Button>
	);
}
