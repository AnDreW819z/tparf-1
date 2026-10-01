'use client';

import { useTransition } from 'react';
import { createOrderFromCart } from '@/shared/api/services/orders';
import { calculateKnownTotal, formatCartTotal, formatProductPrice, hasRequestPriceItems } from '@/shared/lib/price';
import { useCartStore, type CartItemType } from '@/shared/store/useCartStore';
import { toast } from 'sonner';

interface Props {
    items: CartItemType[];
    token: string;
    companyName?: string | null;
    inn?: string | null;
}

export default function CartSummary({ items, token, companyName, inn }: Props) {
    const [isPending, startTransition] = useTransition();
    const { fetchCart } = useCartStore();
    const totalLabel = formatCartTotal(items);
    const hasRequestItems = hasRequestPriceItems(items);
    const knownTotal = calculateKnownTotal(items);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const currencyCode = items.find((item) => item.currencyCode)?.currencyCode ?? 'RUB';
    // Цены в каталоге указаны с НДС 22%: выделяем налог из суммы
    const vat = Math.round(((knownTotal * 22) / 122) * 100) / 100;

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
        <aside aria-label="Итого" className="sticky top-6 flex flex-col gap-4 rounded-md border border-[var(--line)] p-6">
            <h2 className="m-0 text-xl font-semibold">Итого к оформлению</h2>

            <dl className="m-0 flex flex-col gap-2.5 text-[15px]">
                <div className="flex justify-between gap-3">
                    <dt className="text-[var(--muted)]">Товаров</dt>
                    <dd className="m-0">{itemCount} шт.</dd>
                </div>
                {knownTotal > 0 && (
                    <div className="flex justify-between gap-3">
                        <dt className="text-[var(--muted)]">В т. ч. НДС 22%</dt>
                        <dd className="m-0">{formatProductPrice(vat, currencyCode)}</dd>
                    </div>
                )}
                <div className="flex justify-between gap-3 border-t border-[#EDF0F3] pt-3 text-[22px] font-semibold">
                    <dt>Итого</dt>
                    <dd className="m-0 text-right">{totalLabel}</dd>
                </div>
            </dl>
            {hasRequestItems && knownTotal > 0 && (
                <p className="m-0 -mt-2 text-sm text-[var(--muted)]">Есть позиции по запросу — их цену подтвердит менеджер.</p>
            )}

            {(companyName || inn) && (
                <div className="flex flex-col gap-0.5 rounded bg-[var(--surface)] px-4 py-3.5 text-sm">
                    <span className="text-[var(--muted)]">Покупатель</span>
                    {companyName && <span className="font-semibold">{companyName}</span>}
                    {inn && (
                        <span className="text-[var(--muted)]">
                            ИНН <span className="font-mono text-[var(--ink)]">{inn}</span>
                        </span>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={handleCheckout}
                disabled={isPending}
                className="button-brand-primary flex h-[52px] w-full items-center justify-center text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending ? 'Оформляем…' : 'Оформить заказ'}
            </button>
            <p className="m-0 text-[13px] leading-normal text-[var(--muted)]">
                После оформления заказ появится в разделе «Заказы», там же можно следить за статусом.
            </p>
        </aside>
    );
}
