import { api } from '@/shared/api/axios';

export type NewsItem = {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
};

export async function fetchNews(): Promise<NewsItem[]> {
    const { data } = await api.get<NewsItem[]>('news');
    return Array.isArray(data) ? data : [];
}

export async function fetchNewsById(id: string): Promise<NewsItem> {
    const { data } = await api.get<NewsItem>(`news/${id}`);
    return data;
}
