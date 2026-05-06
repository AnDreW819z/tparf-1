// src/widgets/footer/ui/Footer.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-[#1B1B1B] text-[#D0D0D0]">
            <div className="mx-auto max-w-7xl px-4 py-8 grid gap-8 md:grid-cols-4">
                {/* Блок бренда */}
                <div className="space-y-3">
                    <Link href="/" aria-label="На главную" className="inline-flex items-center gap-2">
                        <Image
                            src="/Logo.png"
                            alt="Логотип"
                            width={140}
                            height={36}
                        />
                    </Link>
                    <p className="text-sm opacity-80">
                        Торгово‑промышленное агентство.
                    </p>
                </div>

                {/* Навигация */}
                <div>
                    <div className="font-medium mb-3">Разделы</div>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/catalog" className="hover:underline">Каталог</Link></li>
                        {/*<li><Link href="/about" className="hover:underline">О компании</Link></li>*/}
                        {/*<li><Link href="/contacts" className="hover:underline">Контакты</Link></li>*/}
                        {/*<li><Link href="/support" className="hover:underline">Поддержка</Link></li>*/}
                    </ul>
                </div>

                {/* Контакты */}
                <div>
                    <div className="font-medium mb-3">Контакты</div>
                    <ul className="space-y-2 text-sm">
                        <li>Тел.: +7 (960) 795-75-23</li>
                        <li>Тел.: +7 (961) 872-27-51</li>
                        <li>Email: tpa@tparf.ru</li>
                        <li>Адрес: 630132, Новосибирская область, город Новосибирск, Нарымская ул., д. 9, кв. 89</li>
                    </ul>
                </div>

                {/* Правовая информация */}
                <div>
                    <div className="font-medium mb-3">Информация</div>
                    {/*<ul className="space-y-2 text-sm">*/}
                    {/*    <li><Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link></li>*/}
                    {/*    <li><Link href="/terms" className="hover:underline">Пользовательское соглашение</Link></li>*/}
                    {/*    <li><Link href="/docs" className="hover:underline">Документы</Link></li>*/}
                    {/*</ul>*/}
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-4 text-xs opacity-80 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>© {new Date().getFullYear()} ООО «ТПА». Все права защищены.</span>
                    <span>Сайт разработан TPA</span>
                </div>
            </div>
        </footer>
    );
}
