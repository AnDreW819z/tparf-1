// app/ClientRoot.tsx
'use client';
import { useEffect } from 'react';
import type { User } from '@/shared/api/services/auth';
import { useUserStore } from '@/shared/store/useUserStore';

interface ClientRootProps {
    children: React.ReactNode;
    initialUser: User | null;
}

export function ClientRoot({ children, initialUser }: ClientRootProps) {
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        // Пользователь пришёл из server component. Токен в браузер не передаётся:
        // запросы к API идут через BFF-прокси с HttpOnly-cookie.
        setUser(initialUser);
    }, [initialUser, setUser]);

    return <>{children}</>;
}
