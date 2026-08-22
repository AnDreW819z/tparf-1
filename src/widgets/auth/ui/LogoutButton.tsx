'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button/ui/Button';

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
        });

        router.refresh();
        router.push('/auth/login');
    }

    return (
        <Button variant="secondary" onClick={handleLogout}>
            Выйти
        </Button>
    );
}
