import axios from 'axios';

const isServer = typeof window === 'undefined';
const clientApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/';
const serverApiBaseUrl =
    process.env.API_BASE_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://tparf-api.ru/api/';

export const api = axios.create({
    // Keep relative /api on the client so it works both through nginx and direct Next.js rewrites.
    // Use an absolute URL on the server for SSR inside Docker and local development.
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
