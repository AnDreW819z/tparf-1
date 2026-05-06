// src/shared/api/axios.ts
import axios from 'axios';

const isServer = typeof window === 'undefined';

export const api = axios.create({
    // На клиенте используем NEXT_PUBLIC_* (относительный URL через nginx)
    // На сервере (SSR) используем полный URL для Docker-сети
    baseURL: isServer
        ? (process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL)
        : process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

// Request interceptor - добавляет токен из cookie
api.interceptors.request.use((config) => {
    // Токен добавляется автоматически благодаря withCredentials: true
    return config;
});

// Response interceptor - обрабатывает 401 ошибки
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Перенаправление на логин при неавторизованном запросе
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);