import { ConfirmEmailResult } from '@/widgets/auth/ui/ConfirmEmailResult';
import { confirmEmailByCode } from '@/shared/api/services/auth';

export const metadata = {
    title: 'Подтверждение email',
};

type ConfirmEmailByCodePageProps = {
    params: Promise<{
        code: string;
    }>;
};

export default async function ConfirmEmailByCodePage({ params }: ConfirmEmailByCodePageProps) {
    const { code } = await params;

    let success = false;
    let title = 'Не удалось подтвердить email';
    let description =
        'Ссылка недействительна, устарела или уже была использована. Попробуйте запросить новое письмо подтверждения.';

    try {
        await confirmEmailByCode(code);
        success = true;
        title = 'Email успешно подтверждён';
        description = 'Регистрация завершена. Теперь вы можете войти на площадку и продолжить работу.';
    } catch {
        success = false;
    }

    return <ConfirmEmailResult success={success} title={title} description={description} />;
}
