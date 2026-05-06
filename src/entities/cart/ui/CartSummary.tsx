// src/entities/cart/ui/CartSummary.tsx
'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/shared/store/useCartStore';
import { createOrderFromCart } from '@/shared/api/services/orders';
import { toast } from 'sonner';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface Props {
    totalAmount: number;
    currencyCode?: string;
    token: string; // ✅ Добавляем token
}

export default function CartSummary({ totalAmount, currencyCode = 'RUB', token }: Props) {
    const [isPending, startTransition] = useTransition();
    const { fetchCart, setCart } = useCartStore();

    const handleCheckout = () => {
        startTransition(async () => {
            try {
                // ✅ 1. Создаем заказ из корзины
                const newOrder = await createOrderFromCart(token);

                // ✅ 2. Очищаем корзину
                await fetchCart(token);

                toast.success(`Заказ №${newOrder.orderNumber} успешно создан!`);

                // ✅ 3. Перенаправляем на страницу заказов
                window.location.href = `/orders`;
            } catch (error: unknown) {
                console.error('Ошибка создания заказа:', error);
                toast.error(error.response?.data?.message || 'Ошибка при создании заказа');
            }
        });
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
            {/* Итоговая сумма */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-xl font-semibold text-gray-900">Итого к оплате</div>
                <div className="text-3xl font-bold text-blue-600">
                    {totalAmount.toLocaleString('ru-RU')} {currencyCode}
                </div>
            </div>

            {/* ✅ Кнопка оформления заказа */}
            <button
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
                {isPending ? (
                    <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Оформляем...
                    </>
                ) : (
                    <>
                        <ShoppingBag className="h-6 w-6" />
                        Оформить заказ
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            {/* Информация о заказе */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Сумма заказа &quot;{totalAmount.toLocaleString('ru-RU')}&quot; {currencyCode}</span>
                </div>
            </div>
        </div>
    );
}
