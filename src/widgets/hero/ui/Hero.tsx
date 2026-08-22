// src/widgets/hero/ui/Hero.tsx
'use client';

import Link from 'next/link';

export function Hero() {
    return (
        <section
            className="
        relative w-full
        overflow-hidden
        bg-[var(--primary-blue)]
        bg-[url('/Background.png')] bg-cover bg-center bg-no-repeat
      "
        >
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,32,55,0.92),rgba(20,32,55,0.76))]" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
                <div className="max-w-4xl">
                    <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                        Комплексное снабжение предприятий оборудованием
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                        На территории Российской Федерации, а также экспорт продукции на мировой рынок.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center justify-center h-11 rounded-full px-5 text-sm font-semibold button-primary transition-colors"
                        >
                            Перейти в каталог
                        </Link>
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center h-11 rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                        >
                            Открыть поиск
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
