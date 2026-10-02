'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageWithFallback } from '@/shared/ui/image/ImageWithFallback';

type ProductGalleryImage = {
    id: string;
    imageUrl: string;
    isMain: boolean;
    sortOrder: number;
};

interface ProductGalleryProps {
    images: ProductGalleryImage[];
    alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
    const ordered = useMemo(
        () =>
            [...images].sort(
                (a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder,
            ),
        [images],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const thumbnailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setActiveIndex(0);
    }, [ordered.length]);

    const activeImage = ordered[activeIndex];

    const moveSelection = (direction: 1 | -1) => {
        if (ordered.length === 0) return;

        setActiveIndex((current) => {
            const next = current + direction;
            if (next < 0) return ordered.length - 1;
            if (next >= ordered.length) return 0;
            return next;
        });
    };

    const scrollThumbnails = (offset: number) => {
        thumbnailsRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
    };

    return (
        <div className="min-w-0 w-full max-w-full space-y-4">
            <div className="min-w-0 w-full max-w-full rounded-md border border-[#e2e2e2] bg-white p-3">
                <div className="relative mx-auto aspect-square w-full max-w-full overflow-hidden rounded bg-[var(--gray-bg)] p-3 lg:max-h-[460px]">
                    <ImageWithFallback
                        src={activeImage?.imageUrl}
                        alt={alt}
                        fill
                        className="photo-blend max-w-full object-contain p-3"
                        sizes="(min-width:1024px) 50vw, 100vw"
                    />

                    {ordered.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => moveSelection(-1)}
                                className="button-brand-primary absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full p-0 sm:h-11 sm:w-11"
                                aria-label="Предыдущее изображение"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveSelection(1)}
                                className="button-brand-primary absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full p-0 sm:h-11 sm:w-11"
                                aria-label="Следующее изображение"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {ordered.length > 1 && (
                <div className="min-w-0 w-full max-w-full rounded-md border border-[#e2e2e2] bg-white p-3">
                    <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0 text-sm font-medium text-slate-700">Галерея</div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => scrollThumbnails(-180)}
                                className="button-brand-secondary flex h-9 w-9 items-center justify-center rounded-full p-0"
                                aria-label="Прокрутить миниатюры назад"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollThumbnails(180)}
                                className="button-brand-secondary flex h-9 w-9 items-center justify-center rounded-full p-0"
                                aria-label="Прокрутить миниатюры вперед"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div ref={thumbnailsRef} className="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
                        {ordered.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={[
                                    'relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white p-1.5 sm:h-20 sm:w-20 sm:p-2',
                                    activeIndex === index
                                        ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]'
                                        : 'border-slate-200',
                                ].join(' ')}
                                aria-label={`Показать изображение ${index + 1}`}
                            >
                                <ImageWithFallback
                                    src={image.imageUrl}
                                    alt={alt}
                                    fill
                                    className="photo-blend max-w-full object-contain p-1"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
