// src/widgets/hero/ui/Hero.tsx
'use client';
import Link from 'next/link';

export function Hero() {
    return (
        <section
            className="
        relative w-full
        bg-[url('/Background.png')] bg-cover bg-center bg-no-repeat
      "
        >
            {/* затемнение для читаемости текста (по желанию) */}
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
                <h1 className="max-w-4xl text-white text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    Профессиональные инструменты и оборудование для строительства, ремонта и производства
                </h1>

                <div className="mt-8">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center justify-center h-12 px-6 rounded-md button-primary transition-colors"
                    >
                        Перейти в каталог
                    </Link>
                </div>
            </div>
        </section>
    );
}
