import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .regex(/\d/, 'Пароль должен содержать хотя бы одну цифру'),
    companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
    // 10 цифр — юрлицо, 12 — ИП. Пробелы и дефисы из скопированного ИНН отбрасываем до проверки.
    inn: z.string()
        .transform((value) => value.replace(/\D/g, ''))
        .refine((value) => /^(\d{10}|\d{12})$/.test(value), 'ИНН должен содержать 10 цифр (организация) или 12 (ИП)'),
    confirm: z.string(),
    consent: z.boolean(),
}).refine((data) => data.password === data.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
}).refine((data) => data.consent, {
    message: 'Необходимо дать согласие на обработку персональных данных',
    path: ['consent'],
});

export const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Укажите пароль'),
});

export type RegisterSchema = typeof registerSchema;
export type LoginSchema = typeof loginSchema;
