import { create } from 'zustand';
import { fetchMeServer, type User } from '@/shared/api/services/auth';

type UserState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    fetchUser: (token: string) => Promise<void>; // ✅ Добавить token в параметры
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: false,
    error: null,
    setUser: (user) => set({ user }),
    fetchUser: async (token: string) => { // ✅ Принимаем token
        set({ loading: true, error: null });
        try {
            // ✅ Используем fetchMeServer с token
            const user = await fetchMeServer(token);
            set({ user, loading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки пользователя';
            set({ user: null, loading: false, error: errorMessage });
        }
    },
}));
