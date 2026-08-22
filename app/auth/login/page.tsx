import { LoginForm } from '@/features/auth/ui/LoginForm';

export const metadata = { title: 'Авторизация' };

export default function LoginPage() {
    return (
        <section className="bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Авторизация</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Войдите, чтобы продолжить работу с каталогом, корзиной и заказами.
                    </p>
                    <div className="mt-8">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
