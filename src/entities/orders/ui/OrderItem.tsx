'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cancelOrder, type Order, type OrderItem as OrderItemType } from '@/shared/api/services/orders';
import { formatProductPrice, isRequestPrice } from '@/shared/lib/price';

interface OrderItemProps {
    order: Order;
    token: string;
}

export const ORDER_STATUS: Record<number, { label: string; bg: string; fg: string }> = {
    1: { label: 'Новый', bg: '#EAF0F8', fg: '#002E6D' },
    2: { label: 'В обработке', bg: '#FDF3DC', fg: '#7A4F00' },
    3: { label: 'Отгружен', bg: '#ECEBFB', fg: '#3B2F99' },
    4: { label: 'Доставлен', bg: '#E6F4EA', fg: '#1E6B3A' },
    5: { label: 'Отменён', bg: '#F2F3F5', fg: '#4B5563' },
};

function pluralizeLines(count: number) {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return 'позиций';
    if (mod10 === 1) return 'позиция';
    if (mod10 >= 2 && mod10 <= 4) return 'позиции';
    return 'позиций';
}

export default function OrderItem({ order, token }: OrderItemProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const status = ORDER_STATUS[order.status] ?? ORDER_STATUS[1];
    const defaultCurrency = order.items[0]?.currencyCode ?? 'RUB';
    const cancellable = order.status === 1 || order.status === 2;
    const date = new Intl.DateTimeFormat('ru-RU').format(new Date(order.createdAt));

    function handleCancel() {
        if (!window.confirm(`Отменить заказ ${order.orderNumber}?`)) return;
        startTransition(async () => {
            try {
                await cancelOrder(token, order.id);
                toast.success('Заказ отменён');
                router.refresh();
            } catch {
                toast.error('Не удалось отменить заказ');
            }
        });
    }

    return (
        <div className="border-b border-[#EDF0F3] last:border-b-0">
            <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                aria-expanded={isExpanded}
                className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 bg-white px-5 py-4 text-left text-[15px] text-[var(--ink)] hover:bg-[#FAFBFC]"
            >
                <span className="min-w-0 flex-[1_1_220px] font-mono font-medium">{order.orderNumber}</span>
                <span className="w-[110px] flex-none text-[#3D4757]">{date}</span>
                <span className="w-[110px] flex-none text-[#3D4757]">
                    {order.items.length} {pluralizeLines(order.items.length)}
                </span>
                <span className="w-[140px] flex-none text-right font-semibold">
                    {formatProductPrice(order.totalAmount, defaultCurrency)}
                </span>
                <span className="w-[140px] flex-none">
                    <span
                        className="inline-block rounded-[3px] px-2.5 py-1 text-[13px] font-medium"
                        style={{ background: status.bg, color: status.fg }}
                    >
                        {status.label}
                    </span>
                </span>
                <ChevronDown
                    className="h-[18px] w-[18px] flex-none text-[var(--muted)] transition-transform"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}
                    aria-hidden="true"
                />
            </button>

            {isExpanded && (
                <div className="px-5 pb-5">
                    {order.items.length > 0 ? (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="text-left text-[var(--muted)]">
                                    <th scope="col" className="border-b border-[#EDF0F3] py-2 pr-3 font-normal">Наименование</th>
                                    <th scope="col" className="border-b border-[#EDF0F3] px-3 py-2 text-right font-normal">Кол-во</th>
                                    <th scope="col" className="border-b border-[#EDF0F3] py-2 pl-3 text-right font-normal">Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: OrderItemType) => (
                                    <tr key={item.id}>
                                        <td className="border-b border-[#F2F4F7] py-2.5 pr-3">
                                            <Link href={`/product/${item.productId}`}>
                                                {item.productName || `Товар ${item.productId.slice(-8)}`}
                                            </Link>
                                            {item.brandName && <span className="text-[var(--muted)]"> · {item.brandName}</span>}
                                        </td>
                                        <td className="whitespace-nowrap border-b border-[#F2F4F7] px-3 py-2.5 text-right">
                                            {item.quantity} шт.
                                        </td>
                                        <td className="whitespace-nowrap border-b border-[#F2F4F7] py-2.5 pl-3 text-right">
                                            {isRequestPrice(item.unitPrice)
                                                ? 'уточняется'
                                                : formatProductPrice(item.totalPrice, item.currencyCode)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="py-4 text-center text-sm text-[var(--muted)]">В этом заказе нет товаров</p>
                    )}

                    {cancellable && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isPending}
                                className="h-10 rounded border border-[#E4B4AE] bg-white px-4 text-sm text-[#A3261A] hover:bg-red-50 disabled:opacity-50"
                            >
                                {isPending ? 'Отменяем…' : 'Отменить заказ'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
