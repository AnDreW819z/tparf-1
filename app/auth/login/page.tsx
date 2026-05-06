import { LoginForm } from '@/features/auth/ui/LoginForm';

export const metadata = { title: 'Авторизация' };

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Авторизация</h1>
      <LoginForm />
    </section>
  );
}
