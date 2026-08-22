import { RegisterForm } from '@/features/auth/ui/RegisterForm';

export const metadata = { title: 'Регистрация' };

export default function RegisterPage() {
    return (
        <section className="bg-slate-50">
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-3xl font-semibold text-slate-950">Регистрация</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        Создайте аккаунт компании, чтобы работать с каталогом, корзиной и корпоративными заказами.
                    </p>
                    <div className="mt-8">
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
