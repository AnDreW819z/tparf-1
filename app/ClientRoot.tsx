// app/ClientRoot.tsx
'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/shared/store/useUserStore';

interface ClientRootProps {
    children: React.ReactNode;
    token: string | null; // ✅ Принимаем token через props
}

export function ClientRoot({ children, token }: ClientRootProps) {
    const fetchUser = useUserStore((state) => state.fetchUser);
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        if (token) {
            // ✅ Вызываем fetchUser с token
            fetchUser(token);
        } else {
            // ✅ Если нет токена, очищаем user
            setUser(null);
        }
    }, [token, fetchUser, setUser]);

    return <>{children}</>;
}
