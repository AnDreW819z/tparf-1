import Image from 'next/image';
import Link from 'next/link';

const catalogLinks = [
    { href: '/catalog', label: 'Все категории' },
    { href: '/search', label: 'Поиск по каталогу' },
];

const buyerLinks = [
    { href: '/auth/register', label: 'Регистрация компании' },
    { href: '/orders', label: 'Мои заказы' },
    { href: '/cart', label: 'Корзина' },
];

const columnTitle = 'mb-1 font-semibold text-white';
const linkClass = 'text-[#C7CED8] hover:text-white';

export function Footer() {
    return (
        <footer className="text-sm leading-relaxed" style={{ background: '#0F1B2D', color: '#C7CED8' }}>
            <div
                className="grid gap-8 px-7 pb-8 pt-12"
                style={{
                    width: 'var(--sheet-width)',
                    marginLeft: 'var(--sheet-left)',
                    boxSizing: 'border-box',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                }}
            >
                <div className="flex flex-col gap-3">
                    <Link href="/" aria-label="Торгово-промышленное агентство — на главную" className="self-start">
                        <Image src="/Logo.png" alt="Торгово-промышленное агентство" width={127} height={56} />
                    </Link>
                    <p className="max-w-[300px]">
                        Комплексное обеспечение предприятий на территории Российской Федерации и экспорт продукции на мировой рынок.
                    </p>
                </div>

                <nav aria-label="Каталог" className="flex flex-col gap-2">
                    <span className={columnTitle}>Каталог</span>
                    {catalogLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <nav aria-label="Покупателям" className="flex flex-col gap-2">
                    <span className={columnTitle}>Покупателям</span>
                    {buyerLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col gap-2">
                    <span className={columnTitle}>Контакты</span>
                    <a href="tel:+79607957523" className="font-semibold text-white hover:text-white">+7 (960) 795-75-23</a>
                    <a href="tel:+79618722751" className="font-semibold text-white hover:text-white">+7 (961) 872-27-51</a>
                    <a href="mailto:tpa@tparf.ru" className={linkClass}>tpa@tparf.ru</a>
                    <span>630132, г. Новосибирск, ул. Нарымская, д. 9</span>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #24324A' }}>
                <div
                    className="flex flex-wrap justify-between gap-x-6 gap-y-2 px-7 py-4 text-[13px]"
                    style={{ width: 'var(--sheet-width)', marginLeft: 'var(--sheet-left)', boxSizing: 'border-box', color: '#97A3B4' }}
                >
                    <span>© {new Date().getFullYear()} TPARF · Торгово-промышленное агентство</span>
                    <span>Цены указаны с НДС 22%</span>
                </div>
            </div>
        </footer>
    );
}
