import { LoginForm } from '@/features/auth/ui/LoginForm';
import { AuthCard } from '@/widgets/auth/ui/AuthCard';

export const metadata = { title: 'Вход' };

export default function LoginPage() {
    return (
        <AuthCard active="login" title="Вход" subtitle="Для уже зарегистрированных компаний">
            <LoginForm />
        </AuthCard>
    );
}
