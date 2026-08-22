'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { Order, OrderItem as OrderItemType } from '@/shared/api/services/orders';
import { formatProductPrice, isRequestPrice } from '@/shared/lib/price';

interface OrderItemProps {
    order: Order;
}

const STATUS_LABELS: Record<number, string> = {
    1: 'Ожидание',
    2: 'Обработка',
    3: 'Отправлено',
    4: 'Доставлено',
    5: 'Отменено',
};

const STATUS_COLORS: Record<number, string> = {
    1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    3: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    4: 'bg-green-100 text-green-800 border-green-200',
    5: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrderItem({ order }: OrderItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusLabel = STATUS_LABELS[order.status];
    const statusClass = STATUS_COLORS[order.status];
    const defaultCurrency = order.items[0]?.currencyCode ?? 'RUB';
    const totalLabel = formatProductPrice(order.totalAmount, defaultCurrency);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div
                className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                            <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-500">Заказ #{order.orderNumber}</p>
                            <p className="text-2xl font-bold text-gray-900">{totalLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                            {statusLabel}
                        </span>
                        <button className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-100">
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            {order.items.map((item: OrderItemType) => {
                                const itemTotalLabel = formatProductPrice(item.totalPrice, item.currencyCode);
                                const unitLabel = formatProductPrice(item.unitPrice, item.currencyCode);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-all hover:shadow-sm"
                                    >
                                        {item.images[0] && (
                                            <Image
                                                src={item.images[0].imageUrl}
                                                width={100}
                                                height={100}
                                                alt={item.productName || 'Товар'}
                                                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/product/${item.productId}`}
                                                className="block truncate font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {item.productName || `ID: ${item.productId.slice(-8)}`}
                                            </Link>
                                            <p className="mt-1 text-sm text-gray-500">{item.brandName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">{itemTotalLabel}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} x {unitLabel}
                                            </p>
                                            {isRequestPrice(item.unitPrice) && (
                                                <p className="mt-1 text-xs text-gray-400">Стоимость уточняется</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {order.items.length === 0 && (
                            <div className="py-12 text-center text-gray-500">В этом заказе нет товаров</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
