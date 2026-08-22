'use client';

import { useTransition } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { createOrderFromCart } from '@/shared/api/services/orders';
import { calculateKnownTotal, formatCartTotal, hasRequestPriceItems } from '@/shared/lib/price';
import { useCartStore, type CartItemType } from '@/shared/store/useCartStore';
import { toast } from 'sonner';

interface Props {
    items: CartItemType[];
    token: string;
}

export default function CartSummary({ items, token }: Props) {
    const [isPending, startTransition] = useTransition();
    const { fetchCart } = useCartStore();
    const totalLabel = formatCartTotal(items);
    const hasRequestItems = hasRequestPriceItems(items);
    const knownTotal = calculateKnownTotal(items);

    const handleCheckout = () => {
        startTransition(async () => {
            try {
                const newOrder = await createOrderFromCart(token);
                await fetchCart(token);
                toast.success(`Заказ №${newOrder.orderNumber} успешно создан!`);
                window.location.href = '/orders';
            } catch (error) {
                console.error('Ошибка создания заказа:', error);
                toast.error('Ошибка при создании заказа');
            }
        });
    };

    return (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="text-xl font-semibold text-gray-900">Итого к оформлению</div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-950 sm:text-3xl">{totalLabel}</div>
                    {hasRequestItems && knownTotal > 0 && (
                        <div className="mt-1 text-sm text-slate-500">Есть позиции по запросу</div>
                    )}
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={isPending}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#f2c94c] text-lg font-bold text-slate-950 transition hover:bg-[#e5bc42] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? (
                    <>
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500/30 border-t-slate-900" />
                        Оформляем...
                    </>
                ) : (
                    <>
                        <ShoppingBag className="h-6 w-6" />
                        Оформить заказ
                        <ArrowRight className="h-5 w-5" />
                    </>
                )}
            </button>

            <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-[#f2c94c]" />
                    <span>{hasRequestItems && knownTotal <= 0 ? 'Стоимость уточняется по запросу.' : 'Итог рассчитан по текущим ценам корзины.'}</span>
                </div>
            </div>
        </div>
    );
}
