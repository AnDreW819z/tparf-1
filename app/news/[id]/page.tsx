import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { fetchNewsById } from '@/shared/api/services/news';

export const revalidate = 300;

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'long',
    }).format(new Date(value));
}

function getResponseStatus(error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
    ) {
        return (error as { response?: { status?: number } }).response?.status ?? null;
    }

    return null;
}

export default async function NewsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let newsItem;

    try {
        newsItem = await fetchNewsById(id);
    } catch (error) {
        if (getResponseStatus(error) === 404) {
            notFound();
        }

        throw error;
    }

    return (
        <section style={{ background: 'var(--gray-bg)' }}>
            <div className="mx-auto w-full max-w-[760px] px-6 pb-20 pt-10">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] transition-colors"
                    style={{ color: 'var(--blue-accent)' }}
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Назад к главной
                </Link>

                <article className="overflow-hidden rounded-md border border-[#e2e2e2] bg-white shadow-[0_8px_24px_rgba(0,46,109,0.08)]">
                    {newsItem.imageUrl && (
                        <div className="relative aspect-[16/9] w-full">
                            <Image
                                src={newsItem.imageUrl}
                                alt={newsItem.title}
                                fill
                                className="object-cover"
                                sizes="760px"
                            />
                        </div>
                    )}

                    <div className="p-8 sm:p-9">
                        <p className="mb-2.5 font-mono text-[12.5px] text-[#999]">
                            {formatDate(newsItem.createdAt)}
                        </p>

                        <h1 className="heading-1 mb-5.5 break-words text-2xl leading-tight">
                            {newsItem.title}
                        </h1>

                        <div className="max-w-none whitespace-pre-line break-words text-[15px] leading-[1.75] text-[#333]">
                            {newsItem.content}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
