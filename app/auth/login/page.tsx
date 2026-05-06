import { LoginForm } from '../../../src/features/auth/ui/LoginForm';

export const metadata = { title: 'Авторизация' };

export default function LoginPage() {
  return (
    <main>
      <h1>Вход в аккаунт</h1>
      <LoginForm />
    </main>
  );
}