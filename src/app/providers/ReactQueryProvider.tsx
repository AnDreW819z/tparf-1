'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // ⏱️ Данные считаются свежими 5 минут
                        staleTime: 5 * 60 * 1000,
                        // 🗑️ Кэш хранится 10 минут
                        gcTime: 10 * 60 * 1000,
                        // 🔄 Количество повторных попыток при ошибке
                        retry: 1,
                        // ⏳ Задержка между повторными попытками
                        retryDelay: 1000,
                    },
                    mutations: {
                        // ⏱️ Мутации не кэшируются
                        gcTime: 0,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools только в разработке */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
