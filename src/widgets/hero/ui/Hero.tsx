import Link from 'next/link';

export function Hero() {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(120deg, #002E6D 0%, #1D5393 60%, #4162A9 100%)',
            }}
        >
            <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-[88px]">
                <div>
                    <span
                        className="mb-5 inline-block whitespace-nowrap rounded px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-blue)', background: 'var(--gold)' }}
                    >
                        Каталог оборудования ТПП РФ
                    </span>

                    <h1
                        className="mb-4.5 text-3xl font-black uppercase leading-tight text-white sm:text-4xl lg:text-[44px]"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Промышленное оборудование от проверенных поставщиков
                    </h1>

                    <p className="mb-7 max-w-[520px] text-base leading-relaxed sm:text-[17px]" style={{ color: '#d3ddef' }}>
                        Единый B2B-каталог для предприятий: техника, комплектующие и материалы с прямыми поставками
                        и поддержкой Торгово-промышленной палаты Российской Федерации.
                    </p>

                    <div className="flex flex-wrap gap-3.5">
                        <Link
                            href="/catalog"
                            className="inline-flex h-[52px] items-center justify-center rounded px-7 text-sm font-bold uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--primary-blue)', background: 'var(--gold)' }}
                        >
                            Перейти в каталог
                        </Link>
                        <Link
                            href="/search"
                            className="inline-flex h-[52px] items-center justify-center rounded border px-7 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white"
                            style={{ fontFamily: 'var(--font-display)', borderColor: '#6f8bbd' }}
                        >
                            Открыть поиск
                        </Link>
                    </div>
                </div>

                <div className="hidden lg:block">
                    <div
                        className="flex aspect-[4/3] items-center justify-center rounded-md border"
                        style={{
                            borderColor: 'rgba(255,255,255,0.25)',
                            backgroundImage:
                                'repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 14px)',
                        }}
                    >
                        <span className="font-mono text-[13px]" style={{ color: '#cfd9ea' }}>
                            изображение: промышленное оборудование
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
