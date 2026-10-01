import { z } from 'zod';

// Стандартные сообщения zod (неверный тип и т. п.) — на русском.
z.config(z.locales.ru());

export const registerSchema = z.object({
    email: z.string().trim()
        .min(1, 'Укажите email')
        .email('Некорректный email — проверьте, нет ли опечатки'),
    password: z.string()
        .min(1, 'Придумайте пароль')
        .min(8, 'Пароль должен быть не короче 8 символов')
        .regex(/\d/, 'Добавьте в пароль хотя бы одну цифру'),
    companyName: z.string().trim()
        .min(1, 'Укажите название компании')
        .min(2, 'Название компании — минимум 2 символа'),
    // 10 цифр — юрлицо, 12 — ИП. Пробелы и дефисы из скопированного ИНН отбрасываем до проверки.
    inn: z.string()
        .transform((value) => value.replace(/\D/g, ''))
        .superRefine((value, ctx) => {
            if (!value) {
                ctx.addIssue({ code: 'custom', message: 'Укажите ИНН' });
            } else if (!/^(\d{10}|\d{12})$/.test(value)) {
                ctx.addIssue({ code: 'custom', message: `ИНН должен содержать 10 цифр (организация) или 12 (ИП), сейчас ${value.length}` });
            }
        }),
    confirm: z.string().min(1, 'Повторите пароль'),
    consent: z.boolean(),
}).refine((data) => !data.confirm || data.password === data.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
}).refine((data) => data.consent, {
    message: 'Необходимо дать согласие на обработку данных',
    path: ['consent'],
});

export const loginSchema = z.object({
    email: z.string().trim()
        .min(1, 'Укажите email')
        .email('Некорректный email — проверьте, нет ли опечатки'),
    password: z.string().min(1, 'Укажите пароль'),
});

export type RegisterSchema = typeof registerSchema;
export type LoginSchema = typeof loginSchema;
