// app/not-found.tsx
import Link from 'next/link';
import {Button} from "@/shared/ui/button/ui/Button";

export default function NotFound() {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
            <img
                src="/404.png"
                alt="404"
                className="block m-auto mb-8 w-3xs"
            />
            <h1 className="text-3xl mb-4 font-bold mb-3">Страница не найдена</h1>
            <p className="text-gray-600 mb-6">
                Запрошенный адрес недоступен или был перемещён.
            </p>
            <div className="flex gap-3 justify-center">
                <Button >
                    <Link href="/catalog">
                        В каталог
                    </Link>
                </Button>
                <Button variant={'secondary'} >
                    <Link href="/">
                        На главную
                    </Link>
                </Button>
            </div>
        </section>
    );
}
