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

export default async function NewsDetailsPage({ params }: { params: { id: string } }) {
    let newsItem;

    try {
        newsItem = await fetchNewsById(params.id);
    } catch (error) {
        if (getResponseStatus(error) === 404) {
            notFound();
        }

        throw error;
    }

    return (
        <section className="bg-slate-50">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к главной
                </Link>

                <article className="mt-5 w-full max-w-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
                    <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                        {formatDate(newsItem.createdAt)}
                    </p>

                    <h1 className="mt-4 break-words text-3xl font-semibold text-slate-950 sm:text-4xl">
                        {newsItem.title}
                    </h1>

                    {newsItem.imageUrl && (
                        <div className="relative mt-6 h-[240px] w-full overflow-hidden rounded-[1.5rem] bg-slate-100 sm:h-[320px] lg:h-[420px]">
                            <Image
                                src={newsItem.imageUrl}
                                alt={newsItem.title}
                                fill
                                className="object-cover"
                                sizes="(min-width:1024px) 960px, 100vw"
                            />
                        </div>
                    )}

                    <div className="mt-6 max-w-4xl whitespace-pre-line break-words text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
                        {newsItem.content}
                    </div>
                </article>
            </div>
        </section>
    );
}
