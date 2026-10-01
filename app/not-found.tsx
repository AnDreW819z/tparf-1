// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <section className="mx-auto max-w-3xl px-4 py-18 text-center">
            <div className="placeholder-media mx-auto mb-8 flex h-[180px] w-[180px] items-center justify-center rounded-md border border-[#e2e2e2] sm:h-[220px] sm:w-[220px]">
                <span className="heading-1 text-5xl opacity-40 sm:text-6xl">404</span>
            </div>

            <h1 className="heading-1 mb-3.5 text-2xl sm:text-3xl">Страница не найдена</h1>
            <p className="mb-8 text-[15px] leading-relaxed text-[#6b6b6b]">
                Похоже, такой страницы не существует — она могла быть удалена или вы перешли по неверной ссылке.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
                <Link href="/catalog" className="button-brand-primary flex h-[46px] items-center justify-center px-6">
                    В каталог
                </Link>
                <Link href="/" className="button-brand-outline flex h-[46px] items-center justify-center px-6">
                    На главную
                </Link>
            </div>
        </section>
    );
}
