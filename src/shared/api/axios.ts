import axios from 'axios';

const isServer = typeof window === 'undefined';

// Браузер всегда ходит в собственный BFF-прокси: токен лежит в HttpOnly-cookie,
// прокси добавляет Authorization на сервере. JWT в клиентский JS не попадает.
const clientApiBaseUrl = '/bff/';

// SSR/server actions ходят в API напрямую. В Docker это внутренний адрес,
// локально — адрес из .env. Секретный fallback на прод намеренно убран.
const serverApiBaseUrl = process.env.API_BASE_URL_INTERNAL || 'http://localhost:7156/api/';

export const api = axios.create({
    baseURL: isServer ? serverApiBaseUrl : clientApiBaseUrl,
    timeout: 10000,
    withCredentials: true,
});

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);
