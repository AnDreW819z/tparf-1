import { ConfirmEmailResult } from '@/widgets/auth/ui/ConfirmEmailResult';
import { confirmEmail } from '@/shared/api/services/auth';

export const metadata = {
    title: 'Подтверждение email',
};

type ConfirmEmailPageProps = {
    searchParams?: Promise<{
        userId?: string;
        token?: string;
        status?: string;
    }>;
};

type ConfirmationState = {
    title: string;
    description: string;
    success: boolean;
};

function getStateFromStatus(status?: string): ConfirmationState | null {
    if (status === 'success') {
        return {
            title: 'Email подтверждён',
            description: 'Адрес электронной почты подтверждён. Теперь вы можете войти и продолжить работу с площадкой.',
            success: true,
        };
    }

    if (status === 'error') {
        return {
            title: 'Не удалось подтвердить email',
            description: 'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.',
            success: false,
        };
    }

    return null;
}

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
    const params = (await searchParams) ?? {};
    let state = getStateFromStatus(params.status);

    if (!state && params.userId && params.token) {
        try {
            await confirmEmail(params.userId, params.token);
            state = {
                title: 'Email подтверждён',
                description: 'Адрес электронной почты подтверждён. Теперь вы можете войти и продолжить работу с площадкой.',
                success: true,
            };
        } catch {
            state = {
                title: 'Не удалось подтвердить email',
                description: 'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.',
                success: false,
            };
        }
    }

    if (!state) {
        state = {
            title: 'Некорректная ссылка подтверждения',
            description: 'В ссылке не хватает данных для подтверждения email. Откройте письмо ещё раз и перейдите по полной ссылке.',
            success: false,
        };
    }

    return <ConfirmEmailResult success={state.success} title={state.title} description={state.description} />;
}
