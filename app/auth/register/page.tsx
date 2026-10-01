import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import { AuthCard } from '@/widgets/auth/ui/AuthCard';

export const metadata = { title: 'Регистрация компании' };

export default function RegisterPage() {
    return (
        <AuthCard
            active="register"
            title="Регистрация компании"
            subtitle="Каталог работает с юрлицами и ИП. После регистрации подтвердите email."
        >
            <RegisterForm />
        </AuthCard>
    );
}
