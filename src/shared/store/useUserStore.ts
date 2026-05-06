import { create } from 'zustand';
import { fetchMe, type User } from '@/shared/api/services/auth';

type UserState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: false,
    error: null,
    setUser: (user) => set({ user }),
    fetchUser: async () => {
        set({ loading: true, error: null });
        try {
            const user = await fetchMe();
            set({ user, loading: false });
        } catch (error: any) {
            set({ user: null, loading: false, error: error.message || 'Ошибка загрузки пользователя' });
        }
    },
}));
