import Image from 'next/image';
import Link from 'next/link';
import s from './Footer.module.css';

const catalogLinks = [
    { href: '/catalog', label: 'Все категории' },
    { href: '/search', label: 'Поиск по каталогу' },
];

const buyerLinks = [
    { href: '/auth/register', label: 'Регистрация компании' },
    { href: '/orders', label: 'Мои заказы' },
    { href: '/cart', label: 'Корзина' },
];

export function Footer() {
    return (
        <footer className={`${s.footer} text-sm leading-relaxed`}>
            <div className={`${s.side} ${s.sideLeft}`} aria-hidden="true" />
            <div className={`${s.side} ${s.sideRight}`} aria-hidden="true" />

            <div className={s.panel}>
                <span className={`${s.fold} ${s.foldLeft}`} aria-hidden="true" />
                <span className={`${s.fold} ${s.foldRight}`} aria-hidden="true" />

                <div className={s.grid}>
                    <div className={s.column}>
                        <Link href="/" aria-label="Торгово-промышленное агентство — на главную" className="self-start">
                            <Image src="/Logo.png" alt="Торгово-промышленное агентство" width={127} height={56} />
                        </Link>
                        <p className={s.about}>
                            Комплексное обеспечение предприятий на территории Российской Федерации и экспорт продукции на мировой рынок.
                        </p>
                    </div>

                    <nav aria-label="Каталог" className={s.column}>
                        <span className={s.title}>Каталог</span>
                        {catalogLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={s.link}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <nav aria-label="Покупателям" className={s.column}>
                        <span className={s.title}>Покупателям</span>
                        {buyerLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={s.link}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={s.column}>
                        <span className={s.title}>Контакты</span>
                        <a href="tel:+79607957523" className={s.phone}>+7 (960) 795-75-23</a>
                        <a href="tel:+79618722751" className={s.phone}>+7 (961) 872-27-51</a>
                        <a href="mailto:tpa@tparf.ru" className={s.link}>tpa@tparf.ru</a>
                        <span>630132, г. Новосибирск, ул. Нарымская, д. 9</span>
                    </div>
                </div>

                <div className={s.bottom}>
                    <span>© {new Date().getFullYear()} TPARF · Торгово-промышленное агентство</span>
                    <span>Цены указаны с НДС 22%</span>
                </div>
            </div>
        </footer>
    );
}
